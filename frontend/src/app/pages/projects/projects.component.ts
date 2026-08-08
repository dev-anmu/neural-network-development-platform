import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SerializationService, ProjectImportError} from "../../core/services/serialization.service";
import {Router} from "@angular/router";
import {ProjectService} from "../../core/services/project.service";
import {MatDialog} from "@angular/material/dialog";
import {InputDialogComponent} from "../../shared/components/input-dialog/input-dialog.component";
import {v4 as uuidv4} from 'uuid';
import {KeyValue} from "@angular/common";
import {MessageDialogComponent} from "../../shared/components/message-dialog/message-dialog.component";
import {ConfirmDialogComponent} from "../../shared/components/confirm-dialog/confirm-dialog.component";
import {NotificationService} from "../../core/services/notification.service";
import {Project} from "../../core/interfaces/project";

@Component({
    selector: 'app-projects',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.scss'],
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  file: File | undefined;
  projects = new Map<string, Project>();
  isImporting = false;

  constructor(private serializationService: SerializationService,
              protected projectService: ProjectService,
              private router: Router,
              private dialog: MatDialog,
              private notification: NotificationService) {
    this.projectService.projectSubject.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.projects = this.projectService.getMyProjects();
      this.cdr.markForCheck();
    })
  }

  ngOnInit(): void {
    this.projects = this.projectService.getMyProjects();
  }

  lastModifiedOrder = (a: KeyValue<string, Project>, b: KeyValue<string, Project>): number => {
    const dateA = new Date(a.value.projectInfo.lastModified);
    const dateB = new Date(b.value.projectInfo.lastModified);
    return dateB.getTime() - dateA.getTime();
  }


  addFile(file: File): void {
    this.file = file;
  }

  generateProjectId(): string {
    return uuidv4();
  }

  async createNewProject(): Promise<void> {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      autoFocus: false,
      data: {message: 'Give your project a name to get started.'}
    });
    dialogRef.afterClosed().subscribe(async (projectName) => {
      if (projectName) {
        const project = this.projectService.createProject(this.generateProjectId(), projectName);
        this.projectService.addProject(project);
        await this.router.navigate([`/projects/${projectName}`])
      }
    });
  }

  async importProject(): Promise<void> {
    if (!this.file || this.isImporting) {
      return;
    }

    this.isImporting = true;
    this.cdr.markForCheck();

    try {
      const project = await this.serializationService.importZip(this.file);
      this.projectService.addProject(project);
      this.notification.success(`Project "${project.projectInfo.name}" imported successfully.`);
      await this.router.navigate([`/projects/${project.projectInfo.name}`]);
    } catch (error) {
      const message = error instanceof ProjectImportError
        ? error.message
        : 'The project file could not be imported.';
      this.dialog.open(MessageDialogComponent, {
        maxWidth: '600px',
        data: {
          title: 'Import Failed',
          message,
          warning: true
        }
      });
    } finally {
      this.isImporting = false;
      this.cdr.markForCheck();
    }
  }

  deleteProject(event: Event, name: string): void {
    event.stopPropagation();
    const project = this.projects.get(name);
    if (!project) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '480px',
      data: {
        title: 'Delete project?',
        message: `This will permanently delete "${project.projectInfo.name}". This action cannot be undone.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        warn: true,
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
      if (this.projectService.deleteProject(name)) {
        this.notification.success(`Project "${project.projectInfo.name}" deleted.`);
        this.projects = this.projectService.getMyProjects();
        this.cdr.markForCheck();
      } else {
        this.notification.error(`Could not delete project "${project.projectInfo.name}".`);
      }
    });
  }
}
