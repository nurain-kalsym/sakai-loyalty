import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AgingDataComponent } from './aging-data/aging-data.component';
import { TopEarnerComponent } from './top-earner/top-earner.component';
import { topEarnerResolver } from './top-earner/top-earner.resolver';
import { CoinsHistoryComponent } from './coins-history/coins-history.component';
import { coinsHistoryResolver } from './coins-history/coins-history.resolver';
import { MemberListingComponent } from './member-listing/member-listing.component';
import { membersListResolver } from './member-listing/member-listing.resolver';

@NgModule({
    imports: [RouterModule.forChild([
        {
            path: 'members-listing',
            component: MemberListingComponent,
                resolve: {   
                    data: membersListResolver,
                },
        },
        {
            path: 'coins-history',
            component: CoinsHistoryComponent,
            resolve: {
                data: coinsHistoryResolver,
            },
        },
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
