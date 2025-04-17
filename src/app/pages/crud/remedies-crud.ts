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
import { Disease, Ingredient, Remedy } from '../../models';
import { ListboxModule } from 'primeng/listbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { CountryService } from '../service/country.service';
import { DiseaseService } from '../../services/disease.service';
import { RemedyService } from '../../services/remedy.service';
import { IngredientService } from '../../services/ingredient.service';
import { forkJoin } from 'rxjs';
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
        <p-toast></p-toast>
        
        <p-toolbar styleClass="mb-6 flex-wrap">
            <ng-template #start>
                <div class="flex gap-2 flex-wrap">
                    <p-button label="Nouveau" icon="pi pi-plus" severity="secondary" (onClick)="openNew()" />
                    <p-button severity="secondary" label="Supprimer" icon="pi pi-trash" outlined (onClick)="deleteSelectedRemedies()" [disabled]="!selectedRemedies || !selectedRemedies.length" />
                </div>
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
            [tableStyle]="{ 'min-width': '100%' }"
            [(selection)]="selectedRemedies"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} remedies"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
            [responsive]="true"
            styleClass="p-datatable-sm p-datatable-responsive-demo"
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
                    <th style="min-width: 8rem">Code</th>
                    <th pSortableColumn="name" style="min-width:10rem">
                        Nom
                        <p-sortIcon field="name" />
                    </th>

                    <th pSortableColumn="value" style="min-width:10rem">
                        Valeur 
                        <p-sortIcon field="value" />
                    </th>
                    <th style="min-width: 8rem"></th>
                </tr>
            </ng-template>
            <ng-template #body let-remedy>
                <tr>
                <td style="width: 3rem">
                        <p-tableCheckbox [value]="remedy" />
                    </td>
                    <td style="min-width: 12rem">{{ remedy.id }}</td>
                    <!-- <pre>{{ remedy | json }}</pre>  -->
                    <td style="min-width: 16rem">{{ remedy.name }}</td>
                    <td style="min-width: 16rem">{{ remedy.value }}</td>
                
                    <td>
                        <div class="flex flex-wrap gap-2">
                            <p-button icon="pi pi-pencil" [rounded]="true" [outlined]="true" (click)="editRemedy(remedy)" />
                            <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteRemedy(remedy)" />
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="remedyDialog" [style]="{ width: '90%', maxWidth: '600px'}" header="Details De La Remède" [modal]="true" [responsive]="true" [breakpoints]="{'960px': '75vw', '640px': '90vw'}">
            <ng-template #content>
                <div class="flex flex-col gap-6">
                    <!-- Gestion des étapes -->
                    <p-stepper [value]="activeStep" styleClass="custom-stepper">
                        <p-step-list>
                            <p-step [value]="0">Informations</p-step>
                            <p-step [value]="1">Ingrédients</p-step>
                            <p-step [value]="2">Instructions</p-step>
                        </p-step-list>
                    </p-stepper>
                    <!-- Étape 1 : Informations de base -->
                    <div *ngIf="activeStep === 0">
                        <div class="field mb-4">
                            <label for="maladies" class="block font-bold mb-3">Maladies</label>
                            <p-multiSelect
                                [options]="diseases"
                                [(ngModel)]="selectedDiseases"
                                placeholder="Sélectionnez des maladies"
                                optionLabel="name"
                                display="chip"
                                styleClass="w-full"
                            ></p-multiSelect>
                        </div>
                        <div class="field mb-4">
                            <label for="name" class="block font-bold mb-3">Nom</label>
                            <input type="text" pInputText id="name" [(ngModel)]="remedy.name" required autofocus class="w-full" />
                            <small class="text-red-500" *ngIf="submitted && !remedy.name">Le nom est requis.</small>
                        </div>
                        <div class="field mb-4">
                            <label for="val" class="block font-bold mb-3">Valeur</label>
                            <input type="number" pInputText id="val" [(ngModel)]="remedy.value" required class="w-full" />
                            <small class="text-red-500" *ngIf="submitted && !remedy.value">La valeur est requise.</small>
                        </div>
                        <div class="field">
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
                    <div class="field mb-4">
                            <label for="ingredients" class="block font-bold mb-3">Ingrédients</label>
                            <p-multiSelect
                                [options]="ingredients"
                                [(ngModel)]="selectedIngredients"
                                placeholder="Sélectionnez des ingrédients"
                                optionLabel="name"
                                display="chip"
                                styleClass="w-full"
                                [style]="{'z-index': '1000', 'position': 'relative', 'width': '100%', 'max-width': '100%', 'margin': '0 auto','height': 'auto'}"
                                [panelStyle]="{'z-index': '1000', 'position': 'absolute', 'width': '100%', 'max-width': '100%', 'margin': '0 auto','height': 'auto'}"
                                appendTo="body"
                            ></p-multiSelect>
                        </div>
                        <div class="mt-4" *ngIf="!remedy.ingredients || remedy.ingredients.length > 0">
                            <p-button label="Ajouter un ingrédient" icon="pi pi-plus" (click)="addIngredientField()" class="mb-3"></p-button>
                            <div *ngFor="let ingredient of additionalIngredients; let i = index" class="flex items-center gap-3 mb-2">
                                <input
                                    type="text"
                                    pInputText
                                    [(ngModel)]="additionalIngredients[i].name"
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
            <!-- Instructions existantes -->
            <div *ngIf="remedy.instructions && remedy.instructions.length > 0">
                <p class="font-semibold mb-2">Instructions existantes:</p>
                <div *ngFor="let instruction of remedy.instructions; let i = index" class="flex items-center gap-3 mb-2">
                    <textarea
                        pTextarea
                        [(ngModel)]="instruction.text"
                        placeholder="Instruction"
                        rows="2"
                        class="w-full"
                    ></textarea>
                    <p-button icon="pi pi-trash" class="p-button-danger" (click)="removeExistingInstruction(i)"></p-button>
                </div>
            </div>
            
            <!-- Nouvelles instructions -->
            <p *ngIf="instructions.length > 0" class="font-semibold mb-2 mt-4">Nouvelles instructions:</p>
            <div *ngFor="let instruction of instructions; let i = index" class="flex items-center gap-3 mb-2">
                <textarea
                    pTextarea
                    [(ngModel)]="instructions[i]"
                    placeholder="Instruction"
                    rows="2"
                    class="w-full"
                ></textarea>
                <p-button icon="pi pi-trash" class="p-button-danger" (click)="removeInstructionField(i)"></p-button>
            </div>
            
            <p-button label="Ajouter une instruction" icon="pi pi-plus" (click)="addInstructionField()" class="mb-3 mt-3"></p-button>
        </div>
    </div>
