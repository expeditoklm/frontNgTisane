import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-disease-categories-widget',
    imports: [CommonModule, ChartModule, ButtonModule],
    template: `<div class="card !mb-8">
        <div class="flex justify-between items-center mb-4">
            <div class="font-semibold text-xl">Disease Categories</div>
            <button pButton pRipple type="button" label="View All" 
                class="p-button-text p-button-sm" 
                (click)="viewAllCategories()"></button>
        </div>
        <div *ngIf="chartData && chartOptions" class="h-80">
            <p-chart type="doughnut" [data]="chartData" [options]="chartOptions"></p-chart>
        </div>
        <div *ngIf="!hasData" class="flex justify-center items-center h-64">
            <div class="text-center">
                <div class="text-xl text-muted-color mb-3">No categories data available</div>
                <button pButton pRipple type="button" label="Add Category" 
                    icon="pi pi-plus"
                    (click)="addCategory()"></button>
            </div>
        </div>
    </div>`
})
export class DiseaseCategoriesWidget implements OnChanges {
    @Input() categories: any[] = [];
    @Input() diseases: any[] = [];
    
    chartData: any;
    chartOptions: any;
    hasData: boolean = false;
    
    constructor(private router: Router) {}
    
    ngOnChanges() {
        this.prepareChartData();
    }
    
    prepareChartData() {
        if (this.categories.length === 0) {
            this.hasData = false;
            return;
        }
        
        this.hasData = true;
        
        // Count diseases per category
        const categoryCounts = this.categories.map(category => {
            const diseasesInCategory = this.diseases.filter(disease => disease.categoryId === category.id);
            return {
                name: category.name,
                count: diseasesInCategory.length
            };
        });
        
        // Only display categories with at least one disease
        const filteredCategories = categoryCounts.filter(c => c.count > 0);
        
        // If no categories have diseases, show all categories with 0
        const displayCategories = filteredCategories.length > 0 ? filteredCategories : categoryCounts;
        
        // Generate chart colors
        const colors = [
            '#42A5F5', // blue
            '#66BB6A', // green
            '#FFA726', // orange
            '#26C6DA', // cyan
            '#7E57C2', // purple
            '#EC407A', // pink
            '#AB47BC', // purple
            '#8D6E63', // brown
            '#5C6BC0'  // indigo
        ];
        
        // Create chart data
        this.chartData = {
            labels: displayCategories.map(c => c.name),
            datasets: [
                {
                    data: displayCategories.map(c => c.count),
                    backgroundColor: displayCategories.map((_, i) => colors[i % colors.length]),
                    hoverBackgroundColor: displayCategories.map((_, i) => colors[i % colors.length])
                }
            ]
        };
        
        // Chart options
        this.chartOptions = {
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            cutout: '60%'
        };
    }
    
    viewAllCategories() {
        this.router.navigate(['/categories']);
    }
    
    addCategory() {
        this.router.navigate(['/categories/new']);
    }
}