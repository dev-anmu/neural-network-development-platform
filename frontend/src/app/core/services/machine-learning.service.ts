import {Injectable} from '@angular/core';
import * as tf from "@tensorflow/tfjs";
import '@tensorflow/tfjs-backend-webgpu';
import '@tensorflow/tfjs-backend-wasm';
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm';
setWasmPaths(new URL('assets/wasm/', document.baseURI).toString());
import {BehaviorSubject} from "rxjs";
import {TrainStats, XY} from "../interfaces/interfaces";
import {ProjectService} from "./project.service";
import {MatDialog} from "@angular/material/dialog";
import {MessageDialogComponent} from "../../shared/components/message-dialog/message-dialog.component";
import {optimizers} from "../../shared/ml_objects/optimizers";
import {losses} from "../../shared/ml_objects/losses";
import {ModelBuilderService} from "./model-builder.service";
import {EncoderEnum} from "../enums";
import {Tensor} from "@tensorflow/tfjs";
import {DataFrame} from "danfojs";
import {
  buildLineChartOptions,
  plotSeriesColors,
  polishVegaChart,
  preparePlotContainer,
  PLOT_SERIES_LABELS,
} from "../../shared/utils/tfvis-theme";

export interface TrainingPlotTargets {
  loss?: HTMLElement | null;
  accuracy?: HTMLElement | null;
}

