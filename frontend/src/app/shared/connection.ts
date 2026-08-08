import * as d3 from "d3";
import {Layer} from "./layer";

export class Connection {
  private readonly source: Layer;
  private destination: Layer | null = null;
  private connection: d3.Selection<any, any, any, any> | null = null;

  constructor(source: Layer, destination: Layer | null) {
    this.source = source;
    this.destination = destination;
    if (source.getModelBuilder().isHeadless()) {
      return;
    }
    const sourceAnchor = this.source.getOutputAnchorPosition();
    const destinationAnchor = this.destination?.getInputAnchorPosition();
    const svg = this.source.getModelBuilder().selectInnerSvg();

    this.connection = svg.append("line")
      .classed("connection", true)
      .attr("x1", sourceAnchor.x)
      .attr("y1", sourceAnchor.y)
      .attr("x2", sourceAnchor.x)
      .attr("y2", sourceAnchor.y)
      .lower();

    if(destinationAnchor) {
      this.connection
        .attr("x2", destinationAnchor.x)
        .attr("y2", destinationAnchor.y)
        .lower();
    }
  }

  draw(): void {
    if (!this.connection) {
      return;
    }
    this.source.getModelBuilder().selectInnerSvg().append(() => this.connection!.node()).lower();
  }

  connectWithDestinationLayer(destinationLayer: Layer): this {
    this.destination = destinationLayer;
    return this;
  }

  getConnectionIds(): { source: string, destination: string|undefined } {
    return {source: this.source.getLayerId(), destination: this.destination?.getLayerId()}
  }

  getSourceLayer(): Layer {
    return this.source;
  }

  getDestinationLayer(): Layer | null {
    return this.destination;
  }

  moveToMouse(event: any): void {
    if (!this.connection) {
      return;
    }
    const layerPosition = this.source.getSvgPosition();
    this.connection
      .attr("x2", layerPosition.x + event.x)
      .attr("y2", layerPosition.y + event.y);
  }

  updateSourcePosition(): void {
    if (!this.connection) {
      return;
    }
    const anchorPosition = this.source.getOutputAnchorPosition();
    this.connection
      .attr("x1", anchorPosition.x)
      .attr("y1", anchorPosition.y)
      .lower();
  }

  updateDestinationPosition(): void {
    if (!this.connection || !this.destination) {
      return;
    }
    const anchorPosition = this.destination.getInputAnchorPosition();
      this.connection
        .attr("x2", anchorPosition.x)
        .attr("y2", anchorPosition.y)
        .lower();
  }

  removeConnection(): void {
    this.source.removeOutputConnection();
    this.destination?.removeInputConnection();
    this.connection?.remove();
  }
}
