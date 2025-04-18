import {Component, HostListener, OnInit, ViewEncapsulation} from '@angular/core';
import {LayerType} from "../../core/enums";
import {FormControl} from "@angular/forms";
import {PlaygroundBuilderService} from "../../core/services/playground-builder.service";
import {Layer} from "../../shared/layer";

@Component({
    selector: 'app-nn-playground',
    templateUrl: './nn-playground.component.html',
    styleUrls: ['./nn-playground.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false,
})
export class NnPlaygroundComponent implements OnInit {
  protected readonly LayerType = LayerType;
  layerForm: any;
  configuration: any;
  selectedTab = new FormControl(0);

  constructor(private playgroundBuilderService: PlaygroundBuilderService) {
    this.playgroundBuilderService.selectedLayerSubject.subscribe((layer: Layer | null) => {
      this.layerForm = layer ? layer.layerForm : null;
      this.configuration = layer ? layer.getConfiguration() : null;
      layer ? this.selectedTab.setValue(1) : this.selectedTab.setValue(0);
    });
  }

  async ngOnInit(): Promise<void> {
    // Initialize with empty builder for playground
    await this.playgroundBuilderService.initialize({
      layers: [{type: LayerType.Input}, {type: LayerType.Output}], 
      connections: [], 
      nextLayerId: 1
    });
  }

  @HostListener('window:keydown.Escape', ['$event'])
  unselectLayer(event: KeyboardEvent): void {
    this.playgroundBuilderService.unselect(event);
  }

  @HostListener('window:keydown.Delete', ['$event'])
  deleteLayer(event: KeyboardEvent): void {
    this.playgroundBuilderService.deleteSelectedLayer(event);
  }

  async clear(): Promise<void> {
    await this.playgroundBuilderService.clearModelBuilder();
  }

  async createLayer(type: LayerType): Promise<void> {
    this.playgroundBuilderService.createLayer({layerType: type});
  }
} 