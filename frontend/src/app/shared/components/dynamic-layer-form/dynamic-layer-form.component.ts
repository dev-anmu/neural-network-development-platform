import {ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-dynamic-layer-form',
    templateUrl: './dynamic-layer-form.component.html',
    styleUrls: ['./dynamic-layer-form.component.scss'],
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicLayerFormComponent implements OnChanges, OnDestroy {
  @Input() parameterConfig!: Parameter[];
  @Input() form!: FormGroup;
  private subscriptions: Subscription[] = [];

  ngOnChanges(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.parameterConfig
      .filter((parameter) => parameter.type === 'number')
      .forEach((parameter) => {
        const sub = this.form.get(parameter.key)?.valueChanges.subscribe((value) => {
          const number = parseFloat(value);
          if (!isNaN(number)) {
            this.form.get(parameter.key)?.setValue(number, { emitEvent: false });
          }
        });
        this.subscriptions.push(sub!);
      });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

export interface Parameter {
  key: string
  label: string
  controlType: string
  type: string,
  options: any[],
  tooltip?: string,
  hint?: string
}
