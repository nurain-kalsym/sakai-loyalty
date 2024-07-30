import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AppLayoutComponent } from "./layout/app.layout.component";

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', component: AppLayoutComponent,
                children: [
                    { path: '', loadChildren: () => import('./dev/dashboard/dashboard.module').then(m => m.DashboardModule) },
                    { path: 'configurations', loadChildren: () => import('./dev/landing/loyalty-configurations/configurations.module').then(m => m.ConfigurationsModule) },
                    { path: 'records', loadChildren: () => import('./dev/landing/records/records.module').then(m => m.RecordsModule) },
                ]
            },
            { path: '**', redirectTo: '' },
            //other page that does not user AppLayoutComponent
        ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