@Injectable({
  providedIn: 'root'
})
export class MachineLearningService {
  stopTrainingFlag: boolean = false;
  timer: any;
  trainingTime: number = 0;
  trainingStats: TrainStats = {epoch: 0, accuracy: undefined, loss: undefined, progress: 0, time: 0};
  trainingStatsSubject: BehaviorSubject<TrainStats> = new BehaviorSubject<TrainStats>(this.trainingStats);
  trainingInProgressSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private projectService: ProjectService,
              private modelBuilderService: ModelBuilderService,
              public dialog: MatDialog) {
  }

  stopTraining(): void {
    this.stopTrainingFlag = true;
  }

  startTimer() {
    this.trainingTime = 0;
    this.timer = setInterval(() => {
      this.trainingTime++;
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timer);
  }

  async trainingReady(): Promise<{ dataset: boolean, model: boolean }> {
    const builder = this.projectService.builder();
    const hasTopology = (builder.connections?.length ?? 0) > 0;
    const modelReady = !!this.projectService.model() || hasTopology;
    const datasetReady = this.projectService.dataset().data.length > 0;
    return {dataset: datasetReady, model: modelReady}
  }

  private async ensureModelIsBuilt(): Promise<void> {
    if (this.projectService.model()) {
      return;
    }
    const builder = this.projectService.builder();
    if (!builder.connections?.length) {
      return;
    }
    if (!this.modelBuilderService.hasPopulatedLayerMap()) {
      this.modelBuilderService.syncFromBuilderState(builder);
    }
    const parameter = this.projectService.trainConfig();
    const model = await this.modelBuilderService.generateModel(!parameter.useExistingWeights);
    this.projectService.model.set(model);
  }

  normalize(data: tf.Tensor) {
    const dataMax = data.max();
    const dataMin = data.min();
    return data.sub(dataMin).div(dataMax.sub(dataMin));
  }

  compile(): void {
    const parameter = this.projectService.trainConfig();
    const optimizer = optimizers.get(parameter.optimizer)?.function!;
    const loss = losses.get(parameter.loss)?.function;
    this.projectService.model()?.compile({
      optimizer: optimizer(parameter.learningRate),
      loss: loss,
      metrics: ['accuracy',  tf.metrics.recall]
    });
  }

  predict(X: Tensor): string {
    try {
      // todo: input with comma separated values?
      // todo: + rnd example ?
      // show
      this.compile();
      const result = this.projectService.model()?.predict(X) as tf.Tensor2D;
      return result?.dataSync()[0].toString();
    } catch (e: any) {
      this.dialog.open(MessageDialogComponent, {
        maxWidth: '600px',
        data: {
          title: 'Predicting Failed',
          message: e.message,
          warning: true
        }
      });
      return "-";
    }
  }

  updateWeights(): void {
    const model = this.projectService.model();
    if (model) {
      const builder = this.modelBuilderService.updateWeights(model);
      this.projectService.builder.set(builder);
    }
  }

  reshapeTensors(tensor: Tensor): Tensor|false {
    try {
      const shape = this.modelBuilderService.getDataInputShape();
      return tensor.reshape([tensor.shape[0], ...shape]);
    } catch {
      return false;
    }
  }

  async extractFeaturesAndTargets(df: DataFrame): Promise<[Tensor, Tensor]> {
    const dataset = this.projectService.dataset();
    const inputColumns: string[] = dataset.inputColumns;
    const targetColumns = this.resolveTargetColumns(df, dataset.targetColumns);

    const dfInputColumns = df.columns.filter((column: string) => inputColumns.includes(column.split('_')[0]));

    const inputs = df.loc({columns: dfInputColumns});
    const targets = df.loc({columns: targetColumns});

    return [inputs.tensor, targets.tensor];
  }

  private resolveTargetColumns(df: DataFrame, targetColumns: string[]): string[] {
    const dataset = this.projectService.dataset();
    const resolved: string[] = [];

    for (const column of targetColumns) {
      const meta = dataset.columns.find((entry) => entry.name === column);
      if (meta?.encoding === EncoderEnum.onehot) {
        resolved.push(...df.columns.filter((name) => name.startsWith(`${column}_`)));
      } else if (df.columns.includes(column)) {
        resolved.push(column);
      }
    }

    return resolved;
  }

  async train(X: Tensor, Y: Tensor, plotTargets: TrainingPlotTargets = {}): Promise<any> {
    await this.ensureModelIsBuilt();
    const parameter = this.projectService.trainConfig();
    if (!parameter.useExistingWeights) {
      const model = await this.modelBuilderService.generateModel(parameter.useExistingWeights);
      this.projectService.model.set(model);
    }

    const EPOCHS = parameter.epochs;
    const BATCH_SIZE = parameter.batchSize;
    const VALIDATION_SPLIT = parameter.validationSplit;
    const SHUFFLE = parameter.shuffle;
    const YIELD_EVERY = 'auto';
    const BATCHES_PER_EPOCH = Math.ceil(X.shape[0] / BATCH_SIZE);
    const TOTAL_NUM_BATCHES = EPOCHS * BATCHES_PER_EPOCH;

    const fitCallback = new tf.CustomCallback({
      onTrainBegin: async (_logs?: tf.Logs) => {
        this.startTimer();
        this.trainingStatsSubject.next({epoch: 0, accuracy: undefined, loss: undefined, progress: 0, time: 0});
        this.trainingInProgressSubject.next(true);
      },
      onTrainEnd: async (_logs?: tf.Logs) => {
        this.stopTimer();
        this.trainingStats.progress = 100;
        this.trainingStats.time = this.trainingTime;
        this.trainingStatsSubject.next(this.trainingStats);
        this.trainingInProgressSubject.next(false);
      },
      onYield: async (epoch: number, batch: number, logs?: tf.Logs) => {
        const progress = (epoch * BATCHES_PER_EPOCH + batch) / TOTAL_NUM_BATCHES * 100;
        this.trainingStats = {
          epoch: epoch + 1,
          accuracy: logs!['acc'],
          loss: logs!['loss'],
          progress: progress,
          time: this.trainingTime
        }
        this.trainingStatsSubject.next(this.trainingStats);
        this.projectService.model()!.stopTraining = this.stopTrainingFlag;
        this.stopTrainingFlag = false;
      }
    }, YIELD_EVERY);
    const callbacks: any[] = [fitCallback];

    if (parameter.lossPlot) {
      this.addLivePlotCallback(callbacks, plotTargets.loss, ['loss', 'val_loss'], 'Loss');
    }

    if (parameter.accuracyPlot) {
      this.addLivePlotCallback(callbacks, plotTargets.accuracy, ['acc', 'val_acc'], 'Accuracy');
    }
    
    if (parameter.earlyStopping) {
      callbacks.push(tf.callbacks.earlyStopping({monitor: 'val_acc', patience: 5}));
    }

    try {
      this.compile();

      // todo: use fitDataset instead for more memory-efficiency?
      const history = await this.projectService.model()?.fit(X, Y, {
        batchSize: BATCH_SIZE,
        validationSplit: VALIDATION_SPLIT,
        epochs: EPOCHS,
        callbacks: callbacks,
        shuffle: SHUFFLE,
      });
      return history;
    } catch (e: any) {
      this.dialog.open(MessageDialogComponent, {
        maxWidth: '600px',
        data: {
          title: 'Training Failed',
          message: e.message,
          warning: true
        }
      });
    }
  }

  async setTfBackend(backend: string): Promise<boolean> {
    await tf.setBackend(backend);
    await tf.ready();
    return tf.getBackend() === backend;
  }

  async showHistory(htmlContainer: HTMLElement, history: any): Promise<void> {
    if (history.history['loss'] && history.history['val_loss']) {
      await this.renderPlot(htmlContainer, [this.mapHistoryRecord(history.history['loss']), this.mapHistoryRecord(history.history['val_loss'])], ['Training', 'Validation'], {
        xLabel: 'Epoch',
        yLabel: 'Loss'
      });
    }

    if (history.history['acc'] && history.history['val_acc']) {
      await this.renderPlot(htmlContainer, [this.mapHistoryRecord(history.history['acc']), this.mapHistoryRecord(history.history['val_acc'])], ['Training', 'Validation'], {
        xLabel: 'Epoch',
        yLabel: 'Accuracy'
      });
    }
  }

  async renderPlot(htmlContainer: HTMLElement, values: XY[][], series: string[], options: {
    xLabel: string,
    yLabel: string,
    width?: number
  }): Promise<void> {
    const tfvis = await import('@tensorflow/tfjs-vis');

    preparePlotContainer(htmlContainer);

    const data = {
      values: values,
      series: series
    };

    await tfvis.render.linechart(htmlContainer, data, buildLineChartOptions(htmlContainer, {
      width: options.width,
      xLabel: options.xLabel,
      yLabel: options.yLabel,
      seriesColors: plotSeriesColors(values.length),
    }));
    polishVegaChart(htmlContainer);
  }

  private addLivePlotCallback(
    callbacks: any[],
    container: HTMLElement | null | undefined,
    metrics: [string, string],
    yLabel: string,
  ): void {
    if (!container) {
      return;
    }

    preparePlotContainer(container);
    const epochLogs: Record<string, number>[] = [];
    const series = [...PLOT_SERIES_LABELS];

    callbacks.push(new tf.CustomCallback({
      onEpochEnd: async (_epoch, logs) => {
        if (!logs) {
          return;
        }
        epochLogs.push(logs as Record<string, number>);
        const values = metrics.map((metric) =>
          epochLogs.map((entry, index) => ({
            x: index,
            y: entry[metric] ?? 0,
          }))
        );
        await this.renderPlot(container, values, series, {xLabel: 'Epoch', yLabel});
      },
    }));
  }
  
  // Helper function needed by showHistory
  private mapHistoryRecord(history: number[]): { x: number, y: number }[] {
    return history.map((value: number, epoch: number) => ({x: epoch, y: value}));
  }
}
