import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-file-demo',
    standalone: true,
    imports: [CommonModule, FileUploadModule, ToastModule, ButtonModule],
    template: `
        <p-fileupload name="demo[]" (onUpload)="onUpload($event)" [multiple]="true" accept="image/*" maxFileSize="1000000" mode="advanced" url="httpscdn/api/upload.php">
            <ng-template #empty>
                <div>Drag and drop files to here to upload.</div>
            </ng-template>
            <ng-template #content>
                <ul *ngIf="uploadedFiles.length">
                    <li *ngFor="let file of uploadedFiles">{{ file.name }} - {{ file.size }} bytes</li>
                </ul>
            </ng-template>
        </p-fileupload>
    `,
    providers: [MessageService]
})
export class FileDemo2 {
    uploadedFiles: any[] = [];

    constructor(private messageService: MessageService) {}

    onUpload(event: any) {
        console.log('event', event);
        for (const file of event.files) {
            this.uploadedFiles.push(file);
        }

        this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
    }
}
