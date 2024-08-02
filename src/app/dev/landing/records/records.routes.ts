import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AgingDataComponent } from './aging-data/aging-data.component';
import { TopEarnerComponent } from './top-earner/top-earner.component';
import { topEarnerResolver } from './top-earner/top-earner.resolver';

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
        {
            path: 'top-earner',
            component: TopEarnerComponent,
            resolve: {   
                data: topEarnerResolver,
            },
        },
        {
            path: 'aging-data',
            component: AgingDataComponent
        }
    ])],
    exports: [RouterModule]
})
export class RecordsRoutingModule { }