</div>
                </div>
            </ng-template>
            <ng-template #footer>
                <div class="flex flex-wrap justify-content-between gap-2">
                    <div>
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
                    </div>
                    <div>
                        <p-button label="Annuler" icon="pi pi-times" text (click)="hideDialog()" class="mr-2" />
                        <p-button label="Enregistrer" icon="pi pi-check" (click)="saveRemedy()" [disabled]="activeStep !== 2" />
                    </div>
                </div>
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
    `,
    encapsulation: ViewEncapsulation.None,

    providers: [MessageService, RemedyService, CountryService, ConfirmationService, IngredientService]
})
export class Remedies implements OnInit {
    remedyDialog: boolean = false;

    remedies = signal<Remedy[]>([]);
    autoValue: any[] | undefined;

    remedy!: Remedy;

    selectedRemedies!: Remedy[] | null;
    submitted: boolean = false;



    diseases: Disease[] = [];
    selectedDiseases: Disease[] = [];

    ingredients: Ingredient[] = [];
    selectedIngredients: Ingredient[] = [];




    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols!: Column[];

    activeStep: number = 0; // Étape active
    additionalIngredients: Ingredient[] = []; // Ingrédients supplémentaires
    instructions: any[] = []; // Instructions supplémentaires
    instructions2: any[] = []; // Instructions supplémentaires
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
        this.additionalIngredients.push({} as Ingredient);
    }

    removeIngredientField(index: number) {
        this.additionalIngredients.splice(index, 1);
    }

    updateToRemoveInstructionField(id: string) {
        //appel api pour supprimer l'instruction
    }

    addInstructionField() {
        this.instructions.push('');
    }

    removeInstructionField(index: number) {
        this.instructions.splice(index, 1);
    }

    removeExistingInstruction(index: number) {
        if (this.remedy.instructions) {
            this.remedy.instructions.splice(index, 1);
        }
    }

    constructor(
        private remedyService: RemedyService,
        private diseaseService: DiseaseService,
        private ingredientService: IngredientService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    exportCSV() {
        this.dt.exportCSV();
    }

    ngOnInit() {
        this.loadDiseases()
        this.loadIngredients()
        this.loadDemoData();
    }

    loadDiseases() {

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



    loadIngredients() {

        this.ingredientService.getAllIngredients().subscribe({
            next: (response: any) => {
                //   console.log('ingredients de l\'API :', response);
                this.ingredients = response.map((ingredient: any) => ({ name: ingredient.name, code: ingredient.id }));

            },
            error: (error) => {
                console.log('Erreur lors de la connexion :', error);
                const errorMessage = error?.error?.message || 'Coordonnées Invalides';
                // this.toastService.showError(errorMessage);
            }
        });

    }

    loadDemoData(): void {
        this.remedyService.getAllRemidies().subscribe({
            next: (response: any) => {
                // console.log('Réponse de l\'API :', response);
                this.remedies.set(response);
            },
            error: (error) => {
                console.log('Erreur lors de la connexion :', error);
                const errorMessage = error?.error?.message || 'Coordonnées Invalides';
                // this.toastService.showError(errorMessage);
            }
        });

        this.cols = [
            { field: 'id', header: 'Code', customExportHeader: 'Remedy Code' },
            { field: 'name', header: 'Name' },
            { field: 'value', header: 'Valeur' },
        ];
        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }



    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {


        this.selectedDiseases = [];
        this.selectedIngredients = [];
        this.remedy = {};
        this.submitted = false;
        this.remedyDialog = true;
        this.activeStep = 0;
        this.additionalIngredients = [];
        this.instructions = [];
    }


    editRemedy(remedy: Remedy) {
        this.remedy = { ...remedy };
        this.remedyDialog = true;
        this.activeStep = 0;
        this.additionalIngredients = [];
        this.instructions = [];

        // Récupérer les maladies associées
        this.remedyService.getAllDiseasesRemedies().subscribe({
            next: (response: any) => {
                if (remedy) {
                    const remedyId = remedy.id;

                    const associatedDiseaseIds = response
                        .filter((remedyDisease: any) => remedyDisease.remedyId === remedyId)
                        .map((remedyDisease: any) => remedyDisease.diseaseId);

                    this.selectedDiseases = this.diseases.filter(
                        (disease: Disease) => associatedDiseaseIds.includes((disease as any).code)
                    );
                }
            },
            error: (error) => {
                console.log('Erreur lors de la récupération des maladies:', error);
            }
        });

        // Récupérer les ingrédients associés
        this.ingredientService.getAllIngredientsRemedies().subscribe({
            next: (response: any) => {
                if (remedy) {
                    const remedyId = remedy.id;

                    const associatedIngredientIds = response
                        .filter((remedyIngredient: any) => remedyIngredient.remedyId === remedyId)
                        .map((remedyIngredient: any) => remedyIngredient.ingredientId);

                    this.selectedIngredients = this.ingredients.filter(
                        (ingredient: Ingredient) => associatedIngredientIds.includes((ingredient as any).code)
                    );
                }
            },
            error: (error) => {
                console.log('Erreur lors de la récupération des ingrédients:', error);
            }
        });

        // Copier les instructions existantes
        if (remedy.instructions && Array.isArray(remedy.instructions)) {
            this.remedy.instructions = [...remedy.instructions];
        } else {
            this.remedy.instructions = [];
        }
    }




    submitEditedRemedy() {
        // Préparer l'objet au format attendu par l'API
        const formattedRemedy = {
            name: this.remedy.name,
            value: this.remedy.value,
            description: this.remedy.description,
            ingredientIds: this.selectedIngredients.map(ingredient => (ingredient as any).code || ingredient.id),
            newIngredients: this.additionalIngredients.map(ingredient => ({
                name: ingredient.name,
                // Ajoutez d'autres propriétés nécessaires selon votre DTO
            })),
            diseaseIds: this.selectedDiseases.map(disease => (disease as any).code || disease.id),
            instructions: [
                // Inclure les instructions existantes modifiées
                ...(this.remedy.instructions || []).map(instruction => ({
                    id: instruction.id,
                    stepNumber: instruction.stepNumber,
                    text: instruction.text,
                    remedyId: this.remedy.id
                })),
                // Ajouter les nouvelles instructions
                ...this.instructions.map((instructionText, index) => ({
                    stepNumber: (this.remedy.instructions?.length || 0) + index + 1,
                    text: typeof instructionText === 'string' ? instructionText.trim() : instructionText.text?.trim() || '',
                    remedyId: this.remedy.id
                }))
            ]
        };

        console.log('formattedRemedy', formattedRemedy);

        // Appel à l'API pour mettre à jour le remède
        this.remedyService.updateRemedy(this.remedy.id!, formattedRemedy).subscribe({
            next: (response) => {
                console.log('Remède mis à jour avec succès', response);
                this.remedyDialog = false;

                // Mettre à jour la liste des remèdes
                this.loadDemoData(); // Recharger tous les remèdes
            },
            error: (error) => {
                console.log('Erreur lors de la mise à jour du remède:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors de la mise à jour du remède',
                    life: 3000
                });
            }
        });
    }




    submitCreatedRemedy() {
        // Préparer l'objet au format attendu par l'API
        const formattedRemedy = {
            name: this.remedy.name,
            value: this.remedy.value,
            description: this.remedy.description,
            ingredientIds: this.selectedIngredients.map(ingredient => (ingredient as any).code || ingredient.id),
            newIngredients: this.additionalIngredients.map(ingredient => ({
                name: ingredient.name,
                // Ajoutez d'autres propriétés nécessaires selon votre DTO
            })),
            diseaseIds: this.selectedDiseases.map(disease => (disease as any).code || disease.id),
            instructions: [
                // Inclure les instructions existantes modifiées
                ...(this.remedy.instructions || []).map(instruction => ({
                    id: instruction.id,
                    stepNumber: instruction.stepNumber,
                    text: instruction.text,
                    remedyId: this.remedy.id
                })),
                // Ajouter les nouvelles instructions
                ...this.instructions.map((instructionText, index) => ({
                    stepNumber: (this.remedy.instructions?.length || 0) + index + 1,
                    text: typeof instructionText === 'string' ? instructionText.trim() : instructionText.text?.trim() || '',
                    remedyId: this.remedy.id
                }))
            ]
        };

        console.log('formattedRemedy', formattedRemedy);

        // Appel à l'API pour mettre à jour le remède
        this.remedyService.createRemedy(formattedRemedy).subscribe({
            next: (response) => {
                console.log('Remède mis à jour avec succès', response);
                this.remedyDialog = false;

                // Mettre à jour la liste des remèdes
                this.loadDemoData(); // Recharger tous les remèdes
            },
            error: (error) => {
                console.log('Erreur lors de la mise à jour du remède:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors de la mise à jour du remède',
                    life: 3000
                });
            }
        });
    }









deleteSelectedRemedies() {
    if (!this.selectedRemedies || this.selectedRemedies.length === 0) {
        return; // Pas de remèdes sélectionnés
    }
    

    this.confirmationService.confirm({
        message: 'Are you sure you want to delete the selected remedies?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            // Créer un tableau de requêtes de suppression
            const deleteRequests = this.selectedRemedies!
                .filter((remedy:any) => remedy.id) // Assurez-vous que l'ID existe
                .map((remedy:any) => this.remedyService.deletedRemedy(remedy.id!));
            
            // Si aucune requête à exécuter, arrêter ici
            if (deleteRequests.length === 0) {
                return;
            }
            
            // Exécuter toutes les requêtes de suppression en parallèle
            forkJoin(deleteRequests).subscribe({
                next: (results) => {
                    console.log('Tous les remèdes ont été supprimés avec succès');
                    
                    // Mettre à jour la liste locale
                    this.remedies.set(this.remedies().filter(val => 
                        !this.selectedRemedies?.some(sr => sr.id === val.id)
                    ));
                    
                    this.selectedRemedies = null;
                    
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Remedies Deleted',
                        life: 3000
                    });
                },
                error: (error) => {
                    console.error('Erreur lors de la suppression des remèdes:', error);
                    
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to delete some remedies',
                        life: 3000
                    });
                    
                    // Recharger les données pour s'assurer que l'UI est synchronisée
                    this.loadDemoData();
                }
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
                // Appel à l'API seulement si l'utilisateur confirme
                this.remedyService.deletedRemedy(remedy.id!).subscribe({
                    next: () => {
                        // Mettre à jour l'UI seulement après succès de l'API
                        this.remedies.set(this.remedies().filter(val => val.id !== remedy.id));
                        this.remedy = {};
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Remedy Deleted',
                            life: 3000
                        });
                    },
                    error: (error) => {
                        console.error('Error deleting remedy:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete remedy',
                            life: 3000
                        });
                    }
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

                this.submitEditedRemedy()

                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Remedy Updated',
                    life: 3000
                });
            } else {
                this.remedy.id = this.createId();
                this.submitCreatedRemedy();
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