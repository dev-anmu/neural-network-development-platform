import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, ViewChild} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ProjectService} from "../../../core/services/project.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {SerializationService} from "../../../core/services/serialization.service";
import {Dataset, EncoderType, TrainingConfig} from "../../../core/interfaces/project";
import {FormBuilder, Validators} from "@angular/forms";
import * as dfd from "danfojs";
import {Encoder} from "../../../shared/ml_objects/encoder";
import {EncoderEnum} from "../../../core/enums";
import {NotificationService} from "../../../core/services/notification.service";

@Component({
    selector: 'app-dataset',
    templateUrl: './dataset.component.html',
    styleUrls: ['./dataset.component.scss'],
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
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
  selectedEncoders: Record<string, EncoderEnum> = {};
  isImporting = false;
  isWideDataset = false;
  hiddenColumnCount = 0;
  displayedColumnNames: string[] = [];
  isLoadingPreprocessed = false;

  constructor(public projectService: ProjectService,
              private serializationService: SerializationService,
              private fb: FormBuilder,
              private notification: NotificationService) {
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

  get totalColumnCount(): number {
    return this.projectService.dataset().columns.length;
  }

  get totalRowCount(): number {
    return this.projectService.dataset().data.length;
  }

  get hasDataset(): boolean {
    return this.totalRowCount > 0 && this.totalColumnCount > 0;
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
    const dataset = this.projectService.dataset();
    if (!dataset.data.length || !dataset.columns.length) {
      return;
    }

    this.isWideDataset = dataset.columns.length > 20;
    this.displayedColumns = this.getPreviewColumns(dataset);
    this.displayedColumnNames = this.displayedColumns.map((column) => column.name);
    this.hiddenColumnCount = dataset.columns.length - this.displayedColumns.length;

    this.selectedEncoders = dataset.columns.reduce((acc: Record<string, EncoderEnum>, column) => {
      acc[column.name] = column.encoding;
      return acc;
    }, {});

    for (const column of dataset.columns) {
      if (column.encoding !== EncoderEnum.no && !column.encoder) {
        column.encoder = await this.projectService.createEncoderInstance(column.encoding);
      }
    }

    this.columnNames = dataset.columns.map(column => column.name);
    this.datasetForm.patchValue({
      input: dataset.inputColumns,
      target: dataset.targetColumns,
    });
    this.selectedTable = 'original';
    await this.updateDataSource(this.selectedTable);
    this.cdr.markForCheck();
  }

  private getPreviewColumns(dataset: Dataset): Dataset['columns'] {
    const maxPreviewColumns = 12;
    if (dataset.columns.length <= maxPreviewColumns) {
      return dataset.columns;
    }

    const labelColumn = dataset.columns.find((column) => column.name === 'label');
    const pixelColumns = dataset.columns.filter((column) => column.name.startsWith('pixel'));
    const preview = [
      ...(labelColumn ? [labelColumn] : []),
      ...pixelColumns.slice(0, maxPreviewColumns - (labelColumn ? 1 : 0)),
    ];

    return preview.length > 0 ? preview : dataset.columns.slice(0, maxPreviewColumns);
  }

  async onViewChange(view: string): Promise<void> {
    this.selectedTable = view;
    await this.updateDataSource(view);
  }

  async updateDataSource(dataType: string): Promise<void> {
    if (dataType === 'original') {
      const dataset = this.projectService.dataset();
      this.dataSource.data = dataset.data;
    } else if (dataType === 'preprocessed') {
      this.isLoadingPreprocessed = true;
      this.cdr.markForCheck();
      try {
        const df = await this.projectService.getDataframe();
        const data: Record<string, any>[] = dfd.toJSON(df) as Record<string, any>[];
        this.dataSource.data = data;
        const columns = df.columns as string[];
        this.dfColumns = columns.length > 20 ? columns.slice(0, 12) : columns;
        if (columns.length > this.dfColumns.length) {
          this.hiddenColumnCount = columns.length - this.dfColumns.length;
          this.isWideDataset = true;
        }
      } finally {
        this.isLoadingPreprocessed = false;
      }
    }
    this.initPaginator();
    this.cdr.markForCheck();
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
    if (!this.file || this.isImporting) {
      return;
    }

    this.isImporting = true;
    this.cdr.markForCheck();

    try {
      const name = this.file.name;
      const dataset = await this.serializationService.parseCSV(this.file);
      const df = new dfd.DataFrame(dataset.data);
      const cols = df.columns as string[];
      const inputColumns = cols.length > 1 ? cols.slice(0, -1) : [];
      const targetColumns = cols.length > 1 ? [cols[cols.length - 1]] : [];

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
          inputColumns: inputColumns,
          targetColumns: targetColumns,
        };
      });
      this.datasetForm.patchValue({input: inputColumns, target: targetColumns});
      await this.initTable();
      this.initPaginator();
      this.notification.success(`Imported ${dataset.data.length} rows from "${name}".`);
    } catch {
      this.notification.error('Failed to import the CSV file. Please check the file format.');
    } finally {
      this.isImporting = false;
      this.cdr.markForCheck();
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
    this.datasetForm?.get('input')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((inputColumns: string[] | null) => {
      this.projectService.dataset.update((dataset: Dataset) => {
        return {
          ...dataset,
          inputColumns: inputColumns || []
        };
      });
    });
    this.datasetForm?.get('target')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((targetColumns: string[] | null) => {
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

  get previewTableColumns(): string[] {
    return ['__row', ...this.displayedColumnNames];
  }

  get preprocessedTableColumns(): string[] {
    return ['__row', ...this.dfColumns];
  }

  getRowCount(percentage: number): number {
    const totalRows = this.projectService.dataset().data.length;
    return Math.round((percentage / 100) * totalRows);
  }

  protected readonly Encoder = Encoder;
}

