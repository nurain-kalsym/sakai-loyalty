import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';
import { Aging } from 'src/app/core/loyalty/loyalty.types';

@Component({
    templateUrl: './aging-data.component.html',
})
export class AgingDataComponent implements OnInit, OnDestroy {

    allAging: Aging[] = [];
    constructor(
        private _loyaltyService: LoyaltyService,
    ) {}

    ngOnInit() {
        let params = {
            page:  1,
            pageSize: 20,
            month: null,
            year: null,
            channel: 'ALL',
        };

        this._loyaltyService.getAgingData(params).subscribe(
            (list: Aging[]) => {
                this.allAging = list;
                console.log(this.allAging);
            },
            (error) => {
                // Handle errors if any
                console.error('Error fetching aging data list:', error);
            }
        );
    }

    ngOnDestroy() {}
}
