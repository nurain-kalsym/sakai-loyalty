import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener, ViewChild, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';
import { MicrodealerChannel, MicrodealerDetails } from 'src/app/core/loyalty/loyalty.types';
import { Message, MessageService } from 'primeng/api';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
    templateUrl: './micro-dealer.component.html',
    providers: [MessageService]
})
export class MicroDealerComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    microdealerColumns: String[] = ['name', 'phone', 'email', 'channel', 'status', 'actions'];
    allDealer: MicrodealerDetails[] = [];
    filteredMicrodealers: MicrodealerChannel[] = [];
    filterForm: FormGroup;
    setupForm: FormGroup;
    updateForm: FormGroup;
    messages: Message[] = [];
    selectedChannel: string = 'ALL';
    selectedStatus: string = 'ALL';
    isLoading = false;
    editingRowIndex: number | null = null;
    originalChannel: string | null = null;
    isModified: boolean = false; 
    addNewDialog: boolean = false;
    updateStatusDialog: boolean = false;
    isTourActive = false;
    currentStep = 1;
    overlaySteps = ['tourGuideOverlay1', 'tourGuideOverlay2', 'tourGuideOverlay3', 'tourGuideOverlay4', 'tourGuideOverlay5'];
    channels: { label: string, value: string }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'E-Kedai', value: 'e-kedai' },
        { label: 'HelloSim', value: 'hello-sim' }
    ];
    status: { label: string, value: string }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' }
    ];

    @ViewChild('tourGuideOverlay1') tourGuideOverlay1: OverlayPanel;
    @ViewChild('tourGuideOverlay2') tourGuideOverlay2: OverlayPanel;
    @ViewChild('tourGuideOverlay3') tourGuideOverlay3: OverlayPanel;
    @ViewChild('tourGuideOverlay4') tourGuideOverlay4: OverlayPanel;
    @ViewChild('tourGuideOverlay5') tourGuideOverlay5: OverlayPanel;

    constructor(
        private _loyaltyService: LoyaltyService,
        private _formBuilder: FormBuilder,
        private cdr: ChangeDetectorRef,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        // Create the form
        this.filterForm = this._formBuilder.group({
            channel: ['ALL'],
            status: ['ALL']
        });

        // Setup Form
        this.setupForm = this._formBuilder.group({
            phone: ['', Validators.required],
            channel: ['', Validators.required]
        });        

        // Update Form
        this.updateForm = this._formBuilder.group({
            status: ['']
        });
        
        // Fetch micro dealers
        this._loyaltyService.getMicroDealer().subscribe();
        this._loyaltyService.microDealers$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (list) => {
                    this.allDealer = list;
                    this.applyFilters();
                    this.isLoading = false;
                },
                (error) => {
                    console.error('Error fetching micro dealer list:', error);
                    this.isLoading = false;
                }
            );

        // Filter status
        this.filterForm.get('status').valueChanges.subscribe(
            (value) => {
                if (value) {
                    this.selectedStatus = value;
                    this.applyFilters();
                }
            }
        );

        // Filter channel
        this.filterForm.get('channel').valueChanges.subscribe(
            (value) => {
                if (value) {
                    this.selectedChannel = value;
                    this.applyFilters();
                }
            }
        );
    }

    applyFilters(): void {
        let filteredMicrodealers = this.allDealer;
    
        if (this.selectedChannel !== 'ALL') {
            filteredMicrodealers = filteredMicrodealers.filter(dealer =>
                dealer.microDealer.some(micro => micro.channel === this.selectedChannel)
            );
        }
    
        if (this.selectedStatus !== 'ALL') {
            filteredMicrodealers = filteredMicrodealers.filter(dealer =>
                dealer.microDealer.some(micro => micro.status === this.selectedStatus)
            );
        }
    
        this.filteredMicrodealers = this.microDealersChannel(filteredMicrodealers);
        this.cdr.detectChanges();
    }
    
    microDealersChannel(microDealers: MicrodealerDetails[]): MicrodealerChannel[] {
        const transformed = microDealers.flatMap(dealer => 
            dealer.microDealer
            .filter(micro => 
                (this.selectedChannel === 'ALL' || micro.channel === this.selectedChannel) &&
                (this.selectedStatus === 'ALL' || micro.status === this.selectedStatus)
            )
            .map(micro => ({
                _id: dealer._id,
                name: dealer.name,
                createdAt: dealer.createdAt,
                email: dealer.email,
                phone: dealer.phone,
                referral: dealer.referral,
                cashback: dealer.cashback,
                loyaltyPrograms: dealer.loyaltyPrograms,
                channel: micro.channel,
                microDealerStatus: micro.status
            }))
        );
        console.log('Transformed data:', transformed);
        return transformed;
    }
    
    /* Add New Button */
    addNew(isTour: boolean = false): void {
        this.isTourActive = isTour;
        this.addNewDialog = true;

        if (isTour) {
            this.pauseTour(); // Implement this method to pause the tour
        }
    }

    onDialogClose(): void {
        this.addNewDialog = false; // Close the dialog

        // Resume the tour if it was part of the tour flow
        if (this.isTourActive) {
            this.isTourActive = false; // Reset the flag
            this.nextStep(); // Continue to the next step in the tour
        }
    }

    pauseTour(): void {
        // Pause the tour logic here
        console.log('Tour paused while dialog is open.');
    }

    /* Edit Button */
    updateStatus(index: number): void {
        this.editingRowIndex = index;
        const currentStatus = this.filteredMicrodealers[index].microDealerStatus || '';
        this.originalChannel = currentStatus;
        this.isModified = false;
        this.updateForm.patchValue({
            status: currentStatus
        });
    }    

    onStatusChange(changeStatus: string) {
        this.isModified = changeStatus !== this.originalChannel;
    }
    
    /* Save button */
    saveChanges() {
        if (this.editingRowIndex !== null && this.isModified) {
            const updatedDealer = this.filteredMicrodealers[this.editingRowIndex];
            const params = {
                phone: updatedDealer.phone,
                channel: updatedDealer.channel,
                status: updatedDealer.microDealerStatus
            };
            this._loyaltyService.updateDealerStatus(params).subscribe(
                (response) => {
                    if (response) {
                        console.log('Status updated successfully:', response);
                        this.messageService.add({ 
                            key: 'tost', 
                            severity: 'success', 
                            summary: 'Success', 
                            detail: 'Status updated successfully' 
                        });
                    }
                },
                (error) => {
                    console.error('Error updating status:', error);
                    this.messageService.add({ 
                        key: 'tost', 
                        severity: 'error', 
                        summary: 'Error', 
                        detail: error.error.message
                    });
                }
            );
        }
    }    
    
    // Check if the click is outside of the edit button or dropdown
    @HostListener('document:click', ['$event'])
    handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const isClickInsideEditButton = target.closest('.p-button');
        const isClickInsideDropdown = target.closest('.p-dropdown') || target.closest('.p-dropdown-panel');
        
        if (!isClickInsideEditButton && !isClickInsideDropdown) {
            this.editingRowIndex = null;
            this.isModified = false;
            this.cdr.detectChanges();
        }
    }               

    /* Submit Button */
    submit() {
        const phone = this.checkPhoneNumber(this.setupForm.get('phone').value);
        const channel = this.setupForm.get('channel').value;
        
        this._loyaltyService.setMicrodealer({ phone, channel }).subscribe(
            (response) => {
                if (response.code === 200) {
                    console.log('Successfully added new micro dealer:', response);
                    this.messageService.add({ 
                        key: 'tost', 
                        severity: 'success', 
                        summary: 'Success', 
                        detail: 'Successfully added new micro dealer' 
                    });
                    this.addNewDialog = false;
                    this.editingRowIndex = null;
                    this.isModified = false;
                    this.setupForm.reset();
                } else {
                    console.warn('Failed to add new micro dealer:', response);
                    this.messageService.add({
                        key: 'tost',
                        severity: 'warn',
                        summary: 'Warning',
                        detail: response.message || 'Failed to add new micro dealer'
                    });
                }
            },
            (error) => {
                console.error('Error adding new micro dealer:', error);
                this.messageService.add({ 
                    key: 'tost', 
                    severity: 'error', 
                    summary: 'Error', 
                    detail: error.error.message || 'An error occurred while adding the micro dealer'
                });
            }
        );
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
    
    checkPhoneNumber(phone: string): string {
        if (!phone.startsWith('6')) {
            phone = '6' + phone;
        }
        return phone;
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

/* addNew() {
    this.setupForm.reset();
    this.addNewDialog = true;
} */

/* showTourOverlay(overlayId: string): void {
    console.log('Showing overlay:', overlayId);
    const targetElement = document.getElementById(overlayId);
    
    if (!targetElement) {
        console.error(`Target element with ID '${overlayId}' not found.`);
        return;
    }
    
    this.hideAllOverlays();
    
    if (overlayId === 'tourGuideOverlay1') {
        console.log('Displaying overlay 1');
        this.tourGuideOverlay1.show(new MouseEvent('click'), targetElement);
    } else if (overlayId === 'tourGuideOverlay2') {
        console.log('Displaying overlay 2');
        this.tourGuideOverlay2.show(new MouseEvent('click'), targetElement);
    } else if (overlayId === 'tourGuideOverlay3') {
        console.log('Displaying overlay 3');
        this.tourGuideOverlay3.show(new MouseEvent('click'), targetElement);
    } else if (overlayId === 'tourGuideOverlay4') {
        console.log('Displaying overlay 4');
        this.tourGuideOverlay4.show(new MouseEvent('click'), targetElement);
    } else if (overlayId === 'tourGuideOverlay5') {
        console.log('Displaying overlay 5');
        this.tourGuideOverlay5.show(new MouseEvent('click'), targetElement);
    }
} */

/* ngAfterViewInit(): void {
    const targetElement = document.getElementById('tourGuideOverlay1');
    console.log('Manually testing overlay display...');
    if (this.tourGuideOverlay1 && targetElement) {
        this.tourGuideOverlay1.show(new MouseEvent('click'), targetElement);
    }
} */                

/* nextStep(): void {
    console.log('Current step before next:', this.currentStep);
    
    if (this.currentStep < this.overlaySteps.length - 1) {
        this.hideAllOverlays();
        
        this.currentStep++;
        const nextOverlayId = this.overlaySteps[this.currentStep];
        
        console.log('Next step index:', this.currentStep);
        console.log('Attempting to show overlay:', nextOverlayId);
        
        if (nextOverlayId === 'tourGuideOverlay3') {
            this.addNewDialog = true;
        } else {
            setTimeout(() => {
                this.showTourOverlay(nextOverlayId);
            }, 200);
        }
    } else {
        console.log('Tour finished!');
        this.endTour(); // End the tour at the last step
    }
} */