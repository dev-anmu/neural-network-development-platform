import {Injectable} from '@angular/core';
import {Layer} from "../../shared/layer";
import * as tf from "@tensorflow/tfjs";
import {BehaviorSubject, Observable} from "rxjs";
import {Connection} from "../../shared/connection";
import {Input} from "../../shared/layer/input";
import {Output} from "../../shared/layer/output";
import {Selection} from "d3";
import * as d3 from "d3";


@Injectable({
  providedIn: 'root'
})
export class ModelBuilderService {
  layerList: Layer[] = [];
  inputLayer: Input | null = null;
  outputLayer: Output | null = null;
  selectedLayer: Layer | null = null;
  activeConnection: Connection | null = null;
  selectedLayerSubject: BehaviorSubject<Layer | null> = new BehaviorSubject<Layer | null>(null);
  activeConnectionSubject: BehaviorSubject<Connection | null> = new BehaviorSubject<Connection | null>(null);

  constructor() {
    this.selectedLayerSubject.subscribe((layer) => {
      this.selectedLayer?.unselect();
      this.selectedLayer = layer;
    });
    this.activeConnectionSubject.subscribe((connection) => {
      this.activeConnection = connection;
    })
  }

  initialize() {
    const svg: Selection<any, any, any, any> = d3.select("#svg-container");
    const svgWidth = svg.node().getBoundingClientRect().width;
    const svgHeight = svg.node().getBoundingClientRect().height;

    svg.on("click", (event: any) => this.unselect(event))
      .call(d3.zoom().scaleExtent([0.4, 1.1])
        .translateExtent([[-svgWidth, -svgHeight], [2 * svgWidth, 2 * svgHeight]])
        .on('zoom', (event: any) => {
          d3.select("#inner-svg-container").attr('transform', event.transform);
        }));
    this.inputLayer = new Input(this);
    this.outputLayer = new Output(this);
    this.layerList.push(this.inputLayer, this.outputLayer);
  }


  unselect(event: any) {
    event.stopPropagation();
    this.selectedLayerSubject.next(null);
  }

  addToLayerList(layer: Layer) {
    this.layerList.push(layer);
  }

  getLayers() {
    return this.layerList;
  }

  clearLayerList() {
    this.layerList = [];
    return this.layerList;
  }

  getSelectedLayer() {
    return this.selectedLayer;
  }

  async printModelSummary() {
    await tf.ready();
    const input = this.inputLayer?.tfjsLayer({shape: [32]});

    let layer: Layer|null|undefined = this.inputLayer;
    let hidden = input;

    while (layer?.getNextLayer()) {
      const nextLayer = layer?.getNextLayer();
      hidden = nextLayer?.tfjsLayer(nextLayer?.getParameters()).apply(hidden);
      layer = nextLayer;
    }

    const model = tf.model({inputs: input, outputs: hidden});
    console.log(model.summary());
  }
}
