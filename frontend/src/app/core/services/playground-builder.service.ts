import {Injectable} from '@angular/core';
import {ModelBuilderService} from './model-builder.service';
import {NonNullableFormBuilder} from '@angular/forms';
import {Builder} from '../interfaces/project';
import * as tf from '@tensorflow/tfjs';
import {LayerType} from '../enums';

@Injectable({
  providedIn: 'root'
})
export class PlaygroundBuilderService extends ModelBuilderService {
  constructor(protected override fb: NonNullableFormBuilder) {
    super(fb);
  }

  override async initialize(builder?: any): Promise<void> {
    this.isInitialized = false;
    this.clearLayers();

    const defaultBuilder = builder || {
      layers: [{type: LayerType.Input}, {type: LayerType.Output}],
      connections: [],
      nextLayerId: 1
    };

    this.setupSvg();
    await tf.ready();
    this.isInitialized = true;
    this.loadFromBuilder(defaultBuilder);
  }

  override generateBuilderJSON(): Builder {
    return super.generateBuilderJSON();
  }

  override async generateModel(reuseWeights: boolean = false): Promise<tf.LayersModel | null> {
    return super.generateModel(false);
  }

  override async clearModelBuilder(): Promise<void> {
    this.isInitialized = false;
    await this.initialize({
      layers: [{type: LayerType.Input}, {type: LayerType.Output}],
      connections: [],
      nextLayerId: 1
    });
  }
} 