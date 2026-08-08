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
import {LayerType} from "../../core/enums";
import {FormControl} from "@angular/forms";
import {PlaygroundBuilderService} from "../../core/services/playground-builder.service";
import {Layer} from "../../shared/layer";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../../shared/components/confirm-dialog/confirm-dialog.component";
import {NotificationService} from "../../core/services/notification.service";

@Component({
    selector: 'app-nn-playground',
    templateUrl: './nn-playground.component.html',
    styleUrls: ['./nn-playground.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NnPlaygroundComponent implements AfterViewInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  @ViewChild('svgContainer', {static: true}) svgContainer!: ElementRef<SVGSVGElement>;
  @ViewChild('innerSvgContainer', {static: true}) innerSvgContainer!: ElementRef<SVGGElement>;

  protected readonly LayerType = LayerType;
  layerForm: any;
  configuration: any;
  selectedTab = new FormControl(0);

  constructor(private playgroundBuilderService: PlaygroundBuilderService,
              private dialog: MatDialog,
              private notification: NotificationService) {
    this.playgroundBuilderService.selectedLayerSubject.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((layer: Layer | null) => {
      this.layerForm = layer ? layer.layerForm : null;
      this.configuration = layer ? layer.getConfiguration() : null;
      if (layer) {
        this.selectedTab.setValue(1);
      } else {
        this.selectedTab.setValue(0);
      }
      this.cdr.markForCheck();
    });
  }

  async ngAfterViewInit(): Promise<void> {
    await this.playgroundBuilderService.initialize({
      layers: [{type: LayerType.Input}, {type: LayerType.Output}],
      connections: [],
      nextLayerId: 1
    }, {
      svgContainer: this.svgContainer.nativeElement,
      innerSvg: this.innerSvgContainer.nativeElement,
    });
  }

  ngOnDestroy(): void {
    this.playgroundBuilderService.clearCanvasBinding();
  }

  @HostListener('window:keydown.Escape', ['$event'])
  unselectLayer(event: Event): void {
    this.playgroundBuilderService.unselect(event);
  }

  @HostListener('window:keydown.Delete', ['$event'])
  deleteLayer(event: Event): void {
    this.playgroundBuilderService.deleteSelectedLayer(event);
  }

  async clear(): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '480px',
      data: {
        title: 'Clear playground model?',
        message: 'This will remove all layers and connections from the canvas. Playground changes are never saved to a project.',
        confirmLabel: 'Clear',
        warn: true,
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        await this.playgroundBuilderService.clearModelBuilder();
        this.notification.info('Playground cleared.');
      }
    });
  }

  async createLayer(type: LayerType): Promise<void> {
    this.playgroundBuilderService.createLayer({layerType: type});
  }
}
