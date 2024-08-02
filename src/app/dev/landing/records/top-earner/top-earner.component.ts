import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service'
import { Earner } from 'src/app/core/loyalty/loyalty.types';

@Component({
    templateUrl: './top-earner.component.html',
})
export class TopEarnerComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    topEarnerColumns: String[] = ['rank', 'name', 'phone', 'totalCoins'];
    allEarner: Earner[] = [];
    filterForm: FormGroup;
    selectedChannel: string = 'ALL';
    selectedType: string = 'ALL';
    isLoading = false;
    channels: { label: string, value: string }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'E-Kedai', value: 'e-kedai' },
        { label: 'Hello Sim', value: 'hello-sim' }
    ];
    types: { label: string, value: string }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'Referral', value: 'REFERRAL' },
        { label: 'Loyalty', value: 'LOYALTY' }
    ];
    
    constructor(
        private _loyaltyService: LoyaltyService,
        private _formBuilder: FormBuilder,
    ) {}

    ngOnInit() {
        // Create the form
        this.filterForm = this._formBuilder.group({
            type: ['ALL'],
            channel: ['ALL']
        });

        //call data
        this._loyaltyService.topEarner$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(
            (list: Earner[]) => {
                this.allEarner = list;
            },
            (error) => {
                // Handle errors if any
                console.error('Error fetching top earner list:', error);
            }
        );

        //filter type
        this.filterForm.get('type').valueChanges.subscribe(
            (value) => {
                if (value) {
                this.selectedType = value;

                let params = {
                    type: this.selectedType,
                    channel: this.selectedChannel,
                };

                this._loyaltyService.getTopEarner(params).subscribe();
                }
            }
        );

        //filter channel
        this.filterForm.get('channel').valueChanges.subscribe(
            (value) => {
                if (value) {
                    this.selectedChannel = value;
        
                    let params = {
                        type: this.selectedType,
                        channel: this.selectedChannel,
                    };
        
                    this._loyaltyService.getTopEarner(params).subscribe();
                }
            }
        );

        //filter channel
        /* this.filterForm.get('channel').valueChanges.subscribe((value) => {
            this.selectedChannel = value.value === 'ALL' ? null : value.value;
            const params = {
                page: 1,
                pageSize: 20,
                month: this.selectedMonth,
                year: this.selectedYear,
                channel: this.selectedChannel
            };
    
            this._loyaltyService.getAgingData(params).subscribe(
                (list: Aging[]) => {
                    this.allAging = list;
                },
                (error) => {
                    console.error('Error fetching aging data list:', error);
                }
            );
        }); */
    }

    ngOnDestroy() {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
