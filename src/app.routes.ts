import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { Crud } from './app/pages/crud/crud';
import { Diseases } from './app/pages/crud/diseases-crud';
import { Ingredients } from './app/pages/crud/ingredients-crud';
import { Remedies } from './app/pages/crud/remedies-crud';
import { Categories } from './app/pages/crud/categories-crud';
import { HerbalDashboard } from './app/pages/herbalDash/dashboard';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: HerbalDashboard },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'diseases', component: Diseases },
            { path: 'ingredients', component: Ingredients },
            { path: 'remedies', component: Remedies },
            { path: 'categories', component: Categories },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
