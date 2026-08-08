import {ChangeDetectionStrategy, Component, computed, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ProjectService} from "../../core/services/project.service";
import {ModelBuilderService} from "../../core/services/model-builder.service";

@Component({
    selector: 'app-project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.scss'],
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectComponent implements OnInit, OnDestroy {
  projectName = '';
  initialStep: number = 0;
  
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
  })
  modelError = computed(() => {
    return this.projectService.model() === null;
  })

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
      this.initialStep = 1;
    }
  }

  ngOnDestroy(): void {
    this.projectService.updateProject();
  }
}
