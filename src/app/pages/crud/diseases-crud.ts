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
import { CategoryService } from '../../services/category.service';

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
        <p-toast></p-toast>
        
        <p-toolbar styleClass="mb-6">
            <ng-template pTemplate="start">
                <p-button label="Nouveau" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                <p-button severity="secondary" label="Supprimer" icon="pi pi-trash" outlined (onClick)="deleteSelectedDiseases()" [disabled]="!selectedDiseases || !selectedDiseases.length" />
            </ng-template>

            <ng-template pTemplate="end">
                <p-button label="Exporter" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="diseases()"
            [rows]="10"
            [columns]="cols"
            [paginator]="true"
            [globalFilterFields]="['name', 'category', 'description']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedDiseases"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} diseases"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
        >
            <ng-template pTemplate="caption">
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Gestion Des Maladies</h5>
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Rechercher..." />
                    </p-iconfield>
                </div>
            </ng-template>
            <ng-template pTemplate="header">
                <tr>
                    <th style="width: 3rem">
                        <p-tableHeaderCheckbox />
                    </th>
                    <th style="min-width: 16rem">Code</th>
                    <th pSortableColumn="name" style="min-width:16rem">
                        Nom
                        <p-sortIcon field="name" />
                    </th>

                    <th pSortableColumn="categoryId" style="min-width:10rem">
                        Categorie
                        <p-sortIcon field="categoryId" />
                    </th>

                    <th style="min-width: 12rem"></th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-disease>
                <tr>
                    <td style="width: 3rem">
                        <p-tableCheckbox [value]="disease" />
                    </td>
                    <td style="min-width: 12rem">{{ disease.id }}</td>
                    <td style="min-width: 16rem">{{ disease.name }}</td>

                    <td>{{ getCategoryName(disease.categoryId) }}</td>

                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editDisease(disease)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteDisease(disease)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="diseaseDialog" [style]="{ width: '450px' }" header="Details De La Maladie" [modal]="true">
            <ng-template pTemplate="content">
                <div class="flex flex-col gap-6">
                    <div>
                        <label for="category" class="block font-bold mb-3">Catégorie</label>
                        <p-select [(ngModel)]="disease.categoryId" name="category" inputId="category" [options]="categories" optionLabel="name" optionValue="id" placeholder="Selectionner une catégorie" [style]="{ width: '100%' }" />
                    </div>
                    <div>
                        <label for="name" class="block font-bold mb-3">Nom</label>
                        <input type="text" pInputText id="name" [(ngModel)]="disease.name" required autofocus [style]="{ width: '100%' }" />
                        <small class="text-red-500" *ngIf="submitted && !disease.name">Le nom est requis.</small>
                    </div>
                    <div>
                        <label for="description" class="block font-bold mb-3">Description</label>
                        <textarea id="description" pTextarea [(ngModel)]="disease.description" required rows="3" cols="20" [style]="{ width: '100%' }"></textarea>
                    </div>
                </div>
            </ng-template>

            <ng-template pTemplate="footer">
                <p-button label="Cancel" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (click)="saveDisease()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
    `,
    providers: [MessageService, DiseaseService, ConfirmationService, CategoryService]
})
export class Diseases implements OnInit {
    diseaseDialog: boolean = false;

    diseases = signal<Disease[]>([]);

    disease!: Disease;

    selectedDiseases!: Disease[] | null;
    categories: Category[] = [];
    submitted: boolean = false;

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols!: Column[];

    constructor(
        private diseaseService: DiseaseService,
        private categoryService: CategoryService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    exportCSV() {
        this.dt.exportCSV();
    }

    ngOnInit() {
        this.loadCategories();
        this.loadDiseases();
        
        this.cols = [
            { field: 'id', header: 'Code', customExportHeader: 'Disease Code' },
            { field: 'name', header: 'Name' },
            { field: 'categoryId', header: 'Category' },
            { field: 'description', header: 'Description' }
        ];
        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    loadCategories() {
        this.categoryService.getAllCategories().subscribe({
            next: (response: Category[]) => {
                this.categories = response.filter(category => !category.deleted);
            },
            error: (error) => {
                console.error('Error loading categories:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Unable to load categories',
                    life: 3000
                });
            }
        });
    }

    getCategoryName(categoryId: string | undefined): string {
        if (!categoryId) return 'No Category';
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name! : 'Unknown Category';
    }
    
    loadDiseases(): void {
        this.diseaseService.getAllDiseases().subscribe({
            next: (response: Disease[]) => {
                this.diseases.set(response.filter(disease => !disease.deleted));
            },
            error: (error) => {
                console.error('Error loading diseases:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Unable to load diseases',
                    life: 3000
                });
            }
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.disease = {};
        this.submitted = false;
        this.diseaseDialog = true;
    }

    editDisease(disease: Disease) {
        this.disease = { ...disease };
        this.diseaseDialog = true;
    }

    deleteSelectedDiseases() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected diseases?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (this.selectedDiseases && this.selectedDiseases.length > 0) {
                    const deletePromises = this.selectedDiseases.map(disease => {
                        if (disease.id) {
                            return this.diseaseService.deleteDisease(disease.id).toPromise();
                        }
                        return Promise.resolve();
                    });
                    
                    Promise.all(deletePromises)
                        .then(() => {
                            this.diseases.set(this.diseases().filter(val => !this.selectedDiseases?.includes(val)));
                            this.selectedDiseases = null;
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Diseases Deleted',
                                life: 3000
                            });
                            this.loadDiseases(); // Refresh the list
                        })
                        .catch(error => {
                            console.error('Error deleting diseases:', error);
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to delete diseases',
                                life: 3000
                            });
                        });
                }
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
                if (disease.id) {
                    this.diseaseService.deleteDisease(disease.id).subscribe({
                        next: () => {
                            this.diseases.set(this.diseases().filter(val => val.id !== disease.id));
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Disease Deleted',
                                life: 3000
                            });
                        },
                        error: (error) => {
                            console.error('Error deleting disease:', error);
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to delete disease',
                                life: 3000
                            });
                        }
                    });
                }
            }
        });
    }

    saveDisease() {
        this.submitted = true;
        
        if (this.disease.name?.trim()) {
            if (this.disease.id) {
                // Update existing disease
                this.diseaseService.updateDisease(this.disease.id, this.disease).subscribe({
                    next: (updatedDisease) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Disease Updated',
                            life: 3000
                        });
                        this.loadDiseases(); // Refresh the list
                    },
                    error: (error) => {
                        console.error('Error updating disease:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to update disease',
                            life: 3000
                        });
                    }
                });
            } else {
                // Create new disease
                this.diseaseService.createDisease(this.disease).subscribe({
                    next: (newDisease) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Disease Created',
                            life: 3000
                        });
                        this.loadDiseases(); // Refresh the list
                    },
                    error: (error) => {
                        console.error('Error creating disease:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to create disease',
                            life: 3000
                        });
                    }
                });
            }

            this.diseaseDialog = false;
            this.disease = {};
        }
    }
}