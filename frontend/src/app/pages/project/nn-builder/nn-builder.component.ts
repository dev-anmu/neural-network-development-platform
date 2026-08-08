import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ModelBuilderService} from "../../../core/services/model-builder.service";
import {LayerType} from "../../../core/enums";
import {ProjectService} from "../../../core/services/project.service";
import {FormControl} from "@angular/forms";
import {areBuilderEqual} from "../../../shared/utils";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../../../shared/components/confirm-dialog/confirm-dialog.component";
import {NotificationService} from "../../../core/services/notification.service";


@Component({
    selector: 'app-nn-builder',
    templateUrl: './nn-builder.component.html',
    styleUrls: ['./nn-builder.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NnBuilderComponent implements AfterViewInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  @ViewChild('svgContainer', {static: true}) svgContainer!: ElementRef<SVGSVGElement>;
  @ViewChild('innerSvgContainer', {static: true}) innerSvgContainer!: ElementRef<SVGGElement>;

  protected readonly LayerType = LayerType;
  autoSaveInterval: ReturnType<typeof setInterval> | undefined;
  layerForm: any;
  configuration: any;
  selectedTab = new FormControl(0);
  private canvasReady = false;

  constructor(private modelBuilderService: ModelBuilderService,
              private projectService: ProjectService,
              private dialog: MatDialog,
              private notification: NotificationService) {
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

  async ngAfterViewInit(): Promise<void> {
    await this.modelBuilderService.initialize(this.projectService.builder(), {
      svgContainer: this.svgContainer.nativeElement,
      innerSvg: this.innerSvgContainer.nativeElement,
    });
    this.canvasReady = true;
    this.startAutoSave();
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
    if (this.canvasReady) {
      this.updateBuilder();
    }
    this.modelBuilderService.clearCanvasBinding();
  }

  updateBuilder(): void {
    if (!this.canvasReady) {
      return;
    }

    const newBuilder = this.modelBuilderService.generateBuilderJSON();
    const oldBuilder = this.projectService.builder();
    if (newBuilder.layers.length === 0 && oldBuilder.layers.length > 0) {
      return;
    }

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
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '480px',
      data: {
        title: 'Clear model?',
        message: 'This will remove all layers and connections from the builder. Your saved project is not affected until you continue editing.',
        confirmLabel: 'Clear',
        warn: true,
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        await this.modelBuilderService.clearModelBuilder();
        this.notification.info('Model builder cleared.');
      }
    });
  }

  async createLayer(type: LayerType): Promise<void> {
    this.modelBuilderService.createLayer({layerType: type});
  }
}
