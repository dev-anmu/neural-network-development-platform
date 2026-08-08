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

  override async initialize(
    builder?: Builder,
    canvas?: { svgContainer: Element, innerSvg: Element },
  ): Promise<void> {
    this.isInitialized = false;
    this.clearLayers();

    const defaultBuilder = builder || {
      layers: [{type: LayerType.Input}, {type: LayerType.Output}],
      connections: [],
      nextLayerId: 1
    };

    await super.initialize(defaultBuilder, canvas);
  }

  override generateBuilderJSON(): Builder {
    return super.generateBuilderJSON();
  }

  override async generateModel(_reuseWeights: boolean = false): Promise<tf.LayersModel | null> {
    return super.generateModel(false);
  }

  override async clearModelBuilder(): Promise<void> {
    await this.initialize({
      layers: [{type: LayerType.Input}, {type: LayerType.Output}],
      connections: [],
      nextLayerId: 1
    });
  }
} 