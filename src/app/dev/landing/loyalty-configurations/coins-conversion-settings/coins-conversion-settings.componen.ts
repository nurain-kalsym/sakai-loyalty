import { animate, style, transition, trigger } from "@angular/animations";
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MessageService } from "primeng/api";
import { OverlayPanel } from "primeng/overlaypanel";
import { debounceTime, Subject, takeUntil } from "rxjs";
import { LoyaltyService } from "src/app/core/loyalty/loyalty.service";
import { Conversion, ServiceConversions, Tier } from "src/app/core/loyalty/loyalty.types";
import { ValidationService } from "src/app/core/validation/validation.service";

@Component({
    templateUrl: './coins-conversion-settings.component.html',
    providers: [MessageService],
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
export class CoinsConversionComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    conversionColumns: string[] = ['channel', 'expired', 'operation'];
    allConversion: Conversion[] = [];
    data: Conversion;
    referralTiers: Tier[] = [];
    allServiceConversion: ServiceConversions[] = [];
    existServiceConversion: ServiceConversions[] = [];
    newServiceConversion: ServiceConversions[] = [];
    displayExistServices: ServiceConversions[] = [];
    displayServices: ServiceConversions[] = [];
    newDisplayServices: ServiceConversions[] = [];
    filteredConversions: Conversion[] = []; 
    manageServiceDialog: boolean = false;
    expandedRow: { [key: string]: boolean } = {};
    isLoading = false;
    manageConversionForm: FormGroup;
    filterForm: FormGroup;
    isHovered: Boolean = false;
    isHoveredEdit = false;
    isHoveredDelete = false;
    hoveredIcons: { [key: string]: string } = {};
    conversionServiceForm: FormGroup; 
    tiersVisible: boolean = false;
    isServiceBeingAdded = false;
    isFormSubmitted = false;
    loyaltyProgram: boolean = false;
    sumPercentage: boolean = true;
    serviceChanges: boolean = false;
    maxTiers: number = 3;
    loyaltyServiceForm: FormGroup;
    isTourActive = false;
    currentStep = 1;
    tours = {
        overlaySteps: [
            'tourGuideOverlay1',
            'tourGuideOverlay2',
            'tourGuideOverlay3',
            'tourGuideOverlay4'
        ],
        tourSteps: [
            'tourGuide1',
            'tourGuide2',
            'tourGuide3',
            'tourGuide4',
            'tourGuide5',
            'tourGuide6'
        ],
        overlayTourSteps: [
            'guide1',
            'guide2',
            'guide3',
            'guide4',
            'guide5',
            'guide6',
            'guide7'
        ]
    };
    currentTourSteps: string[] = [];
    tourType: string = 'overlaySteps';
    
    @ViewChild('tourGuideOverlay1') tourGuideOverlay1: OverlayPanel;
    @ViewChild('tourGuideOverlay2') tourGuideOverlay2: OverlayPanel;
    @ViewChild('tourGuideOverlay3') tourGuideOverlay3: OverlayPanel;
    @ViewChild('tourGuideOverlay4') tourGuideOverlay4: OverlayPanel;

    @ViewChild('tourGuide1') tourGuide1: OverlayPanel;
    @ViewChild('tourGuide2') tourGuide2: OverlayPanel;
    @ViewChild('tourGuide3') tourGuide3: OverlayPanel;
    @ViewChild('tourGuide4') tourGuide4: OverlayPanel;
    @ViewChild('tourGuide5') tourGuide5: OverlayPanel;
    @ViewChild('tourGuide6') tourGuide6: OverlayPanel;

    @ViewChild('guide1') guide1: OverlayPanel;
    @ViewChild('guide2') guide2: OverlayPanel;
    @ViewChild('guide3') guide3: OverlayPanel;
    @ViewChild('guide4') guide4: OverlayPanel;
    @ViewChild('guide5') guide5: OverlayPanel;
    @ViewChild('guide6') guide6: OverlayPanel;
    @ViewChild('guide7') guide7: OverlayPanel;

    constructor(
        private _loyaltyService: LoyaltyService,
        private _formBuilder: FormBuilder,
        private _validationService: ValidationService,
        private messageService: MessageService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.getAllConversions();
        this.initializeForms();
        this.subscribeToFormChanges();
    }

    private initializeForms(): void {
        this.manageConversionForm = this.createManageConversionForm();
        this.conversionServiceForm = this.createConversionServiceForm();
        this.filterForm = this.createFilterForm();
        this.loyaltyServiceForm = this.createLoyaltyServiceForm();

        this.displayServices = [
            ...this.displayExistServices,
            ...this.newDisplayServices
        ];
    }

    private createManageConversionForm(): FormGroup {
        return this._formBuilder.group({
            channel: [''],
            expired: ['', [Validators.required, ValidationService.numberOnlyValidator]],
        });
    }

    private createConversionServiceForm(): FormGroup {
        return this._formBuilder.group({
            serviceName: ['', [Validators.required, ValidationService.serviceNameValidator]],
            serviceId: [{ value: '', disabled: true }],
            loyaltyProgram: [false],
            loyaltyTiers: this._formBuilder.array([]),
        });
    }

    private createFilterForm(): FormGroup {
        return this._formBuilder.group({
            search: ['']
        });
    }    

    private createLoyaltyServiceForm(): FormGroup {
        return this._formBuilder.group({
            loyaltyTiers: this._formBuilder.array([
                this.createLoyaltyFormGroup(1),
                this.createLoyaltyFormGroup(2),
                this.createLoyaltyFormGroup(3)
            ])
        });
    }

    private subscribeToFormChanges(): void {
        this.filterForm.get('search').valueChanges
        .pipe(debounceTime(300), takeUntil(this._unsubscribeAll))
        .subscribe(searchTerm => this.filterConversions(searchTerm));

        this.conversionServiceForm.get('loyaltyProgram').valueChanges
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(value => this.loyaltyProgram = value);

        this.conversionServiceForm.get('serviceName').valueChanges
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(input => this.updateServiceId(input));
    }

    private updateServiceId(input: string): void {
        this.conversionServiceForm.markAllAsTouched();
        this.conversionServiceForm.markAsDirty();
        this.conversionServiceForm.get('serviceId').patchValue(input ? this.generateServiceId(input) : '');
    }

    getAllConversions(): void {
        this.isLoading = true; // Start loading
        this._loyaltyService.getAllConversions({})
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                conversion => {
                    this.allConversion = conversion.map(conv => ({
                        ...conv,
                        channel: this._validationService.formatChannel(conv.channel)
                    }));
                    this.filteredConversions = [...this.allConversion];
                },
                error => {
                    console.error('Error fetching conversions:', error);
                },
                () => {
                    this.isLoading = false; // Stop loading
                }
            );
    }

    filterConversions(searchTerm: string): void {
        const lowerCaseSearchTerm = searchTerm?.trim().toLowerCase() || '';
    
        if (!lowerCaseSearchTerm) {
            this.filteredConversions = [...this.allConversion];
            return;
        }
    
        this.filteredConversions = this.allConversion.filter(conversion => {
            const matches = conversion.serviceConversions && conversion.serviceConversions.some(service =>
                service.serviceName.toLowerCase().includes(lowerCaseSearchTerm) ||
                service.serviceId.toLowerCase().includes(lowerCaseSearchTerm)
            );
            
            console.log(`Conversion: ${conversion.channel}, Matches: ${matches}`);
            return matches;
        });
    }    
                        
    
    clearSearch(): void {
        this.filterForm.get('search').setValue('');  // Reset the search input
        this.filterConversions('');  // Re-trigger the filter with an empty search term
    }

    manageService(conversion: Conversion) {
        this.data = conversion;
        this.allServiceConversion = [...conversion.serviceConversions];
        this.manageConversionForm.get('channel').setValue(conversion.channel);
        this.manageServiceDialog = true;
        this.manageConversionForm.patchValue({
            channel: conversion.channel,
            expired: conversion.expiryDuration
        });
    }

    copyToClipboard(value: string): void {
        const textArea = document.createElement('textarea');
        textArea.value = value;
        document.body.appendChild(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
            this.messageService.add({ 
                key: 'toast', 
                severity: 'success', 
                summary: 'Success', 
                detail: 'Copied to clipboard!' 
            });
        } catch {
            this.messageService.add({ 
                key: 'toast', 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Failed to copy text' 
            });
        } finally {
            document.body.removeChild(textArea); // Clean up
        }
    }

    toggleExpandRow(serviceId: string): void {
        this.expandedRow[serviceId] = !this.expandedRow[serviceId];
    }

    isRowExpanded(serviceId: string): boolean {
        return this.expandedRow[serviceId]; 
    }

    addNewService() {
        if (!this.isServiceBeingAdded) {
            this.isServiceBeingAdded = true;
            // const newService = this.createEmptyService();
            // newService.mergedRow = true;
            this.allServiceConversion.push({
                serviceId: '',
                serviceName: '',
                microDealer: { discountRate: null },
                referralTiers: [{ orderSequence: null, percentage: null, voucherCode: null }],
                loyaltyTiers: [{ tier: null, loyaltyRate: null, referralRate: null, voucherCode: null }],
                mergedRow: true
            });
        }
    }

    /* private createEmptyService(): ServiceConversions {
        return {
            serviceId: '',
            serviceName: '',
            microDealer: { discountRate: null },
            referralTiers: [{ orderSequence: null, percentage: null, voucherCode: null }],
            loyaltyTiers: [{ tier: null, loyaltyRate: null, referralRate: null, voucherCode: null }],
            mergedRow: true
        };
    } */

    toggleTiers(): void {
        this.tiersVisible = !this.tiersVisible; 
    }

    trackByConversionId(index: number, conversion: Conversion): string {
        return conversion._id; 
    }
    
    closeForm(): void {
        this.isServiceBeingAdded = false; 
        if (this.allServiceConversion.length > 0) {
            this.allServiceConversion.pop(); 
        }
    }

    generateServiceId(serviceName: string): string {
        return serviceName.toLowerCase().replace(/\s+/g, '-');
    }

    get loyaltyTiers(): FormArray {
        return this.loyaltyServiceForm.get('loyaltyTiers') as FormArray;
    }

    updateLoyaltyRate() {
        let loyaltyTiers = this.loyaltyServiceForm.get('loyaltyTiers').value;

        loyaltyTiers.forEach((tier, index) => {
            tier.tier = index + 1;
          
            // Set default values if properties are not present
            if (tier.loyaltyRate === undefined || tier.loyaltyRate === null) {
              tier.loyaltyRate = 0;
            }
          
            if (tier.voucherCode === undefined || tier.voucherCode === null) {
              tier.voucherCode = "";
            }
          
            if (tier.referralRate === undefined || tier.referralRate === null) {
              tier.referralRate = 0;
            }
          });

        // set referralTier if any
        const tierLengths = loyaltyTiers.filter(item => item.referralRate !== 0).length;
        const sequences = tierLengths === 3 ? [1, 2, 3] : tierLengths === 2 ? [1, 2] : tierLengths === 1 ? [1] : [];
        this.referralTiers.push(...sequences.map(orderSequence => ({ orderSequence })));

        return loyaltyTiers;
    }

    createLoyaltyFormGroup(tier: number): FormGroup {
        return this._formBuilder.group({
            tier: [{ value: tier, disabled: true }, Validators.required],
            loyaltyRate: ['', [Validators.required, ValidationService.numbersDecimalValidator]],
            referralRate: ['', [Validators.required, ValidationService.numbersDecimalValidator]],
            voucherCode: ['', []]
        });
    }
    
    loyaltyCheckbox(event: any): void {
        this.loyaltyProgram = event.checked;

        const loyaltyTiersArray = this.loyaltyTiers;
        
        if (this.loyaltyProgram) {
            while (loyaltyTiersArray.length < this.maxTiers) {
                this.addLoyaltyTier();
            }
        } else {
            loyaltyTiersArray.clear();
            this.loyaltyServiceForm.reset();
        }
    }

    // Method to add a loyalty tier
    addLoyaltyTier(): void {
        if (this.loyaltyTiers.length < this.maxTiers) {
            const tierCount = this.loyaltyTiers.length + 1; // Ensure correct tier number
            this.loyaltyTiers.push(this.createLoyaltyFormGroup(tierCount));
        }
    }

    // Method to remove a loyalty tier
    removeLoyaltyTier(index: number) {
        this.loyaltyTiers.removeAt(index);
        this.reorderLoyaltyTiers();
    }
     
    // Method to reorder the tier after delete
    reorderLoyaltyTiers() {
        this.loyaltyTiers.controls.forEach((formGroup, i) => {
            formGroup.get('tier')?.setValue(i + 1);
        });
    }          

    removeAllValidatorsAndMarkAsValid(formGroup: FormGroup) {

        function clearValidatorsAndSetValue(control: AbstractControl) {
            if (control instanceof FormGroup || control instanceof FormArray) {
                Object.keys(control.controls).forEach(key => {
                    clearValidatorsAndSetValue(control.controls[key]);
                });
            } else {
                control.clearValidators();
                control.clearAsyncValidators();
                control.setValue(null, { emitEvent: false });
                control.updateValueAndValidity();
            }
        }
    
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.controls[key];
            
            clearValidatorsAndSetValue(control);
        });
    
        // Mark the entire form as valid
        formGroup.updateValueAndValidity();

    }

    checkSumPercentage(): void {
        const totalPercentage = this.loyaltyTiers.controls.reduce((sum, control) => sum + (control.get('loyaltyRate')?.value || 0), 0);
        this.sumPercentage = totalPercentage <= 100;

        if (!this.sumPercentage) {
            this.messageService.add({ 
                key: 'toast', 
                severity: 'warn', 
                summary: 'Warning', 
                detail: 'Total loyalty rate exceeds 100%' 
            });
        }
    }

    submitBtn(): void {
        if (this.conversionServiceForm.valid) {
            const activeService = this.allServiceConversion.find(service => service.mergedRow);
            
            if (activeService) {
                const formValue = this.conversionServiceForm.value;
                activeService.serviceId = activeService.serviceId || this.generateServiceId(formValue.serviceName);
                activeService.serviceName = formValue.serviceName;
    
                let body: any = {
                    serviceId: activeService.serviceId,
                    serviceName: activeService.serviceName,
                };
    
                // Handle loyalty tiers
                const loyalty = this.loyaltyServiceForm.getRawValue();
                if (loyalty && loyalty.loyaltyTiers.length > 0) {
                    const validTiers = loyalty.loyaltyTiers.filter(tier => tier.rate !== null);
                    if (validTiers.length > 0) {
                        body.loyaltyTiers = validTiers;
                    }
                }
    
                console.log('Adding/Updating body:', body);
    
                const existingIndex = this.allServiceConversion.findIndex(service => service.mergedRow);
                if (existingIndex > -1) {
                    this.allServiceConversion[existingIndex] = { ...this.allServiceConversion[existingIndex], ...body };
                } else {
                    this.allServiceConversion.push(body);
                }
    
                activeService.mergedRow = false;
            }
    
            this.conversionServiceForm.reset();
            this.isServiceBeingAdded = false;
            this.isFormSubmitted = true;
    
            this.messageService.add({
                key: 'toast',
                severity: 'success',
                summary: 'Service Added',
                detail: 'The new service has been successfully added.',
                life: 3000,
            });
    
            console.log('Final: ', this.allServiceConversion);
        } else {
            console.error('Form is invalid');
        }
    }    

    /* submitBtn(): void {
        if (this.conversionServiceForm.valid) {
            // Find the service that is being edited (if any)
            const activeService = this.allServiceConversion.find(service => service.mergedRow);
    
            if (activeService) {
                const formValue = this.conversionServiceForm.value;
    
                activeService.serviceId = activeService.serviceId || this.generateServiceId(formValue.serviceName);
                activeService.serviceName = formValue.serviceName;
    
                let body: any = {
                    serviceId: activeService.serviceId,
                    serviceName: activeService.serviceName
                };
    
                // Handle loyalty tiers
                const loyalty = this.loyaltyServiceForm.getRawValue();
                if (loyalty && loyalty.loyaltyTiers.length > 0) {
                    const validTiers = loyalty.loyaltyTiers.filter(tier => tier.rate !== null);
                    if (validTiers.length > 0) {
                        body.loyaltyTiers = validTiers;
                    }
                }

                this.allServiceConversion = this.allServiceConversion.filter(service => 
                    service.serviceId && service.serviceId !== ''
                );
    
                // Add or replace the active service in the list
                const existingIndex = this.allServiceConversion.findIndex(service => service.mergedRow);
                if (existingIndex > -1) {
                    this.allServiceConversion[existingIndex] = { ...this.allServiceConversion[existingIndex], ...body };
                } else {
                    this.allServiceConversion.push(body);
                }
    
                // Reset the mergedRow state for the active service
                activeService.mergedRow = false;
            }
    
            // Reset the form and UI state
            this.conversionServiceForm.reset();
            this.isServiceBeingAdded = false; // Re-enable the submit button
            this.isFormSubmitted = true;

            this.messageService.add({
                key: 'toast',
                severity: 'success',
                summary: 'Service Added',
                detail: 'The new service has been successfully added.',
                life: 3000,
            });
    
            // Log the final state of all services
            console.log('Final: ', this.allServiceConversion);
        } else {
            console.error('Form is invalid');
        }
    } */    

    /* submitBtn(): void {
        if (this.conversionServiceForm.valid) {
            // Find the service that is being edited (if any)
            const activeService = this.allServiceConversion.find(service => service.mergedRow);

            if (activeService) {
                // Get the form values
                const formValue = this.conversionServiceForm.value;

                // Generate a new service ID only if the active service doesn't already have one
                formValue.serviceId = activeService.serviceId || this.generateServiceId(formValue.serviceName);

                // Prepare the body for submission
                let body: any = {
                    serviceId: formValue.serviceId,
                    serviceName: formValue.serviceName,
                };

                // Handle loyalty tiers
                const loyalty = this.loyaltyServiceForm.getRawValue();
                if (loyalty && loyalty.loyaltyTiers.length > 0) {
                    const validTiers = loyalty.loyaltyTiers.filter(tier => tier.rate !== null);
                    if (validTiers.length > 0) {
                        body.loyaltyTiers = validTiers;
                    }
                }

                // Remove invalid services (empty serviceId) from the list
                this.allServiceConversion = this.allServiceConversion.filter(service => 
                    service.serviceId && service.serviceId !== ''
                );

                // Add or replace the active service in the list
                const existingIndex = this.allServiceConversion.findIndex(service => service.mergedRow);
                if (existingIndex > -1) {
                    this.allServiceConversion[existingIndex] = { ...this.allServiceConversion[existingIndex], ...body };
                } else {
                    this.allServiceConversion.push(body);
                }

                // Reset the mergedRow state for the active service
                activeService.mergedRow = false;
            }

            // Reset the form and UI state
            this.conversionServiceForm.reset();
            this.isServiceBeingAdded = false; // Re-enable the submit button
        } else {
            console.error('Form is invalid');
        }

        // Log the final state of all services
        console.log('Final: ', this.allServiceConversion);
    } */        
        
    save() {
        if (this.manageConversionForm.invalid) {
            console.error('Manage Conversion Form is invalid');
            return;
        }

        const loyalty = this.updateLoyaltyRate();
    
        const body = {
            _id: this.data._id,
            channel: this.data.channel,
            expiryDuration: parseInt(this.manageConversionForm.value.expired, 10),
            serviceConversions: this.allServiceConversion,
        };
    
        console.log('Original data:', this.data);
        console.log('Payload to backend:', body);
    
        this._loyaltyService.updateConversions(body._id, body).subscribe({
            next: () => {
                this.messageService.add({
                    key: 'toast',
                    severity: 'success',
                    summary: 'Conversion Setting Updated',
                    detail: 'Conversion settings have been successfully updated.',
                    life: 3000,
                });
    
                
                const existingIndex = this.allServiceConversion.findIndex(service => service.serviceId === body.serviceConversions[0].serviceId);
                if (existingIndex > -1) {
                    this.allServiceConversion[existingIndex] = body.serviceConversions[0];
                }
    
                this.allServiceConversion = [...this.allServiceConversion];
                this._changeDetectorRef.detectChanges();

                // Close the dialog after successful update
                this.manageServiceDialog = false;
            },
            error: (error) => {
                console.error('Error updating conversion settings:', error);
                this.messageService.add({
                    key: 'toast',
                    severity: 'error',
                    summary: 'Update Failed',
                    detail: error.error?.message || 'An unexpected error occurred.',
                    life: 3000,
                });
            },
        });
    }
    
    deleteService(serviceToDelete: string): void {
        // Filter the services in all arrays to remove the service with the matching name
        this.existServiceConversion = this.existServiceConversion.filter(service => service.serviceName !== serviceToDelete);
        this.newServiceConversion = this.newServiceConversion.filter(service => service.serviceName !== serviceToDelete);
        this.allServiceConversion = this.allServiceConversion.filter(service => service.serviceName !== serviceToDelete);
    
        // Update displayed services by filtering the `serviceName`
        this.displayServices = this.displayServices.filter(service => service.serviceName !== serviceToDelete);
        this.newDisplayServices = this.newDisplayServices.filter(service => service.serviceName !== serviceToDelete);
    
        // Mark changes and trigger change detection
        this.serviceChanges = true;
        this._changeDetectorRef.markForCheck();
    }

    editService(serviceId: string): void {
        const serviceToEdit = this.allServiceConversion.find(service => service.serviceId === serviceId);
    
        if (serviceToEdit) {
            this.conversionServiceForm.reset(); // Reset the form to clear previous values
            this.conversionServiceForm.patchValue({
                serviceName: serviceToEdit.serviceName,
                serviceId: serviceToEdit.serviceId,
                loyaltyProgram: serviceToEdit.loyaltyTiers.length > 0,
            });
    
            // Clear existing loyalty tiers
            while (this.loyaltyTiers.length) {
                this.loyaltyTiers.removeAt(0);
            }
    
            if (serviceToEdit.loyaltyTiers) {
                serviceToEdit.loyaltyTiers.forEach(tier => {
                    const tierGroup = this.createLoyaltyFormGroup(tier.tier);
                    tierGroup.patchValue({
                        loyaltyRate: tier.loyaltyRate,
                        referralRate: tier.referralRate,
                        voucherCode: tier.voucherCode,
                    });
                    this.loyaltyTiers.push(tierGroup);
                });
            }
    
            this.manageServiceDialog = true;
            this.isServiceBeingAdded = true;
        } else {
            console.error('Service not found for editing');
            this.messageService.add({
                key: 'toast',
                severity: 'warn',
                summary: 'Service Not Found',
                detail: `Service with ID ${serviceId} could not be found.`,
                life: 3000,
            });
        }
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

    ngAfterViewInit(): void {
        console.log('View initialized, overlay raady.');
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

            // Automatically check the loyalty checkbox when showing guide3
            if (overlayId === 'guide3') {
                this.conversionServiceForm.patchValue({loyaltyProgram: true});
            }
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
        const overlay = this['guide' + (this.currentStep + 1)];
        if (overlay) {
            overlay.hide();
        }
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