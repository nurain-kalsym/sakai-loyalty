import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';
import { LoyaltyConfig } from 'src/app/core/loyalty/loyalty.types';
import { ValidationService } from 'src/app/core/validation/validation.service';
import { trigger, style, transition, animate } from '@angular/animations';
import { OverlayPanel } from 'primeng/overlaypanel';
@Component({
    templateUrl: './loyalty-settings.component.html',
    providers: [MessageService, ConfirmationService],
    animations: [
        trigger('expandCollapse', [
            transition(':enter', [
                style({ height: '0px', opacity: 0, overflow: 'hidden' }),
                animate('300ms ease-in-out', style({ height: '*', opacity: 1 }))
            ]),
                transition(':leave', [
                animate('300ms ease-in-out', style({ height: '0px', opacity: 0, overflow: 'hidden' }))
            ])
        ])
    ]
})
export class LoyaltySettingsComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    ColumnUsers = ['no','channels','type','actions'];
    availableChannels = ['e-kedai', 'hello-sim'];
    selectedChannels: string[] = [];
    loyaltyConfigs: LoyaltyConfig[] = [];
    isLoading = false;
    addNewDialog: boolean = false;
    setupForm: FormGroup;
    openIndex: number | null = null;
    loyaltyTierDetails: any;
    eKedai: boolean = false;
    helloSim: boolean = false;
    messages: Message[] = [];
    editMode: boolean = false;
    isTourActive = false;
    currentStep = 1;
    tours = {
        overlaySteps: [
            'tourGuideOverlay1',
            'tourGuideOverlay2'
        ],
        tourSteps: [
            'tourGuide1',
            'tourGuide2',
            'tourGuide3',
            'tourGuide4',
            'tourGuide5'
        ],
        overlayTourSteps: [
            'guide1',
            'guide2',
            'guide3',
            'guide4',
            'guide5'
        ]
    };
    currentTourSteps: string[] = [];
    tourType: string = 'overlaySteps';

    @ViewChild('tourGuideOverlay1') tourGuideOverlay1: OverlayPanel;
    @ViewChild('tourGuideOverlay2') tourGuideOverlay2: OverlayPanel;

    @ViewChild('tourGuide1') tourGuide1: OverlayPanel;
    @ViewChild('tourGuide2') tourGuide2: OverlayPanel;
    @ViewChild('tourGuide3') tourGuide3: OverlayPanel;
    @ViewChild('tourGuide4') tourGuide4: OverlayPanel;
    @ViewChild('tourGuide5') tourGuide5: OverlayPanel;

    @ViewChild('guide1') guide1: OverlayPanel;
    @ViewChild('guide2') guide2: OverlayPanel;
    @ViewChild('guide3') guide3: OverlayPanel;
    @ViewChild('guide4') guide4: OverlayPanel;
    @ViewChild('guide5') guide5: OverlayPanel;

    constructor(
        private _loyaltyService: LoyaltyService,
        private cdr: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private messageService: MessageService,
    ) {}

    ngOnInit(): void {
        this.initializeForms();
        this.disableFields();
        
        // Handle value changes
        this.setupForm.get('eKedai').valueChanges.subscribe(value => this.eKedai = value);
        this.setupForm.get('helloSim').valueChanges.subscribe(value => this.helloSim = value);
    
        this.isLoading = true;
    
        // Fetch data from the service
        this._loyaltyService.getLoyaltyConfig({ page: 1, pageSize: 10 })
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((configs) => {
                this.loyaltyConfigs = configs;
                this.isLoading = false;
                this.cdr.markForCheck();
            });
    }

    initializeForms(): void {
        this.setupForm = this._formBuilder.group({
            loyaltySetup: this._formBuilder.array([
                this.createLoyaltyTierGroup(),
                this.createLoyaltyTierGroup(),
                this.createLoyaltyTierGroup()
            ]),
            eKedai: [false],
            helloSim: [false]
        });

        // Set default values after initialization
        this.setDefaultValues();
    }
    
    createLoyaltyTierGroup(): FormGroup {
        return this._formBuilder.group({
            tier: [null, Validators.required],
            target: [null, [Validators.required, ValidationService.numberOnlyValidator]],
            timeFrame: [null, [Validators.required, ValidationService.numberOnlyValidator]],
        });
    }

    // Set default values for the tiers
    setDefaultValues(): void {
        const loyaltySetupControls = this.setupForm.get('loyaltySetup') as FormArray;

        // Define default tiers in order
        const defaultTiers = [1, 2, 3];

        loyaltySetupControls.controls.forEach((control, i) => {
            const tier = defaultTiers[i] || 0; // Default to 0 if index exceeds array length
            control.patchValue({
                tier: tier,
                target: tier === 3 ? 0 : control.value.target ?? null,
                timeFrame: tier === 3 ? 0 : control.value.timeFrame ?? null
            });
        });
    }
    
    getTierTooltip(tier: number): string {
        switch (tier) {
          case 1:
            return 'Tier 1 (Platinum)';
          case 2:
            return 'Tier 2 (Gold)';
          case 3:
            return 'Tier 3 (Silver)';
        }
      
        throw new Error('Unexpected tier value: ' + tier);
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

    addNew(): void {
        this.setupForm.reset();      // Reset the form
        this.setDefaultValues();     // Set default values after reset
        this.editMode = false;       // Reset the edit mode
        this.addNewDialog = true;    // Open the dialog for adding a new entry
    }        

    toggleOpen(index: number): void {
        this.openIndex = this.openIndex === index ? null : index;
    }

    // Disable fields based on the value of tier
    disableFields(): void {
        const loyaltySetupControls = this.setupForm.get('loyaltySetup') as FormArray;

        loyaltySetupControls.controls.forEach((control, i) => {
            const tier = control.get('tier').value;
            if (tier === 3) {
                control.get('tier').disable();
                control.get('target').disable();
                control.get('timeFrame').disable();
            } else {
                control.get('tier').disable();
            }
        });
    }

    save(): void {
        // Check if form is valid
        if (this.setupForm.invalid) {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please complete all required fields.' });
            return;
        }
    
        // Collect selected channels
        const selectedChannels = [];
        if (this.setupForm.value.eKedai) selectedChannels.push('e-kedai');
        if (this.setupForm.value.helloSim) selectedChannels.push('hello-sim');
    
        // Determine the type of loyalty setup based on the selected channels
        const type = selectedChannels.length > 1 ? 'unique' : 'basic';
    
        // Update each loyalty tier in the FormArray with the type
        (this.setupForm.get('loyaltySetup') as FormArray).controls.forEach(group => {
            const groupForm = group as FormGroup;
            if (!groupForm.contains('type')) {
                groupForm.addControl('type', this._formBuilder.control(type));
            } else {
                groupForm.get('type').setValue(type);
            }
        });
    
        // Prepare the request body
        const body = {
            channels: selectedChannels,
            loyaltySetup: this.setupForm.getRawValue().loyaltySetup
        };
    
        // Handle saving (either new entry or edit existing entry)
        let saveOperation;
        if (this.editMode) {
            // Editing an existing entry
            if (!this.loyaltyTierDetails || !this.loyaltyTierDetails._id) {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'LoyaltyTierDetails is missing. Cannot save changes.' });
                return;
            }
            saveOperation = this._loyaltyService.editLoyaltyConfig(this.loyaltyTierDetails._id, body);
        } else {
            // Adding a new entry
            saveOperation = this._loyaltyService.setLoyaltyConfig(body);
        }
    
        // Perform the save operation
        saveOperation.subscribe(
            () => {
                // On success, display a success message
                const successMessage = this.editMode ? 'Loyalty Config updated successfully' : 'Loyalty Config created successfully';
                this.messageService.add({ severity: 'success', summary: 'Success', detail: successMessage });
    
                // Close the dialog
                this.addNewDialog = false;
    
                // Reset edit mode
                this.editMode = false;
    
                // Reset the form
                this.setupForm.reset();
                this.setDefaultValues();
    
                // Refresh the data from the server
                this._loyaltyService.getLoyaltyConfig({ page: 1, pageSize: 10 })
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((configs) => {
                        this.loyaltyConfigs = configs;
                        this.cdr.markForCheck(); // Ensure change detection
                    });
            },
            (error) => {
                // Handle error case and display an error message
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
            }
        );
    } 

    edit(loyaltyConfig: LoyaltyConfig): void {
        // Set edit mode to true
        this.editMode = true;
    
        // Clear existing form array controls before populating
        const loyaltySetupArray = this.setupForm.get('loyaltySetup') as FormArray;
        loyaltySetupArray.clear();
    
        // Populate form with the existing loyaltyConfig data
        loyaltyConfig.loyaltySetup.forEach(setup => {
            const loyaltyGroup = this.createLoyaltyTierGroup();
            loyaltyGroup.patchValue({
                tier: setup.tier,
                target: setup.target,
                timeFrame: setup.timeFrame,
                type: setup.type
            });
            loyaltySetupArray.push(loyaltyGroup);
        });
    
        // Set the selected channels
        this.setupForm.patchValue({
            eKedai: loyaltyConfig.channels.includes('e-kedai'),
            helloSim: loyaltyConfig.channels.includes('hello-sim')
        });
    
        // Disable fields based on the tier
        this.disableFields();
    
        // Show the dialog for editing
        this.addNewDialog = true;
    }

    ngAfterViewInit(): void {
        console.log('View initialized, overlays ready.');
    }

    startTour(tourType: string): void {
        this.tourType = tourType;

        // Retreive steps for the selected tour
        this.currentTourSteps = this.tours[tourType];
        if (!this.currentTourSteps) {
            console.error(`Tour type ${tourType} tour`);
            return;
        }

        console.log(`Starting the ${tourType} tour`);
        
        this.currentStep = 0;
        this.hideAllOverlays();

        const firstOverlayId = this.currentTourSteps[this.currentStep];
        console.log('Showing Overlay: ', firstOverlayId);
        
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
    
        this.hideAllOverlays();
    
        // Determine overlay key dynamically based on tourType
        const overlayKey = `${this.tourType === 'overlaySteps' ? 'tourGuideOverlay' : 
            this.tourType === 'overlayTourSteps' ? 'guide' : 'tourGuide'}${this.currentStep + 1}`;
        
        const overlay = this[overlayKey];
        if (overlay) {
            overlay.show(new MouseEvent('click'), targetElement);
        } else {
            console.error(`Overlay for ID '${overlayId}' is not defined.`);
        }
    }        

    hideAllOverlays(): void {
        this.currentTourSteps.forEach((stepId) => {
            const element = document.getElementById(stepId);
            if (element) {
                element.style.zIndex = '0';
                element.style.boxShadow = 'none';
                element.style.background = '';
            }
        });
    
        // Dynamically hide all overlays for the current tour type
        for (let i = 1; i <= this.tours[this.tourType].length; i++) {
            const overlayKey = `${this.tourType === 'overlaySteps' ? 'tourGuideOverlay' : 
                this.tourType === 'overlayTourSteps' ? 'guide' : 'tourGuide'}${i}`;
            const overlay = this[overlayKey];
            if (overlay) {
                overlay.hide();
            }
        }
    }    
    
    nextStep(): void {
        if (this.currentStep < this.currentTourSteps.length - 1) {
            this.hideAllOverlays();
            this.currentStep++;

            const nextOverlayId = this.currentTourSteps[this.currentStep];
            setTimeout(() => {
            this.showTourOverlay(nextOverlayId);
            }, 200);
        } else {
            console.log('Tour finished!');
            this.endTour();
        }
    }

    previousStep(): void {
        if (this.currentStep > 0) {
            this.hideAllOverlays();
            this.currentStep--;

            const prevOverlayId = this.currentTourSteps[this.currentStep];
            setTimeout(() => {
            this.showTourOverlay(prevOverlayId);
            }, 200);
        }
    }

    endTour(forceReset: boolean = true): void {
        console.log('Tour ended');
        this.hideAllOverlays();
        if (forceReset) {
            this.currentStep = 0;
        }
    }
    
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}