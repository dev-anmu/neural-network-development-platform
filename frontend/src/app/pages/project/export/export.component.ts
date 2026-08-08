import {ChangeDetectionStrategy, Component} from '@angular/core';
import {SerializationService} from "../../../core/services/serialization.service";
import {KeyValue} from "@angular/common";
import {ProjectService} from "../../../core/services/project.service";
import {NotificationService} from "../../../core/services/notification.service";

interface ProjectSections {
  name: string;
  checked: boolean;
  disabled: boolean;
  order: number;
}

@Component({
    selector: 'app-export',
    templateUrl: './export.component.html',
    styleUrls: ['./export.component.scss'],
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportComponent {
  sections: Record<string, ProjectSections> = {
    dataset: {name: '1) Dataset', checked: true, disabled: false, order: 1},
    builder: {name: '2) Modeling Builder', checked: true, disabled: false, order: 2},
    trainConfig: {name: '3) Training Configuration', checked: true, disabled: false, order: 3},
    evaluation: {name: '4) Evaluation Data', checked: true, disabled: false, order: 4},
  }
  allChecked: boolean = true;

  constructor(private serializationService: SerializationService,
              private projectService: ProjectService,
              private notification: NotificationService) {
  }

  fixedOrder = (a: KeyValue<string,any>, b: KeyValue<string,any>): number => {
    return a.value.order - b.value.order;
  }

  updateAllChecked(): void {
    const sectionValues = Object.values(this.sections);
    this.allChecked = sectionValues.every((section: ProjectSections) => section.checked);
  }

  someChecked(): boolean {
    const sectionValues = Object.values(this.sections);
    return sectionValues.filter((section: any) => section.checked).length > 0 && !this.allChecked;
  }

  setAll(checked: boolean): void {
    this.allChecked = checked;
    const sectionValues = Object.values(this.sections);
    sectionValues.forEach((section: any) => {
      if (!section.disabled) {
        section.checked = checked
      }
    });
  }

  exportProject(): void {
    this.serializationService.exportProjectAsZIP(this.sections);
    this.notification.success('Project export started — your ZIP download should begin shortly.');
  }

  saveInLocalStorage(): void {
    this.projectService.updateProject();
    this.notification.success('Project saved to browser storage.');
  }

  async exportModel(): Promise<void> {
    try {
      await this.serializationService.exportModel();
      this.notification.success('TensorFlow model export started.');
    } catch {
      this.notification.error('Model export failed. Train a model first.');
    }
  }

}
