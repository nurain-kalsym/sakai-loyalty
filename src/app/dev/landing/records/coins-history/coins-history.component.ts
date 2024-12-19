import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OverlayPanel } from 'primeng/overlaypanel';
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
    currentStep = 1;
    isTourActive = false;
    overlaySteps = [
        'tourGuideOverlay1',
        'tourGuideOverlay2',
        'tourGuideOverlay3',
        'tourGuideOverlay4',
        'tourGuideOverlay5'
    ];
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

    @ViewChild('tourGuideOverlay1') tourGuideOverlay1: OverlayPanel;
    @ViewChild('tourGuideOverlay2') tourGuideOverlay2: OverlayPanel;
    @ViewChild('tourGuideOverlay3') tourGuideOverlay3: OverlayPanel;
    @ViewChild('tourGuideOverlay4') tourGuideOverlay4: OverlayPanel;
    @ViewChild('tourGuideOverlay5') tourGuideOverlay5: OverlayPanel;

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

    // Ensure overlays are initialized after the view is loaded
    ngAfterViewInit(): void {
        // Ensure overlays are properly initialized, but do not display them
        console.log('View initialized, overlays ready.');
    }
    
    // Function to start the tour
    startTour(): void {
        console.log('Starting the tour');
        
        // Reset only when starting the tour
        this.currentStep = 0; 
        this.hideAllOverlays(); 
        
        const firstOverlayId = this.overlaySteps[this.currentStep];
        console.log('Showing overlay:', firstOverlayId);
        
        setTimeout(() => {
            this.showTourOverlay(firstOverlayId);
        }, 200); // Delay to ensure DOM is ready
    }
    
    
    // Function to show the overlay
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
        if (this.tourGuideOverlay4) this.tourGuideOverlay4.hide();
        if (this.tourGuideOverlay5) this.tourGuideOverlay5.hide();
    }
    
    nextStep(): void {
        console.log('Current step before next:', this.currentStep);
        
        if (this.currentStep < this.overlaySteps.length - 1) {
            this.hideAllOverlays();
            
            this.currentStep++;
            const nextOverlayId = this.overlaySteps[this.currentStep];
            
            console.log('Next step index:', this.currentStep);
            console.log('Attempting to show overlay:', nextOverlayId);
            
            setTimeout(() => {
                this.showTourOverlay(nextOverlayId);
            }, 200);
        } else {
            console.log('Tour finished!');
            this.endTour(); // End the tour at the last step
        }
    }
    
    previousStep(): void {
        if (this.currentStep > 0) {
            console.log('Moving to previous step:', this.currentStep - 1);
            
            this.hideAllOverlays(); // Hide current overlays
            this.currentStep--; // Decrement step before showing the previous overlay
            
            setTimeout(() => {
                const prevOverlayId = this.overlaySteps[this.currentStep];
                console.log('Showing overlay:', prevOverlayId);
                this.showTourOverlay(prevOverlayId);
            }, 200); // Ensure overlay hide completes before showing previous
        }
    }
    
    endTour(forceReset: boolean = true): void {
        console.log('Tour finished!');
        this.hideAllOverlays();
        if (forceReset) {
            this.currentStep = 0; // Reset step only when explicitly told
        }
    }

    ngOnDestroy() {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
