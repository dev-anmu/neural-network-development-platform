import {AfterViewInit, ChangeDetectionStrategy, Component, computed, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ProjectService} from "../../core/services/project.service";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import {MatStepper} from "@angular/material/stepper";

@Component({
    selector: 'app-project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.scss'],
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;
  projectName = '';
  /** Applied once after load — do not bind to mat-stepper selectedIndex (resets on every CD cycle). */
  private pendingStartupStep: number | null = null;
  
  datasetError = computed(() => {
    const dataset = this.projectService.dataset();
    if (dataset.data.length <= 0) {
      return 'Please import a dataset to proceed.';
    } else if (dataset.inputColumns.length <= 0) {
      return 'Please specify at least one input column for the machine learning model.';
    } else if (dataset.targetColumns.length <= 0) {
      return 'Please specify at least one target column for the machine learning model.';
    }
    return null;
  });

  modelError = computed(() => {
    const builder = this.projectService.builder();
    if (!builder.connections || builder.connections.length === 0) {
      return 'Please add at least one layer in the model builder before proceeding.';
    }
    return null;
  });

  isDatasetReady = computed(() => !this.datasetError());
  isModelReady = computed(() => !this.modelError());

  constructor(private modelBuilderService: ModelBuilderService,
              private projectService: ProjectService,
              public activatedRoute: ActivatedRoute,
              private router: Router) {
    this.projectName = activatedRoute.snapshot.params['projectName'];
  }

  async ngOnInit(): Promise<void> {
    await this.projectService.selectProject(this.projectName);
    const project = this.projectService.getProjectByName(this.projectName);
    if (!project) {
      await this.router.navigate(['/']);
      return;
    }

    this.modelBuilderService.isInitialized = false;

    const builder = this.projectService.builder();
    if (builder.connections.length > 0) {
      this.pendingStartupStep = 1;
    }
    this.tryApplyStartupStep();
  }

  ngAfterViewInit(): void {
    this.tryApplyStartupStep();
  }

  private tryApplyStartupStep(): void {
    if (this.pendingStartupStep === null || !this.stepper) {
      return;
    }
    this.stepper.selectedIndex = this.pendingStartupStep;
    this.pendingStartupStep = null;
  }

  ngOnDestroy(): void {
    this.projectService.updateProject();
  }

  goToStep(index: number): void {
    if (this.stepper) {
      this.stepper.selectedIndex = index;
    }
  }

  nextStep(): void {
    this.stepper?.next();
  }

  previousStep(): void {
    this.stepper?.previous();
  }

  canAdvanceFromCurrentStep(): boolean {
    const index = this.stepper?.selectedIndex ?? 0;
    if (index === 0) {
      return this.isDatasetReady();
    }
    if (index === 1) {
      return this.isModelReady();
    }
    return true;
  }

  isLastStep(): boolean {
    return (this.stepper?.selectedIndex ?? 0) >= 4;
  }
}
