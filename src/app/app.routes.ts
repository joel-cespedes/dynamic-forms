import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'employees',
        loadComponent: () => import('./features/employees/employee-page.component')
            .then(m => m.EmployeePageComponent)
    },
    {
        path: 'stores',
        loadComponent: () => import('./features/stores/stores-page.component')
            .then(m => m.StoresPageComponent)
    },
    { path: '', redirectTo: '/employees', pathMatch: 'full' },
    { path: '**', redirectTo: '/employees' }
];