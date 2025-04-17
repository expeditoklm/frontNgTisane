import { Component, OnInit } from '@angular/core';
import { RemedyService } from '../../services/remedy.service';
import { IngredientService } from '../../services/ingredient.service';
import { DiseaseService } from '../../services/disease.service';
import { CategoryService } from '../../services/category.service';
import { HerbalStatsWidget } from './components/herbalStatsWidget';
import { RecentRemediesWidget } from './components/recentRemediesWidget';
import { TopIngredientsWidget } from './components/topIngredientsWidget';
import { DiseaseCategoriesWidget } from './components/diseaseCategoriesWidget';
import { NotificationsWidget } from './components/notificationsWidget';

@Component({
    selector: 'app-herbal-dashboard',
    standalone: true,
    imports: [
        HerbalStatsWidget, 
        RecentRemediesWidget, 
        TopIngredientsWidget, 
        // DiseaseCategoriesWidget, 
        NotificationsWidget
    ],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <app-herbal-stats-widget class="contents" 
                [totalRemedies]="totalRemedies"
                [totalIngredients]="totalIngredients"
                [totalDiseases]="totalDiseases"
                [totalCategories]="totalCategories" />
            <div class="col-span-12 xl:col-span-6">
                <app-recent-remedies-widget [remedies]="remedies" />
                <app-top-ingredients-widget [ingredients]="ingredients" />
            </div>
            <div class="col-span-12 xl:col-span-6">
                <app-notifications-widget [recentActivity]="recentActivity" />
            </div>
        </div>
    `
})
export class HerbalDashboard implements OnInit {
    remedies: any[] = [];
    ingredients: any[] = [];
    diseases: any[] = [];
    categories: any[] = [];
    recentActivity: any[] = [];
    
    totalRemedies: number = 0;
    totalIngredients: number = 0;
    totalDiseases: number = 0;
    totalCategories: number = 0;

    constructor(
        private remedyService: RemedyService,
        private ingredientService: IngredientService,
        private diseaseService: DiseaseService,
        private categoryService: CategoryService
    ) {}

    ngOnInit() {
        this.loadDashboardData();
    }

    loadDashboardData() {
        // Load remedies
        this.remedyService.getAllRemidies().subscribe(data => {
            this.remedies = data;
            this.totalRemedies = data.length;
            this.updateRecentActivity('remedies', data.slice(0, 3));
        });

        // Load ingredients
        this.ingredientService.getAllIngredients().subscribe(data => {
            this.ingredients = data;
            this.totalIngredients = data.length;
            this.updateRecentActivity('ingredients', data.slice(0, 2));
        });

        // Load diseases
        this.diseaseService.getAllDiseases().subscribe(data => {
            this.diseases = data;
            this.totalDiseases = data.length;
            this.updateRecentActivity('diseases', data.slice(0, 2));
        });

        // Load categories
        this.categoryService.getAllCategories().subscribe(data => {
            this.categories = data;
            this.totalCategories = data.length;
        });
    }

    updateRecentActivity(type: string, items: any[]) {
        const activities = items.map(item => ({
            id: item.id,
            name: item.name,
            type: type,
            timestamp: item.updatedAt || item.createdAt,
            icon: this.getActivityIcon(type)
        }));
        
        this.recentActivity = [...this.recentActivity, ...activities]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);
    }

    getActivityIcon(type: string): string {
        switch(type) {
            case 'remedies': return 'pi-heart';
            case 'ingredients': return 'pi pi-globe';
            case 'diseases': return 'pi-plus-circle';
            case 'categories': return 'pi-folder';
            default: return 'pi-check';
        }
    }
}