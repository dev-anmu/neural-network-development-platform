import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, HostListener, ViewEncapsulation, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ModelBuilderService} from "../../../core/services/model-builder.service";
import {LayerType} from "../../../core/enums";
import {ProjectService} from "../../../core/services/project.service";
import {FormControl} from "@angular/forms";
import {areBuilderEqual} from "../../../shared/utils";


@Component({
    selector: 'app-nn-builder',
    templateUrl: './nn-builder.component.html',
    styleUrls: ['./nn-builder.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NnBuilderComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly LayerType = LayerType;
  autoSaveInterval: any;
  layerForm: any;
  configuration: any;
  selectedTab = new FormControl(0);

  constructor(private modelBuilderService: ModelBuilderService, private projectService: ProjectService) {
    this.modelBuilderService.selectedLayerSubject.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((layer) => {
      this.layerForm = layer ? layer.layerForm : null;
      this.configuration = layer ? layer.getConfiguration() : null;
      if (layer) {
        this.selectedTab.setValue(1);
      } else {
        this.selectedTab.setValue(0);
      }
      this.cdr.markForCheck();
    })
  }

  async ngOnInit(): Promise<void> {
    await this.modelBuilderService.initialize(this.projectService.builder());
    this.startAutoSave();
    this.projectService.builder.update((value) => {
      return value
    })
  }

  startAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      this.updateBuilder();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    this.updateBuilder();
  }



  updateBuilder(): void {
    const newBuilder = this.modelBuilderService.generateBuilderJSON();
    const oldBuilder = this.projectService.builder();
    if (!areBuilderEqual(newBuilder, oldBuilder)) {
      this.projectService.initNewWeights.set(true);
      this.projectService.builder.set(newBuilder);
    }
  }

  @HostListener('window:keydown.Escape', ['$event'])
  unselectLayer(event: Event): void {
    this.modelBuilderService.unselect(event);
  }

  @HostListener('window:keydown.Delete', ['$event'])
  deleteLayer(event: Event): void {
    this.modelBuilderService.deleteSelectedLayer(event);
  }

  async clear(): Promise<void> {
    await this.modelBuilderService.clearModelBuilder();
  }

  async createLayer(type: LayerType): Promise<void> {
    this.modelBuilderService.createLayer({layerType: type});
  }
}
