import {Component, effect, ViewChild} from '@angular/core';
import {ProjectService} from "../../core/services/project.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {SerializationService} from "../../core/services/serialization.service";
import {Dataset, TrainingConfig} from "../../core/interfaces/project";
import {DatasetService} from "../../core/services/dataset.service";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss']
})
export class DatasetComponent {
  inputs = new FormControl();
  targets = new FormControl();
  splitValue = 80;
  file: File | undefined;
  dataset: Dataset | undefined;
  displayedColumns: string[] | undefined;
  dataSource: MatTableDataSource<any> | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  constructor(private projectService: ProjectService,
              private serializationService: SerializationService) {
    effect(() => {
      const dataset = this.projectService.dataset();
      if (dataset.data.length > 0) {
        this.dataset = dataset;
        this.updateDataSource();
        this.initPaginator();
      }
    })
  }

  formatLabel(value: number): string {
    return `${value}%`;
  }

  updateSplitValue(percentSplit: number): void {
    const splitValue: number = (100 - percentSplit) / 100;
    this.projectService.trainConfig.mutate((trainConfig: TrainingConfig) => {
      trainConfig.validationSplit = splitValue;
    })
  }

  ngAfterViewInit() {
    this.initPaginator();
  }

  updateDataSource(): void {
    if (this.dataset) {
      this.dataSource = new MatTableDataSource<{ [key: string]: any; }>(this.dataset.data);
      this.displayedColumns = Object.keys(this.dataset.data[0]);
      this.inputs.setValue(this.displayedColumns);
    }
  }

  initPaginator() {
    if (this.dataSource && this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  // todo: add explaination, hover tooltip
  // CRIM - per capita crime rate by town
  // ZN - proportion of residential land zoned for lots over 25,000 sq.ft.
  //   INDUS - proportion of non-retail business acres per town.
  //   CHAS - Charles River dummy variable (1 if tract bounds river; 0 otherwise)
  // NOX - nitric oxides concentration (parts per 10 million)
  // RM - average number of rooms per dwelling
  // AGE - proportion of owner-occupied units built prior to 1940
  // DIS - weighted distances to five Boston employment centres
  // RAD - index of accessibility to radial highways
  // TAX - full-value property-tax rate per $10,000
  // PTRATIO - pupil-teacher ratio by town
  // B - 1000(Bk - 0.63)^2 where Bk is the proportion of blacks by town
  // LSTAT - % lower status of the population
  // MEDV - Median value of owner-occupied homes in $1000's

  addFile(file: File) {
    this.file = file;
  }

  async parseCSV() {
    if (this.file) {
      const name = this.file.name;
      const dataset = await this.serializationService.parseCSV(this.file);
      this.projectService.dataset.mutate(value => {
        value.fileName = name;
        value.data = dataset
      });
    }
  }

}

