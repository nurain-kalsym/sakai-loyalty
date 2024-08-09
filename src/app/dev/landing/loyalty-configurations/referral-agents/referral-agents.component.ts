import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';
import { ReferralUsers } from 'src/app/core/loyalty/loyalty.types';

@Component({
    templateUrl: './referral-agents.component.html',
})
export class AppointReferralAgentComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    referralUsers: ReferralUsers[] = [];
    filterForm: FormGroup;
    selectedChannel: string = 'ALL';
    ColumnUsers = [
        'name',
        'phone',
        'email',
        'channel',
        'referralCode',
        'actions'
    ];
    channels: { label: string, value: string }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'E-Kedai', value: 'e-kedai' },
        { label: 'Hello Sim', value: 'hello-sim' }
    ];

    constructor(
        private _loyaltyService: LoyaltyService,
        private _formBuilder: FormBuilder,
    ) {}

    ngOnInit() {
        // create the form
        this.filterForm = this._formBuilder.group({
            channel: ['ALL'],
            status: ['ALL'],
        });

        this._loyaltyService.referralUsers$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(
            (list) => {
                this.referralUsers = list;
                // this.cdr.detectChanges();
            },
            (error) => {
                // Handle errors if any
                console.error('Error fetching referral user list:', error);
            }
        );
    }

    ngOnDestroy() {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
