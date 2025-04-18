import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { Router } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-top-ingredients-widget',
    imports: [CommonModule, ButtonModule, MenuModule],
    template: `<div class="card">
        <div class="flex justify-between items-center mb-6">
            <div class="font-semibold text-xl">Ingrédients les Plus Utilisés</div>
            <div>
                <button pButton type="button" icon="pi pi-ellipsis-v" class="p-button-rounded p-button-text p-button-plain" (click)="menu.toggle($event)"></button>
                <p-menu #menu [popup]="true" [model]="items"></p-menu>
            </div>
        </div>
        <ul class="list-none p-0 m-0">
            <li *ngFor="let ingredient of displayIngredients" class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <span class="text-surface-900 dark:text-surface-0 font-medium mr-2 mb-1 md:mb-0">{{ingredient.name}}</span>
                    <div class="mt-1 text-muted-color">{{ingredient.usageCount}} remèdes</div>
                </div>
                <div class="mt-2 md:mt-0 flex items-center">
                    <div class="bg-surface-300 dark:bg-surface-500 rounded-border overflow-hidden w-40 lg:w-24" style="height: 8px">
                        <div [ngClass]="getUsageColorClass(ingredient.usagePercentage)" class="h-full" [style.width.%]="ingredient.usagePercentage"></div>
                    </div>
                    <span [ngClass]="getUsageTextColorClass(ingredient.usagePercentage)" class="ml-4 font-medium">{{ingredient.usagePercentage}}%</span>
                </div>
            </li>
            <li *ngIf="displayIngredients.length === 0" class="flex justify-center p-4">
                <span class="text-muted-color">Aucune donnée d'ingrédients disponible.</span>
            </li>
        </ul>
        <div class="flex justify-content-end mt-4">
            <button pButton pRipple type="button" label="Voir Tous les Ingrédients" 
                class="p-button-text p-button-sm" 
                (click)="viewAllIngredients()"></button>
        </div>
    </div>`
})
export class TopIngredientsWidget implements OnChanges {
    @Input() ingredients: any[] = [];
    displayIngredients: any[] = [];
    
    items = [
        { label: 'Ajouter un Nouvel Ingrédient', icon: 'pi pi-fw pi-plus', command: () => this.router.navigate(['/ingredients/new']) },
        { label: 'Voir Tous les Ingrédients', icon: 'pi pi-fw pi-list', command: () => this.router.navigate(['/ingredients']) }
    ];
    
    constructor(private router: Router) {}
    
    ngOnChanges() {
        if (this.ingredients.length) {
            // Calculate usage metrics (in a real app, you'd get this from backend)
            this.displayIngredients = this.ingredients
                .slice(0, 6)
                .map((ingredient, index) => {
                    // Simulated usage count and percentage (replace with actual data in a real app)
                    const usageCount = 10 - index > 0 ? 10 - index : 1;
                    const usagePercentage = Math.round((usageCount / 10) * 100);
                    
                    return {
                        ...ingredient,
                        usageCount,
                        usagePercentage
                    };
                });
        }
    }
    
    getUsageColorClass(percentage: number): string {
        if (percentage >= 80) return 'bg-purple-500';
        if (percentage >= 60) return 'bg-blue-500';
        if (percentage >= 40) return 'bg-teal-500';
        if (percentage >= 20) return 'bg-orange-500';
        return 'bg-cyan-500';
    }
    
    getUsageTextColorClass(percentage: number): string {
        if (percentage >= 80) return 'text-purple-500';
        if (percentage >= 60) return 'text-blue-500';
        if (percentage >= 40) return 'text-teal-500';
        if (percentage >= 20) return 'text-orange-500';
        return 'text-cyan-500';
    }
    
    viewAllIngredients() {
        this.router.navigate(['/ingredients']);
    }
}