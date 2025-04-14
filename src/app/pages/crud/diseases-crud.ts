import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DiseaseService } from '../../services/disease.service';
import { Disease } from '../../models';
import { Category } from '../../models/category.model';
interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

@Component({
    selector: 'app-crud',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        RatingModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule
    ],
    template: `
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Nouveau" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                <p-button severity="secondary" label="Supprimer" icon="pi pi-trash" outlined (onClick)="deleteSelectedDiseases()" [disabled]="!selectedDiseases || !selectedDiseases.length" />
            </ng-template>

            <ng-template #end>
                <p-button label="Exporter" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="diseases()"
            [rows]="10"
            [columns]="cols"
            [paginator]="true"
            [globalFilterFields]="['name', 'country.name', 'ecole', 'representative.name', 'status']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedDiseases"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} diseases"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Gestion Des Maladies</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Rechercher..." />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template #header>
                <tr>
                    <th style="width: 3rem">
                        <p-tableHeaderCheckbox />
                    </th>
                    <th style="min-width: 16rem">Code</th>
                    <th pSortableColumn="name" style="min-width:16rem">
                        Nom
                        <p-sortIcon field="name" />
                    </th>

                    <th pSortableColumn="category" style="min-width:10rem">
                        Categorie
                        <p-sortIcon field="category" />
                    </th>

                    <th style="min-width: 12rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-disease>
                <tr>
                    <td style="width: 3rem">
                        <p-tableCheckbox [value]="disease" />
                    </td>
                    <td style="min-width: 12rem">{{ disease.id }}</td>
                    <td style="min-width: 16rem">{{ disease.name }}</td>

                    <td>{{ disease.categoryId }}</td>

                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editDisease(disease)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteDisease(disease)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="diseaseDialog" [style]="{ width: '450px' }" header="Details De La Maladie" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-6">
                    <div>
                        <label for="inventoryStatus" class="block font-bold mb-3">Catégorie</label>
                        <p-select [(ngModel)]="disease.categoryId" name="category" inputId="inventoryStatus" [options]="statuses" optionLabel="label" optionValue="label" placeholder="Selectionner une catégorie" fluid />
                    </div>
                    <div>
                        <label for="name" class="block font-bold mb-3">Nom</label>
                        <input type="text" pInputText id="name" [(ngModel)]="disease.name" required autofocus fluid />
                        <small class="text-red-500" *ngIf="submitted && !disease.name">Le nom est requis.</small>
                    </div>
                    <div>
                        <label for="description" class="block font-bold mb-3">Description</label>
                        <textarea id="description" pTextarea [(ngModel)]="disease.description" required rows="3" cols="20" fluid></textarea>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (click)="saveDisease()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
    `,
    providers: [MessageService, DiseaseService, ConfirmationService]
})
export class Diseases implements OnInit {
    diseaseDialog: boolean = false;

    diseases = signal<Disease[]>([]);

    disease!: Disease;

    selectedDiseases!: Disease[] | null;
    categories: Category[] = []; // Catégories supplémentaires
    submitted: boolean = false;

    statuses!: any[];

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols!: Column[];

    constructor(
        private diseaseService: DiseaseService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    exportCSV() {
        this.dt.exportCSV();
    }

    ngOnInit() {
        this.loadCategories()
        this.loadDemoData();
    }

    loadCategories() {

        this.diseaseService.getAllDiseases().subscribe({
            next: (response: any) => {
                //   console.log('maladies de l\'API :', response);
                this.diseases = response.map((disease: any) => ({ name: disease.name, code: disease.id }));

            },
            error: (error) => {
                console.log('Erreur lors de la connexion :', error);
                const errorMessage = error?.error?.message || 'Coordonnées Invalides';
                // this.toastService.showError(errorMessage);
            }
        });

    }

    
    loadDemoData(): void {
        this.diseaseService.getAllDiseases().subscribe({
            next: (response: any) => {
                // console.log('Réponse de l\'API :', response);
                this.diseases.set(response);
            },
            error: (error) => {
                console.log('Erreur lors de la connexion :', error);
                const errorMessage = error?.error?.message || 'Coordonnées Invalides';
                // this.toastService.showError(errorMessage);
            }
        });

        this.cols = [
            { field: 'id', header: 'Code', customExportHeader: 'Disease Code' },
            { field: 'name', header: 'Name' },
        ];
        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }


    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.disease = {};
        this.submitted = false;
        this.diseaseDialog = true;
        this.submitted = false;
        this.categories = [];

    }

    editDisease(disease: Disease) {
        this.disease = { ...disease };
        this.diseaseDialog = true;
        this.categories = [];

    }

    deleteSelectedDiseases() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected diseases?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.diseases.set(this.diseases().filter((val) => !this.selectedDiseases?.includes(val)));
                this.selectedDiseases = null;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Diseases Deleted',
                    life: 3000
                });
            }
        });
    }

    hideDialog() {
        this.diseaseDialog = false;
        this.submitted = false;
    }

    deleteDisease(disease: Disease) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + disease.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.diseases.set(this.diseases().filter((val) => val.id !== disease.id));
                this.disease = {};
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Disease Deleted',
                    life: 3000
                });
            }
        });
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.diseases().length; i++) {
            if (this.diseases()[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    }

    createId(): string {
        let id = '';
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    getSeverity(status: string) {
        switch (status) {
            case 'INSTOCK':
                return 'success';
            case 'LOWSTOCK':
                return 'warn';
            case 'OUTOFSTOCK':
                return 'danger';
            default:
                return 'info';
        }
    }

    saveDisease() {
        this.submitted = true;
        let _diseases = this.diseases();
        if (this.disease.name?.trim()) {
            if (this.disease.id) {
                _diseases[this.findIndexById(this.disease.id)] = this.disease;
                this.diseases.set([..._diseases]);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Disease Updated',
                    life: 3000
                });
            } else {
                this.disease.id = this.createId();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Disease Created',
                    life: 3000
                });
                console.log('les données', this.disease);

                this.diseases.set([..._diseases, this.disease]);
            }

            this.diseaseDialog = false;
            this.disease = {};
        }
    }
}
