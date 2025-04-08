import { Component, inject, OnInit, signal, ViewChild, ViewEncapsulation } from '@angular/core';
import { ConfirmationService, MessageService, TreeNode } from 'primeng/api';
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
import { StepperModule } from 'primeng/stepper';
import { Ingredient, Remedy } from '../../models';
import { RemedyService } from '../../services/remedy.service';
import { ListboxModule } from 'primeng/listbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { CountryService } from '../service/country.service';
import { NodeService } from '../service/node.service';
interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

interface City {
    name: string;
    code?: string;
    // Autres propriétés si nécessaires
}

@Component({
    selector: 'app-remedies-crud',
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
        ConfirmDialogModule,
        StepperModule,
        ListboxModule,
        MultiSelectModule
    ],
    template: `
        <p-toolbar styleClass="mb-6">
            <ng-template #start>
                <p-button label="Nouveau" icon="pi pi-plus" severity="secondary" class="mr-2" (onClick)="openNew()" />
                <p-button severity="secondary" label="Supprimer" icon="pi pi-trash" outlined (onClick)="deleteSelectedRemedies()" [disabled]="!selectedRemedies || !selectedRemedies.length" />
            </ng-template>

            <ng-template #end>
                <p-button label="Exporter" icon="pi pi-upload" severity="secondary" (onClick)="exportCSV()" />
            </ng-template>
        </p-toolbar>

        <p-table
            #dt
            [value]="remedies()"
            [rows]="10"
            [columns]="cols"
            [paginator]="true"
            [globalFilterFields]="['name', 'country.name', 'ecole', 'representative.name', 'status']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedRemedies"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} remedies"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
        >
            <ng-template #caption>
                <div class="flex items-center justify-between">
                    <h5 class="m-0">Gestion Des Remedes</h5>
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
            <ng-template #body let-remedy>
                <tr>
                    <td style="width: 3rem">
                        <p-tableCheckbox [value]="remedy" />
                    </td>
                    <td style="min-width: 12rem">{{ remedy.id }}</td>
                    <td style="min-width: 16rem">{{ remedy.name }}</td>

                    <td>
                        <img [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + remedy.image" [alt]="remedy.name" style="width: 64px" class="rounded" />
                    </td>

                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editRemedy(remedy)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteRemedy(remedy)" />
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editRemedy(remedy)" />
                    </td>
                </tr>
            </ng-template>
        </p-table>

<p-dialog [(visible)]="remedyDialog" [style]="{ width: '600px' }" header="Details De La Remède" [modal]="true">
    <ng-template #content>
        <div class="flex flex-col gap-6">
            <!-- Gestion des étapes -->
            <p-stepper [value]="activeStep" styleClass="custom-stepper">
                <p-step-list>
                    <p-step [value]="0">Informations de base</p-step>
                    <p-step [value]="1">Ingrédients</p-step>
                    <p-step [value]="2">Instructions</p-step>
                </p-step-list>
            </p-stepper>
            <!-- Étape 1 : Informations de base -->
            <div *ngIf="activeStep === 0">
                <div>
                    <label for="maladies" class="block font-bold mb-3">Maladies</label>
                    <p-multiselect
                        [options]="cities"
                        [(ngModel)]="selectedCities"
                        placeholder="Sélectionnez des maladies"
                        optionLabel="name"
                        display="chip"
                        styleClass="w-full"
                    ></p-multiselect>
                </div>
                <div>
                    <label for="name" class="block font-bold mb-3">Nom</label>
                    <input type="text" pInputText id="name" [(ngModel)]="remedy.name" required autofocus class="w-full" />
                    <small class="text-red-500" *ngIf="submitted && !remedy.name">Le nom est requis.</small>
                </div>
                <div>
                    <label for="val" class="block font-bold mb-3">Valeur</label>
                    <input type="number" pInputText id="val" [(ngModel)]="remedy.value" required class="w-full" />
                    <small class="text-red-500" *ngIf="submitted && !remedy.value">La valeur est requise.</small>
                </div>
                <div>
                    <label for="description" class="block font-bold mb-3">Description</label>
                    <textarea
                        id="description"
                        pTextarea
                        [(ngModel)]="remedy.description"
                        required
                        rows="3"
                        cols="20"
                        class="w-full"
                    ></textarea>
                </div>
            </div>

            <!-- Étape 2 : Ingrédients -->
            <div *ngIf="activeStep === 1">
                <div>
                    <label for="ingredients" class="block font-bold mb-3">Ingrédients</label>
                    <p-multiselect
                        [options]="cities"
                        [(ngModel)]="selectedCities"
                        placeholder="Sélectionnez des ingrédients"
                        optionLabel="name"
                        display="chip"
                        styleClass="w-full"
                    ></p-multiselect>
                </div>
                <div class="mt-4">
                    <p-button label="Ajouter un ingrédient" icon="pi pi-plus" (click)="addIngredientField()" class="mb-3"></p-button>
                    <div *ngFor="let ingredient of additionalIngredients; let i = index" class="flex items-center gap-3">
                        <input
                            type="text"
                            pInputText
                            [(ngModel)]="additionalIngredients[i]"
                            placeholder="Nom de l'ingrédient"
                            class="w-full"
                        />
                        <p-button icon="pi pi-trash" class="p-button-danger" (click)="removeIngredientField(i)"></p-button>
                    </div>
                </div>
            </div>

            <!-- Étape 3 : Instructions -->
            <div *ngIf="activeStep === 2">
                <div>
                    <label for="instructions" class="block font-bold mb-3">Instructions</label>
                    <div class="mt-4">
                        <p-button label="Ajouter une instruction" icon="pi pi-plus" (click)="addInstructionField()" class="mb-3"></p-button>
                        <div *ngFor="let instruction of instructions; let i = index" class="flex items-center gap-3">
                            <textarea
                                pTextarea
                                [(ngModel)]="instructions[i]"
                                placeholder="Instruction"
                                rows="2"
                                class="w-full"
                            ></textarea>
                            <p-button icon="pi pi-trash" class="p-button-danger" (click)="removeInstructionField(i)"></p-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </ng-template>
    <ng-template #footer>
        <p-button
            label="Précédent"
            icon="pi pi-arrow-left"
            (click)="previousStep()"
            [disabled]="activeStep === 0"
            class="mr-2"
        ></p-button>
        <p-button
            label="Suivant"
            icon="pi pi-arrow-right"
            (click)="nextStep()"
            [disabled]="activeStep === 2"
            class="mr-2"
        ></p-button>
        <p-button label="Annuler" icon="pi pi-times" text (click)="hideDialog()" />
        <p-button label="Enregistrer" icon="pi pi-check" (click)="saveRemedy()" [disabled]="activeStep !== 2" />
    </ng-template>
</p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
    `,
    encapsulation: ViewEncapsulation.None,
    providers: [MessageService, RemedyService, CountryService, ConfirmationService, NodeService]
})
export class Remedies implements OnInit {
    remedyDialog: boolean = false;

