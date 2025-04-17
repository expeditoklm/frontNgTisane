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
import { FileUploadModule } from 'primeng/fileupload';
import { GalleriaModule } from 'primeng/galleria';
import { Ingredient } from '../../models';
import { IngredientService } from '../../services/ingredient.service';
import { finalize } from 'rxjs';

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

interface GalleriaImage {
    itemImageSrc?: string;
    thumbnailImageSrc?: string;
    alt?: string;
    title?: string;
    id?: string; // 
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
        ConfirmDialogModule,
        FileUploadModule,
        GalleriaModule
    ],
    template: `
        <p-toast></p-toast>
        
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
            [globalFilterFields]="['name', 'description']"
            [tableStyle]="{ 'min-width': '75rem' }"
            [(selection)]="selectedIngredients"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} ingredients"
            [showCurrentPageReport]="true"
            [rowsPerPageOptions]="[10, 20, 30]"
            [loading]="loading"
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
                    <th pSortableColumn="description" style="min-width:16rem">
                        Description
                        <p-sortIcon field="description" />
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
                    <td style="min-width: 16rem">{{ ingredient.description }}</td>
                    <td>
                        <img [src]="ingredient.photos?.length ? ingredient.photos[0].url : 'assets/imgs/ingr.png'" [alt]="ingredient.name || 'Ingredient'" style="width: 64px" class="rounded" />
                    </td>
                    <td>
                        <p-button icon="pi pi-pencil" class="mr-2" [rounded]="true" [outlined]="true" (click)="editIngredient(ingredient)" />
                        <p-button icon="pi pi-trash" severity="danger" [rounded]="true" [outlined]="true" (click)="deleteIngredient(ingredient)" />
                    </td>
                </tr>
            </ng-template>
            <ng-template #emptymessage>
                <tr>
                    <td colspan="6">Aucun ingrédient trouvé.</td>
                </tr>
            </ng-template>
        </p-table>

        <p-dialog [(visible)]="ingredientDialog" [style]="{ width: '650px' }" header="Details De L'ingrédient" [modal]="true" styleClass="p-fluid">
            <ng-template #content>
                <div class="flex flex-col gap-6">
                    <!-- Affichage des images existantes en mode carousel lors de l'édition -->
                    <div *ngIf="ingredient.id && galleryImages.length > 0" class="mb-4">
    <label class="block font-bold mb-3">Images existantes</label>
    <p-galleria [value]="galleryImages" [responsiveOptions]="galleriaResponsiveOptions" [containerStyle]="{ 'max-width': '600px' }" [numVisible]="5">
        <ng-template #item let-item>
            <div class="relative">
                <img [src]="item.itemImageSrc" style="width:100%; max-height: 300px; object-fit: contain;" [alt]="item.alt" />
                <!-- Bouton pour supprimer la photo -->
                <button 
                    type="button" 
                    pButton 
                    icon="pi pi-trash" 
                    class="p-button-rounded p-button-danger p-button-sm absolute top-2 right-2"
                    (click)="deletePhoto(item.id, $event)">
                </button>
            </div>
        </ng-template>
        <ng-template #thumbnail let-item>
            <div class="relative">
                <img [src]="item.thumbnailImageSrc" style="width: 70px; height: 70px; object-fit: cover;" [alt]="item.alt" />
            </div>
        </ng-template>
    </p-galleria>
</div>

                    <!-- Upload de nouvelles images -->
                    <div>
                        <label class="block font-bold mb-3">Ajouter des images</label>
                        <p-fileupload 
                            name="demo[]" 
                            (onSelect)="onFileSelect($event)"
                            [multiple]="true" 
                            accept="image/*" 
                            maxFileSize="5000000"
                            [showUploadButton]="false"
                            [showCancelButton]="false"
                            mode="advanced">
                            <ng-template #empty>
                                <div>Glissez et déposez les images ici.</div>
                            </ng-template>
                        </p-fileupload>
                    </div>

                    <div class="field mb-4">
                        <label for="name" class="block font-bold mb-3">Nom</label>
                        <input type="text" pInputText id="name" [(ngModel)]="ingredient.name" required autofocus  class="w-full" />
                        <small class="text-red-500" *ngIf="submitted && !ingredient.name">Le nom est requis.</small>
                    </div>
                    
                    <div class="field mb-4">
                        <label for="description" class="block font-bold mb-3">Description</label>
                        <textarea id="description" pTextarea [(ngModel)]="ingredient.description" rows="3" cols="20"  class="w-full"></textarea>
                    </div>
                </div>
            </ng-template>

            <ng-template #footer>
                <p-button label="Annuler" icon="pi pi-times" text (click)="hideDialog()" />
                <p-button label="Enregistrer" icon="pi pi-check" (click)="saveIngredient()" />
            </ng-template>
        </p-dialog>

        <p-confirmdialog [style]="{ width: '450px' }" />
    `,
    providers: [MessageService, IngredientService, ConfirmationService]
})
export class Ingredients implements OnInit {
    ingredientDialog: boolean = false;
    loading: boolean = true;

