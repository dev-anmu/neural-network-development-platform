import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'app-file-upload',
    templateUrl: './file-upload.component.html',
    styleUrls: ['./file-upload.component.scss'],
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent {
  @Output() fileEvent = new EventEmitter<File>();
  @Input() fileType: string = '';
  fileName: string = '';

  constructor() {
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileEvent.emit(file);
      this.fileName = file.name;
    }
  }
}
