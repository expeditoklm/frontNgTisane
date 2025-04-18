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
import { AuthGuard, GuestGuard } from './app/_guards/auth-guard.service';
import { Login } from './app/pages/auth/login';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [AuthGuard],
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
    { 
        path: 'login', 
        component: Login,
        canActivate: [GuestGuard]
    },
    { 
        path: 'auth', 
        loadChildren: () => import('./app/pages/auth/auth.routes') 
    },
    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/notfound' }
];