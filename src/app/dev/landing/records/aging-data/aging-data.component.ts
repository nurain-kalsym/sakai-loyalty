import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Subject } from 'rxjs';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';
import { Aging, Month, Pagination } from 'src/app/core/loyalty/loyalty.types';
@Component({
    templateUrl: './aging-data.component.html',
})
export class AgingDataComponent implements OnInit, OnDestroy {
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    agingDataColumns: string[] = ['month', 'referral', 'loyalty'];
    allAging: Aging[] = [];
    pagination: Pagination;
    isLoading = false;
    months: Month[] = [];
    years: (string | number)[] = [];
    filterForm: FormGroup;
    selectedMonth: number = null;
    selectedYear: number = null;
    selectedChannel: string = 'ALL';
    currentStep = 1;
    overlaySteps = [
        'tourGuideOverlay1',
        'tourGuideOverlay2',
        'tourGuideOverlay3'
    ];
    channels: { label: string, value: string }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'E-Kedai', value: 'e-kedai' },
        { label: 'HelloSim', value: 'hello-sim' }
    ];

    @ViewChild('tourGuideOverlay1') tourGuideOverlay1: OverlayPanel;
    @ViewChild('tourGuideOverlay2') tourGuideOverlay2: OverlayPanel;
    @ViewChild('tourGuideOverlay3') tourGuideOverlay3: OverlayPanel;

    constructor(
        private _formBuilder: FormBuilder,
        private _loyaltyService: LoyaltyService,
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

    ngAfterViewInit(): void {
        console.log('View initialized, overlays ready');
    }

    startTour(): void {
        console.log('Starting the tour');
        
        this.currentStep = 0;
        this.hideAllOverlays();

        const firstOverlayId = this.overlaySteps[this.currentStep];
        console.log('Showing overlay:', firstOverlayId);
        
        setTimeout(() => {
            this.showTourOverlay(firstOverlayId);
        }, 200);
    }

    showTourOverlay(overlayId: string): void {
        const targetElement = document.getElementById(overlayId);
        if (!targetElement) {
             console.error(`Target element with ID '${overlayId}' not found.`);
             return;
         }
         
         // Ensure all overlays are hidden before showing the current one
         this.hideAllOverlays();
         
         const overlay = this[`tourGuideOverlay${this.currentStep + 1}`];
         if (overlay) {
             console.log(`Displaying overlay: ${overlayId}`);
             overlay.show(new MouseEvent('click'), targetElement);
         } else {
             console.error(`Overlay for ID '${overlayId}' is not defined.`);
         }
    }

    hideAllOverlays(): void {
        console.log('Hiding all overlays');
        if (this.tourGuideOverlay1) this.tourGuideOverlay1.hide();
        if (this.tourGuideOverlay2) this.tourGuideOverlay2.hide();
        if (this.tourGuideOverlay3) this.tourGuideOverlay3.hide();
    }

    nextStep(): void {
        console.log('Current step before next:', this.currentStep);
        
        if (this.currentStep < this.overlaySteps.length - 1) {
            this.hideAllOverlays();

            this.currentStep++;
            const nextOverlayId = this.overlaySteps[this.currentStep];

            console.log('Next step index:', this.currentStep);
            console.log('Attempting to show next overlay:', nextOverlayId);

            setTimeout(() => {
                this.showTourOverlay(nextOverlayId);
            }, 200);
        } else {
            console.log('Tour Finished');
            this.endTour();
        }
    }
    
    previousStep(): void {
        if (this.currentStep > 0) {
            console.log('Moving to previous step:', this.currentStep - 1);
            
            this.hideAllOverlays();
            this.currentStep--;

            setTimeout(() => {
                const previousOverlayId = this.overlaySteps[this.currentStep];
                console.log('Showing overlay:', previousOverlayId);
                this.showTourOverlay(previousOverlayId);
            }, 200);
        }
    }

    endTour(forceReset: boolean = true): void {
        console.log('Tour finished!');
        this.hideAllOverlays();
        if (forceReset) {
            this.currentStep = 0;
        }
    }

    ngOnDestroy() {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