    ingredients = signal<Ingredient[]>([]);

    ingredient: Ingredient = {};

    selectedIngredients: Ingredient[] | null = null;

    submitted: boolean = false;

    selectedFiles: File[] = [];
    base64Images: string[] = [];
    galleryImages: GalleriaImage[] = [];
    photosToDelete: string[] = [];
    galleriaResponsiveOptions = [
        {
            breakpoint: '1024px',
            numVisible: 5
        },
        {
            breakpoint: '768px',
            numVisible: 3
        },
        {
            breakpoint: '560px',
            numVisible: 1
        }
    ];

    @ViewChild('dt') dt!: Table;

    exportColumns!: ExportColumn[];

    cols!: Column[];

    constructor(
        private ingredientService: IngredientService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    exportCSV() {
        this.dt.exportCSV();
    }

    ngOnInit() {
        this.loadIngredients();

        this.cols = [
            { field: 'id', header: 'Code', customExportHeader: 'Ingredient Code' },
            { field: 'name', header: 'Nom' },
            { field: 'description', header: 'Description' }
        ];

        this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));
    }

    loadIngredients() {
        this.loading = true;
        this.ingredientService.getAllIngredients()
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (data: Ingredient[]) => {
                    this.ingredients.set(data);
                },
                error: (error) => {
                    console.error('Erreur lors du chargement des ingrédients:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de charger les ingrédients',
                        life: 3000
                    });
                }
            });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.ingredient = {};
        this.submitted = false;
        this.ingredientDialog = true;
        this.selectedFiles = [];
        this.base64Images = [];
        this.galleryImages = [];
        this.photosToDelete = []; //
    }

    

    deletePhoto(photoId: string, event?: Event) {
        // Empêcher la propagation de l'événement
        if (event) {
          event.stopPropagation();
          event.preventDefault();
        }
        
        // Ne pas ajouter d'ID undefined
        if (photoId) {
          this.photosToDelete.push(photoId);
        }
        
        // Mettre à jour l'objet ingrédient
        if (this.ingredient.photos) {
          this.ingredient.photos = this.ingredient.photos.filter(photo => photo.id !== photoId);
          
          // Recréer la gallerie d'images
          this.galleryImages = this.ingredient.photos.map(photo => ({
            itemImageSrc: photo.url,
            thumbnailImageSrc: photo.url,
            alt: this.ingredient.name || 'Image',
            title: this.ingredient.name || 'Image',
            id: photo.id
          }));
        }
        
        this.messageService.add({
          severity: 'info',
          summary: 'Photo marquée pour suppression',
          detail: 'La photo sera supprimée lors de l\'enregistrement',
          life: 3000
        });
      }

   
      














      editIngredient(ingredient: Ingredient) {
        // Charger l'ingrédient complet avec ses photos
        this.loading = true;
        
        // Réinitialiser ces variables avant le chargement
        this.selectedFiles = [];
        this.base64Images = [];
        this.photosToDelete = [];
        this.galleryImages = [];
        
        this.ingredientService.getIngredientById(ingredient.id!)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (data: Ingredient) => {
                    this.ingredient = { ...data };
                    this.ingredientDialog = true;
                    
                    // Créer les images pour la galerie - avec validation
                    if (this.ingredient.photos && Array.isArray(this.ingredient.photos) && this.ingredient.photos.length > 0) {
                        this.galleryImages = this.ingredient.photos
                          .filter(photo => photo && photo.url) // S'assurer que les photos sont valides
                          .map(photo => ({
                            itemImageSrc: photo.url,
                            thumbnailImageSrc: photo.url,
                            alt: this.ingredient.name || 'Image',
                            title: this.ingredient.name || 'Image',
                            id: photo.id
                        }));
                    } else {
                        this.galleryImages = [];
                    }
                    
                    // Debug
                    console.log('Photos chargées:', this.ingredient.photos);
                    console.log('Galleria images:', this.galleryImages);
                },
                error: (error) => {
                    console.error('Erreur lors du chargement des détails:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de charger les détails de l\'ingrédient',
                        life: 3000
                    });
                    // Fermer la boîte de dialogue en cas d'erreur
                    this.ingredientDialog = false;
                }
            });
      }











      

    onFileSelect(event: any) {
        this.selectedFiles = event.files;

        // Convertir les fichiers en base64
        for (let file of this.selectedFiles) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.base64Images.push(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    deleteSelectedIngredients() {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir supprimer les ingrédients sélectionnés?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                const deletePromises = this.selectedIngredients!.map(ingredient =>
                    this.ingredientService.deleteIngredient(ingredient.id!).toPromise()
                );

                Promise.all(deletePromises)
                    .then(() => {
                        this.ingredients.set(this.ingredients().filter(val => !this.selectedIngredients?.includes(val)));
                        this.selectedIngredients = null;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Ingrédients supprimés',
                            life: 3000
                        });
                    })
                    .catch(error => {
                        console.error('Erreur lors de la suppression des ingrédients:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Impossible de supprimer les ingrédients',
                            life: 3000
                        });
                    });
            }
        });
    }

    hideDialog() {
        this.ingredientDialog = false;
        this.submitted = false;
        this.selectedFiles = [];
        this.base64Images = [];
    }

    deleteIngredient(ingredient: Ingredient) {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir supprimer ' + ingredient.name + '?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.ingredientService.deleteIngredient(ingredient.id!)
                    .subscribe({
                        next: () => {
                            this.ingredients.set(this.ingredients().filter(val => val.id !== ingredient.id));
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Succès',
                                detail: 'Ingrédient supprimé',
                                life: 3000
                            });
                        },
                        error: (error) => {
                            console.error('Erreur lors de la suppression:', error);
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Erreur',
                                detail: 'Impossible de supprimer l\'ingrédient',
                                life: 3000
                            });
                        }
                    });
            }
        });
    }

    saveIngredient() {
        this.submitted = true;

        if (!this.ingredient.name?.trim()) {
            return;
        }

        // Extraire et supprimer 'photos' pour éviter les erreurs de validation Prisma
        const { photos, ...ingredientWithoutPhotos } = this.ingredient;

        // Préparation des données avec les images et les IDs de photos à supprimer
        const ingredientData = {
            ...ingredientWithoutPhotos,
            ...(this.base64Images.length ? { imgUrls: this.base64Images } : {}),
            ...(this.photosToDelete.length ? { photoIdsToDelete: this.photosToDelete } : {})
        };


         
        // Filtrer les ID undefined et n'inclure les photoIdsToDelete que s'il y en a
        const validPhotoIds = this.photosToDelete.filter(id => id !== undefined);
        if (validPhotoIds.length > 0) {
            ingredientData.photoIdsToDelete = validPhotoIds;
        }

        // Ajouter un log pour déboguer
        console.log('Données à envoyer:', ingredientData);

        if (this.ingredient.id) {
            // Mise à jour
            this.ingredientService.updateIngredient(this.ingredient.id, ingredientData)
                .subscribe({
                    next: (updatedIngredient) => {
                        const index = this.findIndexById(this.ingredient.id!);
                        if (index !== -1) {
                            const updatedIngredients = [...this.ingredients()];
                            updatedIngredients[index] = updatedIngredient;
                            this.ingredients.set(updatedIngredients);
                        }

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Ingrédient mis à jour',
                            life: 3000
                        });
                        this.ingredientDialog = false;
                        this.ingredient = {};
                        this.selectedFiles = [];
                        this.base64Images = [];
                    },
                    error: (error) => {
                        console.error('Erreur lors de la mise à jour:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Impossible de mettre à jour l\'ingrédient',
                            life: 3000
                        });
                    }
                });
        } else {
            // Création - pas de changement nécessaire ici
            this.ingredientService.createIngredient(ingredientData)
                .subscribe({
                    next: (newIngredient) => {
                        this.ingredients.set([...this.ingredients(), newIngredient]);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Ingrédient créé',
                            life: 3000
                        });
                        this.ingredientDialog = false;
                        this.ingredient = {};
                        this.selectedFiles = [];
                        this.base64Images = [];
                        this.loadIngredients();
                    },
                    error: (error) => {
                        console.error('Erreur lors de la création:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Impossible de créer l\'ingrédient',
                            life: 3000
                        });
                    }
                });
        }
    }
    findIndexById(id: string): number {
        return this.ingredients().findIndex(ingredient => ingredient.id === id);
    }
}