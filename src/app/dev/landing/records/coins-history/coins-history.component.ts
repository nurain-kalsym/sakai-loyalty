import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';
import { CoinsHistory, Pagination } from 'src/app/core/loyalty/loyalty.types';

@Component({
    templateUrl: './coins-history.component.html',
})
export class CoinsHistoryComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    coinsHistoryColumns: string[] = ['phone', 'amount', 'type', 'channel', 'status', 'date'];
    allHistory: CoinsHistory[] = [];
    filterForm: FormGroup;
    selectedChannel: string = 'ALL';
    selectedType: string = 'ALL';
    selectedSortBy: string = 'DESC-EARNED';
    isLoading = false;
    pagination: Pagination;
    rangeDates: Date[] | undefined;
    channels: { label: string, value: string }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'E-Kedai', value: 'e-kedai' },
        { label: 'HelloSim', value: 'hello-sim' }
    ];
    types: { label: string, value: string }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'Referral', value: 'REFERRAL' },
        { label: 'Loyalty', value: 'LOYALTY' }
    ];
    sortBy: {label: string, value: string}[] = [
        { label: 'Date (Descending)', value: 'DESC-EARNED' },
        { label: 'Date (Ascending)', value: 'ASC-EARNED' },
    ];

    constructor(
        private _loyaltyService: LoyaltyService,
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        // Create the form
        this.filterForm = this._formBuilder.group({
            type: ['ALL'],
            channel: ['ALL'],
            sortBy: ['DESC-EARNED'],
            rangeDates: [[]],
            search: [null],
        });

        // Subscribe to data
        this._loyaltyService.coinsHistory$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe(
              (list: CoinsHistory[]) => {
                  this.allHistory = list;
              },
              (error) => {
                  // Handle errors if any
                  console.error('Error fetching coins history list:', error);
              }
          );

        // Get pagination
        this._loyaltyService.coinsHistoryPagination$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((pagination: Pagination) => {
            if (pagination) {
              this.pagination = pagination;
            }
            // Mark for check
            this._changeDetectorRef.markForCheck();
          });

        // Filter type
        this.filterForm.get('type').valueChanges.subscribe(
            (value) => {
                if (value) {
                    this.selectedType = value;
                    this.loadCoinsHistory({ first: 0, rows: this.pagination.size });
                }
            }
        );

        // Filter channel
        this.filterForm.get('channel').valueChanges.subscribe(
            (value) => {
                if (value) {
                    this.selectedChannel = value;
                    this.loadCoinsHistory({ first: 0, rows: this.pagination.size });
                }
            }
        );

        // Filter Sort By
        this.filterForm.get('sortBy').valueChanges.subscribe(
            (value) => {
                if (value) {
                    this.selectedSortBy = value;
                    this.loadCoinsHistory({ first: 0, rows: this.pagination.size });
                }
            }
        )

        // Filter date range
        this.filterForm.get('rangeDates').valueChanges.subscribe(
            (dates: Date[]) => {
                this.loadCoinsHistory({ first: 0, rows: this.pagination.size });
            }
        );

        // Search Filter 
        this.filterForm.get('search').valueChanges.subscribe(
            (value) => {
                this.loadCoinsHistory({ first: 0, rows: this.pagination.size });
            }
        );
    }

    loadCoinsHistory(event: any) {
        const page = event.first / event.rows + 1;
        const pageSize = event.rows;

        const dateRange = this.filterForm.get('rangeDates').value || [];
        const fromDate = dateRange[0] ? dateRange[0].toISOString().split('T')[0] : null;
        const toDate = dateRange[1] ? dateRange[1].toISOString().split('T')[0] : null;

        let params = {
            page: page,
            pageSize: pageSize,
            search: this.filterForm.get('search').value || null,
            sortBy: this.selectedSortBy,
            type: this.selectedType,
            channel: this.selectedChannel,
            startDate: fromDate,
            endDate: toDate,
        };

        this._loyaltyService.getAllCoinsHistory(params).subscribe();
    }

    clearSearch(): void {
        this.filterForm.get('search').setValue(null);
    }

    formatChannel(channel: string): string {
        if (channel === 'hello-sim') {
            return channel
                .split('-')
                .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                .join('');
        } else if (channel === 'e-kedai') {
            return 'E-Kedai';
        } else {
            return channel;
        }
    }

    ngOnDestroy() {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
