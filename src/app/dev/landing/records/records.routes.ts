import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AgingDataComponent } from './aging-data/aging-data.component';

@NgModule({
    imports: [RouterModule.forChild([
        // {
        //     path: 'members-listing',
        //     component: 
        // },
        // {
        //     path: 'coins-history',
        //     component: 
        // },
        // {
        //     path: 'top-earner',
        //     component: 
        // },
        {
            path: 'aging-data',
            component: AgingDataComponent
        }
    ])],
    exports: [RouterModule]
})
export class RecordsRoutingModule { }
