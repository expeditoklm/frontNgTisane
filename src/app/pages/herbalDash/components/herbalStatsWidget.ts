import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-herbal-stats-widget',
    imports: [CommonModule],
    template: `
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Remèdes</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{totalRemedies}}</div>
                    </div>
                    <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-heart text-green-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Remèdes à Base de Plantes </span>
                <span class="text-muted-color">dans votre collection</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Ingrédients</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{totalIngredients}}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-globe text-blue-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Plantes Médicinales </span>
                <span class="text-muted-color">et autres ingrédients</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Maladies</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{totalDiseases}}</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-plus-circle text-orange-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Problèmes de Santé </span>
                <span class="text-muted-color">traitables avec des remèdes</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Catégories</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{totalCategories}}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-folder text-purple-500 !text-xl"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Catégories de Maladies </span>
                <span class="text-muted-color">pour l'organisation</span>
            </div>
        </div>
    `
})
export class HerbalStatsWidget {
    @Input() totalRemedies: number = 0;
    @Input() totalIngredients: number = 0;
    @Input() totalDiseases: number = 0;
    @Input() totalCategories: number = 0;
}