import {Injectable} from '@angular/core';
import JSZip from 'jszip';
import {Papa} from 'ngx-papaparse';
import {saveAs} from 'file-saver';
import {ProjectService} from "./project.service";
import {Builder, Dataset, Project, ProjectInfo, TrainingConfig, TrainingRecords} from "../interfaces/project";
import {MessageDialogComponent} from "../../shared/components/message-dialog/message-dialog.component";
import {MatDialog} from "@angular/material/dialog";

const MAX_ZIP_BYTES = 50 * 1024 * 1024;

export class ProjectImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProjectImportError';
  }
}

@Injectable({
  providedIn: 'root'
})
export class SerializationService {

  constructor(private projectService: ProjectService,
              private papa: Papa,
              private dialog: MatDialog) {
  }

  async parseCSV(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      this.papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transform: (value) => {
          return value === '' ? ' ' : value;
        },
        complete: (result: any) => {
          resolve(result);
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  }

  async exportProjectAsZIP(sections: any): Promise<void> {
    const zip = new JSZip();
    const project = this.projectService.activeProject();
    const projectInfo = project.projectInfo;
    if (sections.dataset.checked) {
      const dataset = JSON.stringify(project.dataset);
      zip.file("dataset/dataset.json", dataset, {binary: false});
    }
    if (sections.builder.checked) {
      const builder = project.builder;
      zip.file("builder/model.json", JSON.stringify(builder), {binary: false})
    }
    if (sections.trainConfig.checked) {
      const trainConfig = JSON.stringify(project.trainConfig);
      zip.file("training/configuration.json", trainConfig, {binary: false});
    }
    if (sections.evaluation.checked) {
      const evaluations = JSON.stringify(project.trainRecords);
      zip.file("evaluations/records.json", evaluations, {binary: false});
    }
    zip.file("project.json", JSON.stringify(projectInfo), {binary: false});
    const content = await zip.generateAsync({type: "blob"});
    saveAs(content, `${projectInfo.name}.zip`)
  }

  async importZip(file: Blob): Promise<Project> {
    if (file.size > MAX_ZIP_BYTES) {
      throw new ProjectImportError(`Project file exceeds the ${MAX_ZIP_BYTES / (1024 * 1024)} MB limit.`);
    }

    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(file);
    } catch {
      throw new ProjectImportError('The selected file is not a valid ZIP archive.');
    }

    const projectFile = zip.file('project.json');
    if (!projectFile) {
      throw new ProjectImportError('The ZIP file is missing project.json.');
    }

    const projectInfo = this.parseJson<ProjectInfo>(
      await projectFile.async('string'),
      'project.json'
    );
    if (!projectInfo.name || typeof projectInfo.name !== 'string') {
      throw new ProjectImportError('project.json must include a valid project name.');
    }

    const dataset = await this.readOptionalJson<Dataset>(zip, 'dataset/dataset.json', {
      data: [],
      fileName: '',
      columns: [],
      inputColumns: [],
      targetColumns: []
    });
    const trainConfig = await this.readOptionalJson<TrainingConfig>(zip, 'training/configuration.json', this.projectService.trainConfig());
    const builder = await this.readOptionalJson<Builder>(zip, 'builder/model.json', {
      layers: [],
      connections: [],
      nextLayerId: 0
    });
    const trainRecords = await this.readOptionalJson<TrainingRecords[]>(zip, 'evaluations/records.json', []);

    if (!Array.isArray(trainRecords)) {
      throw new ProjectImportError('evaluations/records.json must contain an array.');
    }

    return {projectInfo, dataset, trainConfig, builder, trainRecords};
  }

  async exportModel() {
    const model = this.projectService.model();
    if (model) {
      await model.save('downloads://model');
    } else {
      this.dialog.open(MessageDialogComponent, {
        maxWidth: '600px',
        data: {
          title: 'Model Compilation Failed',
          message: 'The model you created in the Modeling Section could not be compiled into a TensorFlow model format. Please ensure that your model is correctly defined.',
          warning: true
        }
      });
    }
  }

  private async readOptionalJson<T>(zip: JSZip, path: string, fallback: T): Promise<T> {
    const file = zip.file(path);
    if (!file) {
      return fallback;
    }
    return this.parseJson<T>(await file.async('string'), path);
  }

  private parseJson<T>(content: string, label: string): T {
    try {
      return JSON.parse(content) as T;
    } catch {
      throw new ProjectImportError(`Could not parse ${label}. The file may be corrupted.`);
    }
  }
}
