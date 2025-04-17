import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

@Component({
    standalone: true,
    selector: 'app-notifications-widget',
    imports: [CommonModule, ButtonModule, MenuModule],
    template: `<div class="card">
        <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">Recent Activity</div>
            <div>
                <button pButton type="button" icon="pi pi-ellipsis-v" class="p-button-rounded p-button-text p-button-plain" (click)="menu.toggle($event)"></button>
                <p-menu #menu [popup]="true" [model]="items"></p-menu>
            </div>
        </div>

        <span *ngIf="todayActivities.length > 0" class="block text-muted-color font-medium mb-4">TODAY</span>
        <ul *ngIf="todayActivities.length > 0" class="p-0 mx-0 mt-0 mb-6 list-none">
            <li *ngFor="let activity of todayActivities" class="flex items-center py-2 border-b border-surface">
                <!-- <pre> {{activity | json}}  </pre> -->
                <div [ngClass]="getIconBackground(activity.type)" class="w-12 h-12 flex items-center justify-center rounded-full mr-4 shrink-0">
                    <i [ngClass]="'pi ' + activity.icon + ' !text-xl ' + getIconColor(activity.type)"></i>
                </div>
                <span class="text-surface-900 dark:text-surface-0 leading-normal">
                    {{activity.name}}
                    <span class="text-surface-700 dark:text-surface-100">
                        {{getActivityDescription(activity)}}
                    </span>
                </span>
            </li>
        </ul>

        <span *ngIf="olderActivities.length > 0" class="block text-muted-color font-medium mb-4">EARLIER</span>
        <ul *ngIf="olderActivities.length > 0" class="p-0 m-0 list-none">
            <li *ngFor="let activity of olderActivities" class="flex items-center py-2 border-b border-surface">
                <div [ngClass]="getIconBackground(activity.type)" class="w-12 h-12 flex items-center justify-center rounded-full mr-4 shrink-0">
                    <i [ngClass]="'pi ' + activity.icon + ' !text-xl ' + getIconColor(activity.type)"></i>
                </div>
                <span class="text-surface-900 dark:text-surface-0 leading-normal">
                    {{activity.name}}
                    <span class="text-surface-700 dark:text-surface-100">
                        {{getActivityDescription(activity)}}
                    </span>
                </span>
            </li>
        </ul>
        
        <div *ngIf="recentActivity.length === 0" class="flex justify-center items-center h-32">
            <span class="text-muted-color">No recent activity to display</span>
        </div>
    </div>`
})
export class NotificationsWidget {
    @Input() set recentActivity(value: any[]) {
        this._recentActivity = value || [];
        this.categorizeActivities();
    }
    
    get recentActivity(): any[] {
        return this._recentActivity;
    }
    
    private _recentActivity: any[] = [];
    todayActivities: any[] = [];
    olderActivities: any[] = [];
    
    items = [
        { label: 'Refresh', icon: 'pi pi-fw pi-refresh' },
        { label: 'View All', icon: 'pi pi-fw pi-list' }
    ];
    
    categorizeActivities() {
        // Get today's date at midnight for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        this.todayActivities = this.recentActivity.filter(activity => {
            const activityDate = new Date(activity.timestamp);
            return activityDate >= today;
        });
        
        this.olderActivities = this.recentActivity.filter(activity => {
            const activityDate = new Date(activity.timestamp);
            return activityDate < today;
        });
    }
    
    getIconBackground(type: string): string {
        switch(type) {
            case 'remedies': return 'bg-green-100 dark:bg-green-400/10';
            case 'ingredients': return 'bg-blue-100 dark:bg-blue-400/10';
            case 'diseases': return 'bg-orange-100 dark:bg-orange-400/10';
            case 'categories': return 'bg-purple-100 dark:bg-purple-400/10';
            default: return 'bg-gray-100 dark:bg-gray-400/10';
        }
    }
    
    getIconColor(type: string): string {
        switch(type) {
            case 'remedies': return 'text-green-500';
            case 'ingredients': return 'text-blue-500';
            case 'diseases': return 'text-orange-500';
            case 'categories': return 'text-purple-500';
            default: return 'text-gray-500';
        }
    }
    
    getActivityDescription(activity: any): string {
        switch(activity.type) {
            case 'remedies': return 'remedy was added or updated';
            case 'ingredients': return 'ingredient was added to your collection';
            case 'diseases': return 'health condition was added to database';
            case 'categories': return 'category was created or updated';
            default: return 'was modified';
        }
    }
}