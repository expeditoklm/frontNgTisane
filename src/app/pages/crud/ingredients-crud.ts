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
import { Ingredient } from '../../models';
import { IngredientService } from '../../services/ingredient.service';
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
    selector: 'app-ingredients-crud',
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
                <p-button severity="secondary" label="Supprimer" icon="pi pi-trash" outlined (onClick)="deleteSelectedIngredients()" [disabled]="!selectedIngredients || !selectedIngredients.length" />
            </ng-template>

            <ng-template #end>
                <p-button label="Exporter" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="ingredients()"
            [rows]="10"
            [columns]="cols"
            [paginator]="true"
            [globalFilterFields]="['name', 'country.name', 'ecole', 'representative.name', 'status']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedIngredients"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} ingredients"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Gestion Des Ingrédients</h5>
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

                    <th>Image</th>

                    <th style="min-width: 12rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-ingredient>
                <tr>
                    <td style="width: 3rem">
                        <p-tableCheckbox [value]="ingredient" />
                    </td>
                    <td style="min-width: 12rem">{{ ingredient.id }}</td>
                    <td style="min-width: 16rem">{{ ingredient.name }}</td>

                    <td>
                        <img [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + ingredient.image" [alt]="ingredient.name" style="width: 64px" class="rounded" />
                    </td>

                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editIngredient(ingredient)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteIngredient(ingredient)" />
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editIngredient(ingredient)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="ingredientDialog" [style]="{ width: '450px' }" header="Details De L'ingrédient" [modal]="true">
            <ng-template #content>
                <div class="flex flex-col gap-6">
                    <img [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + ingredient.image" [alt]="ingredient.image" class="block m-auto pb-4" *ngIf="ingredient.image" />

                    <div>
                        <label for="name" class="block font-bold mb-3">Nom</label>
                        <input type="text" pInputText id="name" [(ngModel)]="ingredient.name" required autofocus fluid />
                        <small class="text-red-500" *ngIf="submitted && !ingredient.name">Le nom est requis.</small>
                    </div>
                    <div>
                        <label for="description" class="block font-bold mb-3">Description</label>
                        <textarea id="description" pTextarea [(ngModel)]="ingredient.description" required rows="3" cols="20" fluid></textarea>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Cancel" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Save" icon="pi pi-check" (click)="saveIngredient()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
    `,
    providers: [MessageService, IngredientService, ConfirmationService]
})
export class Ingredients implements OnInit {
    ingredientDialog: boolean = false;

    ingredients = signal<Ingredient[]>([]);

    ingredient!: Ingredient;

    selectedIngredients!: Ingredient[] | null;

    submitted: boolean = false;

    statuses!: any[];

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols!: Column[];

    constructor(
        private ingredientService: IngredientService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    exportCSV() {
        this.dt.exportCSV();
    }

    ngOnInit() {
        this.loadDemoData();
    }

    loadDemoData() {
        this.ingredientService.getIngredients().then((data) => {
            this.ingredients.set(data);
        });

        this.cols = [
            { field: 'code', header: 'Code', customExportHeader: 'Ingredient Code' },
            { field: 'name', header: 'Name' }
        ];

        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.ingredient = {};
        this.submitted = false;
        this.ingredientDialog = true;
    }

    editIngredient(ingredient: Ingredient) {
        this.ingredient = { ...ingredient };
        this.ingredientDialog = true;
    }

    deleteSelectedIngredients() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected ingredient?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.ingredients.set(this.ingredients().filter((val) => !this.selectedIngredients?.includes(val)));
                this.selectedIngredients = null;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'ingredient Deleted',
                    life: 3000
                });
            }
        });
    }

    hideDialog() {
        this.ingredientDialog = false;
        this.submitted = false;
    }

    deleteIngredient(ingredient: Ingredient) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + ingredient.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.ingredients.set(this.ingredients().filter((val) => val.id !== ingredient.id));
                this.ingredient = {};
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Ingredient Deleted',
                    life: 3000
                });
            }
        });
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.ingredients().length; i++) {
            if (this.ingredients()[i].id === id) {
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

    saveIngredient() {
        this.submitted = true;
        let _ingredients = this.ingredients();
        if (this.ingredient.name?.trim()) {
            if (this.ingredient.id) {
                _ingredients[this.findIndexById(this.ingredient.id)] = this.ingredient;
                this.ingredients.set([..._ingredients]);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Ingredient Updated',
                    life: 3000
                });
            } else {
                this.ingredient.id = this.createId();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Ingredient Created',
                    life: 3000
                });
                console.log('les données', this.ingredient);

                this.ingredients.set([..._ingredients, this.ingredient]);
            }

            this.ingredientDialog = false;
            this.ingredient = {};
        }
    }
}
