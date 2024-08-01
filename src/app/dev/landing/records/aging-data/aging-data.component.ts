import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { Subject, takeUntil } from 'rxjs';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';
import { Aging, Month, Pagination } from 'src/app/core/loyalty/loyalty.types';
@Component({
    templateUrl: './aging-data.component.html',
})
export class AgingDataComponent implements OnInit, OnDestroy {
    
    @ViewChild('paginator', { read: PaginatorModule })
    private paginator: PaginatorModule;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    agingDataColumns: string[] = ['month', 'referral', 'loyalty'];
    allAging: Aging[] = [];
    pagination: Pagination;
    isLoading = false;
    months: Month[] = [];
    // years: number[] = [];
    years: (string | number)[] = [];
    filterForm: FormGroup;
    selectedMonth: number = null;
    selectedYear: number = null;
    selectedChannel: string = 'ALL';
    channels: { label: string, value: string }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'E-Kedai', value: 'e-kedai' },
        { label: 'Hello Sim', value: 'hello-sim' }
    ];

    constructor(
        private _formBuilder: FormBuilder,
        private _loyaltyService: LoyaltyService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        // Create the form
        this.filterForm = this._formBuilder.group({
            month: [null],
            year: ['All'],
            channel: ['ALL']
        });

        this.initilizeMonth();
        this.initializeYears();

        let params = {
            page:  1,
            pageSize: 20,
            month: null,
            year: null,
            channel: 'ALL',
        };
        
        // call data
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

        // Get pagination
        this._loyaltyService.agingDataPagination$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((pagination: Pagination) => {
            if (pagination) {
            this.pagination = pagination;
            }
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });

        //filter month
        this.filterForm.get('month').valueChanges.subscribe(
            (value) => {
                this.selectedMonth = value === 'ALL' ? null : value;
        
                let params = {
                    page: 1,
                    pageSize: 20,
                    month: this.selectedMonth,
                    year: this.selectedYear,
                    channel: this.selectedChannel,
                };
        
                this._loyaltyService.getAgingData(params).subscribe(
                    (list: Aging[]) => {
                        this.allAging = list;
                    },
                    (error) => {
                        console.error('Error fetching aging data list:', error);
                    }
                );
            }
        );

        //filter year
        this.filterForm.get('year').valueChanges.subscribe((value) => {
            this.selectedYear = value === 'All' ? null : value;

                let params = {
                    page: 1,
                    pageSize: 20,
                    month: this.selectedMonth,
                    year: this.selectedYear,
                    channel: this.selectedChannel,
                };
        
                this._loyaltyService.getAgingData(params).subscribe(
                    (list: Aging[]) => {
                        this.allAging = list;
                    },
                    (error) => {
                        console.error('Error fetching aging data list:', error);
                    }
                );
            }
        );
        
        //filter channel
        this.filterForm.get('channel').valueChanges.subscribe((value) => {
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
        });
    }

    initilizeMonth() {
        const monthNames = [
            "January", "February", "March", "April", "May", "June", 
            "July", "August", "September", "October", "November", "December"
        ];

        this.months.push({ month: null, display: 'All' });
    
        for (let i = 0; i < 12; i++) {
            this.months.push({
                month: i + 1,
                display: monthNames[i]
            });
        }
    }

    initializeYears(): void {
        const startYear = 2023;
        const currentYear = new Date().getFullYear();
        this.years = ['All'];
    
        for (let year = startYear; year <= currentYear; year++) {
            this.years.push(year);
        }
    }    

    getMonthName(monthNumber: number): string {
        const month = this.months.find(m => m.month === monthNumber);
        return month ? month.display : 'Unknown';
    }

    ngOnDestroy() {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
