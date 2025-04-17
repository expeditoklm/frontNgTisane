import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CategoryService } from '../../services/category.service';
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
    selector: 'app-categories',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        TextareaModule,
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
                <p-button severity="secondary" label="Supprimer" icon="pi pi-trash" outlined (onClick)="deleteSelectedCategories()" [disabled]="!selectedCategories || !selectedCategories.length" />
            </ng-template>

            <ng-template pTemplate="end">
                <p-button label="Exporter" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="categories()"
            [rows]="10"
            [columns]="cols"
            [paginator]="true"
            [globalFilterFields]="['name']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedCategories"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} categories"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
        >
            <ng-template pTemplate="caption">
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Gestion Des Catégories</h5>
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
                    <th style="min-width: 12rem"></th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-category>
                <tr>
                    <td style="width: 3rem">
                        <p-tableCheckbox [value]="category" />
                    </td>
                    <td style="min-width: 12rem">{{ category.id }}</td>
                    <td style="min-width: 16rem">{{ category.name }}</td>
                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editCategory(category)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteCategory(category)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="categoryDialog" [style]="{ width: '450px' }" header="Details De La Catégorie" [modal]="true">
            <ng-template pTemplate="content">
                <div class="flex flex-col gap-6">
                    <div>
                        <label for="name" class="block font-bold mb-3">Nom</label>
                        <input type="text" pInputText id="name" [(ngModel)]="category.name" required autofocus [style]="{ width: '100%' }" />
                        <small class="text-red-500" *ngIf="submitted && !category.name">Le nom est requis.</small>
                    </div>
                </div>
            </ng-template>

            <ng-template pTemplate="footer">
                <p-button label="Cancel" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (click)="saveCategory()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
    `,
    providers: [MessageService, CategoryService, ConfirmationService]
})
export class Categories implements OnInit {
    categoryDialog: boolean = false;

    categories = signal<Category[]>([]);

    category!: Category;

    selectedCategories!: Category[] | null;
    submitted: boolean = false;

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols!: Column[];

    constructor(
        private categoryService: CategoryService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    exportCSV() {
        this.dt.exportCSV();
    }

    ngOnInit() {
        this.loadCategories();
        
        this.cols = [
            { field: 'id', header: 'Code', customExportHeader: 'Category Code' },
            { field: 'name', header: 'Name' }
        ];
        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }
    
    loadCategories(): void {
        this.categoryService.getAllCategories().subscribe({
            next: (response: Category[]) => {
                this.categories.set(response.filter(category => !category.deleted));
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

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.category = {};
        this.submitted = false;
        this.categoryDialog = true;
    }

    editCategory(category: Category) {
        this.category = { ...category };
        this.categoryDialog = true;
    }

    deleteSelectedCategories() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected categories?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (this.selectedCategories && this.selectedCategories.length > 0) {
                    const deletePromises = this.selectedCategories.map(category => {
                        if (category.id) {
                            return this.categoryService.deletedcategorie(category.id).toPromise();
                        }
                        return Promise.resolve();
                    });
                    
                    Promise.all(deletePromises)
                        .then(() => {
                            this.categories.set(this.categories().filter(val => !this.selectedCategories?.includes(val)));
                            this.selectedCategories = null;
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Categories Deleted',
                                life: 3000
                            });
                            this.loadCategories(); // Refresh the list
                        })
                        .catch(error => {
                            console.error('Error deleting categories:', error);
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to delete categories',
                                life: 3000
                            });
                        });
                }
            }
        });
    }

    hideDialog() {
        this.categoryDialog = false;
        this.submitted = false;
    }

    deleteCategory(category: Category) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + category.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (category.id) {
                    this.categoryService.deletedcategorie(category.id).subscribe({
                        next: () => {
                            this.categories.set(this.categories().filter(val => val.id !== category.id));
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Category Deleted',
                                life: 3000
                            });
                        },
                        error: (error) => {
                            console.error('Error deleting category:', error);
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to delete category',
                                life: 3000
                            });
                        }
                    });
                }
            }
        });
    }

    saveCategory() {
        this.submitted = true;
        
        if (this.category.name?.trim()) {
            if (this.category.id) {
                console.log('Updating category:', this.category);

                // Only send necessary update fields
            const updatePayload = {
                name: this.category.name
                // Add other editable fields here if needed
            };
                // Update existing category
                this.categoryService.updatedCategorie(this.category.id, updatePayload).subscribe({
                    next: (updatedCategory) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Category Updated',
                            life: 3000
                        });
                        this.loadCategories(); // Refresh the list

                        console.log('Category updated successfully:', updatedCategory);
                    },
                    error: (error) => {
                        console.error('Error updating category:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to update category',
                            life: 3000
                        });
                    }
                });
            } else {
                // Create new category
                this.categoryService.createcategorie(this.category).subscribe({
                    next: (newCategory) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Category Created',
                            life: 3000
                        });
                        this.loadCategories(); // Refresh the list
                    },
                    error: (error) => {
                        console.error('Error creating category:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to create category',
                            life: 3000
                        });
                    }
                });
            }

            this.categoryDialog = false;
            this.category = {};
        }
    }
}