import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-recent-remedies-widget',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule, TooltipModule],
    template: `<div class="card !mb-8">
        <div class="font-semibold text-xl mb-4">Recent Remedies</div>
        <p-table [value]="displayRemedies" [paginator]="false" [rows]="5" responsiveLayout="scroll">
            <ng-template pTemplate="header">
                <tr>
                    <th>Name</th>
                    <th>Ingredients</th>
                    <th>Effectiveness</th>
                    <th>Actions</th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-remedy>
                <tr>
                    <td style="width: 30%; min-width: 10rem;">
                        <span class="font-medium">{{ remedy.name }}</span>
                    </td>
                    <td style="width: 40%; min-width: 7rem;">
                        {{ remedy.ingredientCount }} ingredients
                    </td>
                    <td style="width: 15%; min-width: 8rem;">
                        <div class="bg-surface-300 dark:bg-surface-500 rounded-border overflow-hidden" style="height: 8px">
                            <div [ngClass]="getEffectivenessColorClass(remedy.value)" class="h-full" [style.width.%]="remedy.value"></div>
                        </div>
                        <span class="text-sm">{{ remedy.value }}%</span>
                    </td>
                    <td style="width: 15%;">
                        <button pButton pRipple type="button" icon="pi pi-eye" 
                            class="p-button p-component p-button-text p-button-icon-only"
                            pTooltip="View Remedy" tooltipPosition="top"
                            (click)="viewRemedy(remedy.id)"></button>
                        <button pButton pRipple type="button" icon="pi pi-pencil" 
                            class="p-button p-component p-button-text p-button-icon-only"
                            pTooltip="Edit Remedy" tooltipPosition="top"
                            (click)="editRemedy(remedy.id)"></button>
                    </td>
                </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="4" class="text-center p-4">No remedies found.</td>
                </tr>
            </ng-template>
        </p-table>
        <div class="flex justify-content-end mt-4">
            <button pButton pRipple type="button" label="View All Remedies" 
                class="p-button-text p-button-sm" 
                (click)="viewAllRemedies()"></button>
        </div>
    </div>`
})
export class RecentRemediesWidget implements OnChanges {
    @Input() remedies: any[] = [];
    displayRemedies: any[] = [];
    
    constructor(private router: Router) {}

    ngOnChanges() {
        if (this.remedies.length) {
            this.displayRemedies = this.remedies
                .slice(0, 5)
                .map(remedy => ({
                    ...remedy,
                    ingredientCount: remedy.ingredients?.length || 0
                }));
        }
    }
    
    getEffectivenessColorClass(value: number): string {
        if (value >= 75) return 'bg-green-500';
        if (value >= 50) return 'bg-blue-500';
        if (value >= 25) return 'bg-orange-500';
        return 'bg-red-500';
    }
    
    viewRemedy(id: string) {
        this.router.navigate(['/remedies', id]);
    }
    
    editRemedy(id: string) {
        this.router.navigate(['/remedies', id, 'edit']);
    }
    
    viewAllRemedies() {
        this.router.navigate(['/remedies']);
    }
}