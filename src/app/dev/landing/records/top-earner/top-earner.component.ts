import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OverlayPanel } from 'primeng/overlaypanel';
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
    currentStep = 1;
    overlaySteps = [
        'tourGuideOverlay1',
        'tourGuideOverlay2',
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

    @ViewChild('tourGuideOverlay1') tourGuideOverlay1: OverlayPanel;
    @ViewChild('tourGuideOverlay2') tourGuideOverlay2: OverlayPanel;
    
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
    }

    ngAfterViewInit(): void {
        console.log('View initialized, overlays ready.');
    }

    startTour(): void {
        console.log('Starting the tour');
        
        // Reset only when starting the tour
        this.currentStep = 0;
        this.hideAllOverlays();

        const firstOverlayId = this.overlaySteps[this.currentStep];
        console.log('Showing overlay:', firstOverlayId);
        
        setTimeout(() => {
            this.showTourOverlay(firstOverlayId);
        }, 200);
    }

    showTourOverlay(overlayId: string): void {
        const targetElement= document.getElementById(overlayId);
        if (!targetElement) {
            console.error(`Target element with ID '${overlayId}' not found.`);
            return;
        }

        this.hideAllOverlays();

        const overlay = this[`tourGuideOverlay${this.currentStep + 1}`];
        if (overlay) {
            console.log(`Displaying overlay: ${overlayId}`);
            overlay.show(new MouseEvent('click'), targetElement);
        } else {
            console.error(`Overlay for ID '${overlayId}' is not defined.`)
        }
    }

    hideAllOverlays(): void {
        console.log('Hiding all overlays');
        if (this.tourGuideOverlay1) this.tourGuideOverlay1.hide();
        if (this.tourGuideOverlay2) this.tourGuideOverlay2.hide();
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
            console.log('No more steps to show.');
            this.endTour();
        }
    }

    previousStep(): void {
        if (this.currentStep > 0) {
            console.log('Moving to previous step:', this.currentStep - 1);
            
            this.hideAllOverlays();
            this.currentStep--;

            setTimeout(() => {
                const prevOverlayId = this.overlaySteps[this.currentStep];
                console.log('Showing overlay:', prevOverlayId);
                this.showTourOverlay(prevOverlayId);
            }, 200);
        }
    }

    endTour(forceReset: boolean = true): void {
        console.log('Ending the tour');
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
