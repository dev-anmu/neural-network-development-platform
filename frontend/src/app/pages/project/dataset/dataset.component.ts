import {Component, ViewChild} from '@angular/core';
import {ProjectService} from "../../../core/services/project.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {SerializationService} from "../../../core/services/serialization.service";
import {Dataset, EncoderType, TrainingConfig} from "../../../core/interfaces/project";
import {FormBuilder, Validators} from "@angular/forms";
import * as dfd from "danfojs";
import {Encoder} from "../../../shared/ml_objects/encoder";
import {EncoderEnum} from "../../../core/enums";

@Component({
    selector: 'app-dataset',
    templateUrl: './dataset.component.html',
    styleUrls: ['./dataset.component.scss'],
    standalone: false
})
export class DatasetComponent {
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  datasetForm;
  splitValue = 80;
  file: File | undefined;
  trainConfig: TrainingConfig;
  displayedColumns: { name: string, type: string, uniqueValues: number, encoding: EncoderEnum, encoder: EncoderType }[] = [];
  dfColumns: string[] = [];
  columnNames: string[] = [];
  dataSource: MatTableDataSource<any>;
  selectedTable: string = 'original';
  selectedEncoders: { [key: string]: EncoderEnum } = {};

  constructor(public projectService: ProjectService,
              private serializationService: SerializationService,
              private fb: FormBuilder) {
    this.trainConfig = this.projectService.trainConfig();
    this.splitValue = 100 - (this.trainConfig.validationSplit * 100);
    this.datasetForm = fb.group({
      input: [this.projectService.dataset().inputColumns, Validators.required],
      target: [this.projectService.dataset().targetColumns, Validators.required],
      trainingRatio: [`${this.splitValue.toFixed(0)} %`],
      validationRatio: [`${(100 - this.splitValue).toFixed(0)} %`],
    });
    this.dataSource = new MatTableDataSource();
  }

  getRowCount(percentage: number): number {
    const totalRows = this.projectService.dataset().data.length;
    return Math.round((percentage / 100) * totalRows);
  }

  getDataTypeClass(dataType: string): string {
    if (!dataType) return '';
    
    const type = dataType.toLowerCase();
    if (type.includes('float')) return 'float';
    if (type.includes('int')) return 'int';
    if (type.includes('str')) return 'string';
    if (type.includes('bool')) return 'boolean';
    if (type.includes('object')) return 'object';
    
    return '';
  }

  async ngOnInit() {
    await this.initTable();
    this.initPaginator();
  }

  formatLabel(value: number): string {
    return `${value}%`;
  }

  updateFormValues(percentSplit: number): void {
    this.datasetForm.get('trainingRatio')?.setValue(`${percentSplit.toFixed(0)} %`);
    this.datasetForm.get('validationRatio')?.setValue(`${(100 - percentSplit).toFixed(0)} %`);
  }

  updateSplitValue(percentSplit: number): void {
    this.updateFormValues(percentSplit);
    const splitValue: number = (100 - percentSplit) / 100;
    this.projectService.trainConfig.update((trainConfig: TrainingConfig) => {
      return { ...trainConfig, validationSplit: splitValue };
    });
  }

  async initTable(): Promise<void> {
    const df = await this.projectService.dataframe();
    const dataset = this.projectService.dataset();
    if (df && df.shape[0] !== 0) {
      this.displayedColumns = dataset.columns;
      this.selectedEncoders = dataset.columns.reduce((acc: any, column) => {
        acc[column.name] = column.encoding;
        if (column.encoding !== EncoderEnum.no) {
          this.onEncoderChange(column.name, column.encoding);
        }
        return acc;
      }, {});
      this.columnNames = dataset.columns.map(column => column.name);
      this.datasetForm.get('input')?.setValue(this.projectService.dataset().inputColumns);
      this.selectedTable = 'original';
      await this.updateDataSource(this.selectedTable);
    }
  }

  async updateDataSource(dataType: string): Promise<void> {
    if (dataType === 'original') {
      const dataset = this.projectService.dataset();
      this.dataSource!.data = dataset.data;
    } else if (dataType === 'preprocessed') {
      const df = await this.projectService.dataframe();
      const data: { [key: string]: any }[] = dfd.toJSON(df) as { [key: string]: any }[];
      this.dataSource!.data = data;
      this.dfColumns = df.columns;
    }
  }

  initPaginator() {
    if (this.dataSource && this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  addFile(file: File) {
    this.file = file;
  }

  async parseCSV() {
    if (this.file) {
      const name = this.file.name;
      const dataset = await this.serializationService.parseCSV(this.file);
      const df = new dfd.DataFrame(dataset.data);

      const columns: { name: string, type: string, uniqueValues: number, encoding: EncoderEnum, encoder: EncoderType }[] = [];
      df.columns.forEach((column: string) => {
        columns.push({name: column, type: df[column].dtype, uniqueValues: df[column].nUnique(), encoding: EncoderEnum.no, encoder: null});
      });

      this.projectService.dataset.update((value: Dataset) => {
        return {
          ...value,
          fileName: name,
          data: dataset.data,
          columns: columns,
          inputColumns: df.columns
        };
      });
      await this.initTable();
      this.initPaginator();
    }
  }

  onEncoderChange(columnName: string, encoding: EncoderEnum) {
    this.selectedEncoders[columnName] = encoding;

    this.projectService.createEncoderInstance(encoding).then(encoder => {
      this.projectService.dataset.update((dataset: Dataset) => {
        const updatedColumns = [...dataset.columns];
        const columnToUpdateIndex = updatedColumns.findIndex(column => column.name === columnName);
        if (columnToUpdateIndex !== -1) {
          updatedColumns[columnToUpdateIndex] = {
            ...updatedColumns[columnToUpdateIndex],
            encoding: encoding,
            encoder: encoder
          };
        }
        return {
          ...dataset,
          columns: updatedColumns
        };
      });
    });
  }

  ngAfterViewInit() {
    this.initPaginator();
    this.datasetForm?.get('input')?.valueChanges.subscribe((inputColumns: string[] | null) => {
      this.projectService.dataset.update((dataset: Dataset) => {
        return {
          ...dataset,
          inputColumns: inputColumns || []
        };
      });
    });
    this.datasetForm?.get('target')?.valueChanges.subscribe((targetColumns: string[] | null) => {
      this.projectService.dataset.update((dataset: Dataset) => {
        return {
          ...dataset,
          targetColumns: targetColumns || []
        };
      });
    });
  }

  checkIfTypeNumber(value: any) {
    return typeof value === 'number';
  }
  protected readonly Encoder = Encoder;
}

