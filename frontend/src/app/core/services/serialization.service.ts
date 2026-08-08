import {Injectable} from '@angular/core';
import JSZip from 'jszip';
import {Papa} from 'ngx-papaparse';
import {saveAs} from 'file-saver';
import {ProjectService} from "./project.service";
import {Project} from "../interfaces/project";
import {MessageDialogComponent} from "../../shared/components/message-dialog/message-dialog.component";
import {MatDialog} from "@angular/material/dialog";

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
          // todo: need better solution. fast workaround so i dont get null values after dynamic typing.
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
    const zip = await JSZip.loadAsync(file);
    const files = zip.files;

    const projectFile = files['project.json'];
    const datasetFile = files['dataset/dataset.json'];
    const trainingFile = files['training/configuration.json'];
    const builderFile = files['builder/model.json'];
    const recordsFile = files['evaluations/records.json'];

    const project = projectFile ? JSON.parse(await projectFile.async('string')) : {};
    const dataset = datasetFile ? JSON.parse(await datasetFile.async('string')) : {};
    const trainConfig = trainingFile ? JSON.parse(await trainingFile.async('string')) : {};
    const builder = builderFile ? JSON.parse(await builderFile.async('string')) : {};
    const records = recordsFile ? JSON.parse(await recordsFile.async('string')) : [];

    return {projectInfo: project, dataset: dataset, trainConfig: trainConfig, builder: builder, trainRecords: records};
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
}