    remedies = signal<Remedy[]>([]);
    autoValue: any[] | undefined;

    remedy!: Remedy;

    selectedRemedies!: Remedy[] | null;
    submitted: boolean = false;

    statuses!: any[];

    nodeService = inject(NodeService);

    cities: City[] = [];
    selectedCities: City[] = [];

    @ViewChild('dt') dt!: Table;
    treeSelectNodes!: TreeNode[];

    exportColumns!: ExportColumn[];

    cols!: Column[];












    activeStep: number = 0; // Étape active
additionalIngredients: string[] = []; // Ingrédients supplémentaires
instructions: string[] = []; // Instructions supplémentaires

nextStep() {
    if (this.activeStep < 2) {
        this.activeStep++;
    }
}

previousStep() {
    if (this.activeStep > 0) {
        this.activeStep--;
    }
}

addIngredientField() {
    this.additionalIngredients.push('');
}

removeIngredientField(index: number) {
    this.additionalIngredients.splice(index, 1);
}

addInstructionField() {
    this.instructions.push('');
}

removeInstructionField(index: number) {
    this.instructions.splice(index, 1);
}




















    constructor(
        private remedyService: RemedyService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    exportCSV() {
        this.dt.exportCSV();
    }

    ngOnInit() {
        this.cities = [
            { name: 'Paris', code: 'PAR' },
            { name: 'Lyon', code: 'LYN' },
            { name: 'Marseille', code: 'MAR' },
            { name: 'Toulouse', code: 'TOU' },
            { name: 'Bordeaux', code: 'BOR' }
        ];
        this.loadDemoData();

        this.nodeService.getFiles().then((data) => (this.treeSelectNodes = data));
    }

    loadDemoData() {
        this.remedyService.getRemedies().then((data) => {
            this.remedies.set(data);
        });

        this.statuses = [
            { label: 'INSTOCK', value: 'instock' },
            { label: 'LOWSTOCK', value: 'lowstock' },
            { label: 'OUTOFSTOCK', value: 'outofstock' }
        ];

        this.cols = [
            { field: 'code', header: 'Code', customExportHeader: 'Remedy Code' },
            { field: 'name', header: 'Name' }
        ];

        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.remedy = {};
        this.submitted = false;
        this.remedyDialog = true;
    }

    editRemedy(remedy: Remedy) {
        this.remedy = { ...remedy };
        this.remedyDialog = true;
    }

    deleteSelectedRemedies() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected remedy?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.remedies.set(this.remedies().filter((val) => !this.selectedRemedies?.includes(val)));
                this.selectedRemedies = null;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'remedy Deleted',
                    life: 3000
                });
            }
        });
    }

    hideDialog() {
        this.remedyDialog = false;
        this.submitted = false;
    }

    deleteRemedy(remedy: Remedy) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete ' + remedy.name + '?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.remedies.set(this.remedies().filter((val) => val.id !== remedy.id));
                this.remedy = {};
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Remedy Deleted',
                    life: 3000
                });
            }
        });
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.remedies().length; i++) {
            if (this.remedies()[i].id === id) {
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

    saveRemedy() {
        this.submitted = true;
        let _remedies = this.remedies();
        if (this.remedy.name?.trim()) {
            if (this.remedy.id) {
                _remedies[this.findIndexById(this.remedy.id)] = this.remedy;
                this.remedies.set([..._remedies]);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Remedy Updated',
                    life: 3000
                });
            } else {
                this.remedy.id = this.createId();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Remedy Created',
                    life: 3000
                });
                console.log('les données', this.remedy);

                this.remedies.set([..._remedies, this.remedy]);
            }

            this.remedyDialog = false;
            this.remedy = {};
        }
    }
}
