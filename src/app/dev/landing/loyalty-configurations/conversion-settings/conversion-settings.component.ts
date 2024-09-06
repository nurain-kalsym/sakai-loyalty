import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Message, MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';
import { Conversion, LoyaltyTier, Pagination, ServiceConversions, Tier } from 'src/app/core/loyalty/loyalty.types';
import { ValidationService } from 'src/app/core/validation/validation.service';
import { trigger, style, transition, animate } from '@angular/animations';

@Component({
    templateUrl: './conversion-settings.component.html',
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
export class ConversionSettingsComponent implements OnInit, OnDestroy {
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    columnConversion: string[] = ['channel', 'expiryDuration', 'operation'];
    allConversion: Conversion[];
    addReferralValue: Tier[];
    addLoyaltyValue: LoyaltyTier[];
    allConversionService: ServiceConversions[];
    existServiceConversion: ServiceConversions[] = [];
    newServiceConversion: ServiceConversions[] = [];
    displayExistServices: ServiceConversions[] = [];
    displayServices: ServiceConversions[] = [];
    newDisplayServices: ServiceConversions[] = [];
    updatedReferralValue: Tier[] = [];
    updatedLoyaltyValue: LoyaltyTier[] = [];
    manageServiceDialog: boolean = false;
    referralProgram: boolean = false;
    loyaltyProgram: boolean = false;
    microdealerProgram: boolean = false;
    showAddServiceForm: boolean = false;
    sumPercentage: boolean = true;
    manageConversionForm: FormGroup;
    conversionServiceForm: FormGroup;
    referralServiceForm: FormGroup;
    loyaltyServiceForm: FormGroup;
    microdealerServiceForm: FormGroup;
    pagination: Pagination;
    isLoading = false;
    maxTiers: number = 3;
    isChannelReadOnly: boolean = false;
    data: Conversion;
    serviceChanges: boolean = false;
    expandedServiceId: number | null = null;
    _id: string;
    isServiceBeingAdded = false;

    constructor(
        private _loyaltyService: LoyaltyService,
        private _formBuilder: FormBuilder,
        private messageService: MessageService,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        // Initialize forms
        this.initializeForms();
        this.loadConversions();

        // Subscribe to checkbox changes
        this.conversionServiceForm.get('referralProgram').valueChanges.subscribe(value => this.referralProgram = value);
        this.conversionServiceForm.get('loyaltyProgram').valueChanges.subscribe(value => this.loyaltyProgram = value);
        this.conversionServiceForm.get('microdealerProgram').valueChanges.subscribe(value => this.microdealerProgram = value);

        // Update service ID when service name changes
        this.conversionServiceForm.get('serviceName').valueChanges.subscribe((input) => {
            this.conversionServiceForm.markAllAsTouched();
            this.conversionServiceForm.markAsDirty();
            if (input) {
                this.conversionServiceForm.get('serviceId').patchValue(this.generateServiceId(input));
            } else {
                this.conversionServiceForm.get('serviceId').patchValue('');
            }
        });        
    }

    initializeForms(): void {

        // Manage Conversion Form
        this.manageConversionForm = this._formBuilder.group({
            channel: [''],
            expired: ['', [Validators.required, ValidationService.numberOnlyValidator]],
        });

        this.existServiceConversion = this.data?.serviceConversions || [];
        this.allConversionService = [
            ...this.existServiceConversion,
            ...this.newServiceConversion,
        ];

        if (this.newServiceConversion.length > 0) {
            this.newDisplayServices = this.newServiceConversion.map(service => {
                return {
                    ...service,
                    referralTiers: this.reverseTiers(service.referralTiers)
                };
            });
        }

        if (this.existServiceConversion.length > 0) {
             this.displayExistServices = this.existServiceConversion.map(service => {
                return {
                    ...service,
                    referralTiers: this.reverseTiers(service.referralTiers)
                };
            });
        }

        this.displayServices = [
            ...this.displayExistServices,
            ...this.newDisplayServices
        ]

        this._id = this.data?._id;

        // Conversion Service Form
        this.conversionServiceForm = this._formBuilder.group({
            serviceId: [{ value: '', disabled: true }],
            serviceName: ['', [Validators.required, ValidationService.serviceNameValidator]],
            referralProgram: [false],
            loyaltyProgram: [false],
            microdealerProgram: [false],
        });

        // Microdealer Service Form
        this.microdealerServiceForm = this._formBuilder.group({
            discountRate: [null]
        });

        // Referral Service Form
        this.referralServiceForm = this._formBuilder.group({
            referralTiers: this._formBuilder.array([this.createServiceFormGroup(1)]),
        });

        // Loyalty Service Form
        this.loyaltyServiceForm = this._formBuilder.group({ 
            loyaltyTiers: this._formBuilder.array([this.createLoyaltyFormGroup(1)]),
        });
    }

    get referralTiers(): FormArray {
        return this.referralServiceForm.get('referralTiers') as FormArray;
    }

    get loyaltyTiers(): FormArray {
        return this.loyaltyServiceForm.get('loyaltyTiers') as FormArray;
    }

    updateChannelValue(newValue: string): void {
        this.manageConversionForm.get('channel')?.setValue(newValue);
    }

    // Method to create a form group for a referral tier
    createServiceFormGroup(sequence: number): FormGroup {
        const formGroup = this._formBuilder.group({
            orderSequence: [
                { value: sequence, disabled: true },
                Validators.required,
            ],
            percentage: [
                null, 
                [Validators.required, ValidationService.numberOnlyValidator]
            ],
            voucherCode: [
                null, 
                [Validators.required]
            ]
        });

        this.setupValueChangeSubscriptions(formGroup, 'referral');
    
        return formGroup;
    }

    // Method to create a form group for a loyalty tier
    createLoyaltyFormGroup(tier: number): FormGroup {
        const formGroup = this._formBuilder.group({
            tier: [
                { value: tier, disabled: true },
                Validators.required,
            ],
            rate: [
                null, 
                [Validators.required, ValidationService.numberOnlyValidator]
            ],
            voucherCode: [
                null, 
                [Validators.required]
            ]
        });

        this.setupValueChangeSubscriptions(formGroup, 'loyalty');
    
        return formGroup;
    }

    setupValueChangeSubscriptions(formGroup: FormGroup, type: string): void {
        let isProcessing = false;
    
        if (type === 'loyalty') {
            formGroup.get('rate').valueChanges.subscribe(value => {
                if (isProcessing) return;
                isProcessing = true;
                if (value) {
                    formGroup.get('voucherCode').setValue('');
                    formGroup.get('voucherCode').disable();
                } else {
                    formGroup.get('voucherCode').enable();
                }
                isProcessing = false;
            });
    
            formGroup.get('voucherCode').valueChanges.subscribe(value => {
                if (isProcessing) return;
                isProcessing = true;
                if (value) {
                    formGroup.get('rate').setValue(0);
                    formGroup.get('rate').disable();
                } else {
                    formGroup.get('rate').enable();
                }
                isProcessing = false;
            });
        } else {
            formGroup.get('percentage').valueChanges.subscribe(value => {
                if (isProcessing) return;
                isProcessing = true;
                if (value) {
                    formGroup.get('voucherCode').setValue('');
                    formGroup.get('voucherCode').disable();
                } else {
                    formGroup.get('voucherCode').enable();
                }
                isProcessing = false;
            });
    
            formGroup.get('voucherCode').valueChanges.subscribe(value => {
                if (isProcessing) return;
                isProcessing = true;
                if (value) {
                    formGroup.get('percentage').setValue(0);
                    formGroup.get('percentage').disable();
                } else {
                    formGroup.get('percentage').enable();
                }
                isProcessing = false;
            });
        }
    }    
    
    loadConversions(): void {
        this._loyaltyService.getAllConversions({})
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (conversions) => {
                    this.allConversion = conversions;
                },
                (error) => {
                    console.error('Error fetching conversions:', error);
                }
            );
    }

    manageService(conversion: Conversion) {
        this.data = conversion;
        this.manageConversionForm.get('channel').setValue(conversion.channel); // Set the channel value in the form control
        this.isChannelReadOnly = true;
        this.allConversionService = [...conversion.serviceConversions];
        this.manageServiceDialog = true;
        this.manageConversionForm.patchValue({
            expired: conversion.expiryDuration
        });
    }

    /* addService() {
        this.showAddServiceForm = !this.showAddServiceForm;
        this.isExpanded = !this.isExpanded;
    } */

    onAddNewRow() {
        if (!this.isServiceBeingAdded) {
            this.isServiceBeingAdded = true; // to disable the button
    
            this.allConversionService.push({
            serviceId: '',
            serviceName: '',
            microDealer: { discountRate: null },
            referralTiers: [
                {
                orderSequence: null,
                percentage: null,
                voucherCode: null,
                }
            ],
            loyaltyTiers: [{
                tier: null,
                rate: null,
                voucherCode: null,
            }],
            mergedRow: true
            });
        }
    }     

    trackByServiceId(index: number, service: any): string {
        return service.serviceId;
    }

    referralCheckbox(event: any): void {
        this.referralProgram = event.checked;

        if (this.referralProgram) {
            for (let i = 0; i < this.maxTiers; i++) {
                this.addReferralTier();
            }
        } else {
            for (let i = 0; i < this.maxTiers; i++) {
                this.removeReferralTier(i);
            }
            
            this.removeAllValidatorsAndMarkAsValid(this.referralServiceForm);
        } 
    }

    loyaltyCheckbox(event: any): void {
        this.loyaltyProgram = event.checked;

        if (this.loyaltyProgram) {
            for (let i = 0; i < this.maxTiers; i++) {
                this.addLoyaltyTier();
            }
        } else {
            for (let i = 0; i < this.maxTiers; i++) {
                this.removeLoyaltyTier(i);
            }
            
            this.removeAllValidatorsAndMarkAsValid(this.loyaltyServiceForm);
        }
    }

    microdealerCheckbox(event: any): void {
        this.microdealerProgram = event.checked;

        if (this.microdealerProgram) {
            this.microdealerServiceForm.markAsDirty();
            this.microdealerServiceForm.get('discountRate').setValidators([Validators.required, ValidationService.numberOnlyValidator]);
        } else {
            this.microdealerServiceForm.patchValue({
                discountRate: null
            });
            this.microdealerServiceForm.get('discountRate').clearValidators();
            this.microdealerServiceForm.get('discountRate').setErrors(null);
        }
    }

    addReferralTier(): void {
        if (this.referralTiers.length < this.maxTiers) {
            this.referralTiers.push(
                this.createServiceFormGroup(this.referralTiers.length + 1)
            );
        }
    }

    addLoyaltyTier(): void {
        if (this.loyaltyTiers.length < this.maxTiers) {
            this.loyaltyTiers.push(
                this.createLoyaltyFormGroup(this.loyaltyTiers.length + 1)
            );
        }
    }

    removeReferralTier(index: number): void {
        this.referralTiers.removeAt(index);
        this.updateOrderSequences();
    }

    removeLoyaltyTier(index: number): void {
        this.loyaltyTiers.removeAt(index);
        this.updateTierSequences();
    }

    updateOrderSequences(): void {
        this.referralTiers.controls.forEach((group, index) => {
            group.get('orderSequence').setValue(index + 1);
        });
    }

    updateTierSequences(): void {
        this.loyaltyTiers.controls.forEach((group, index) => {
            group.get('tier').setValue(index + 1);
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

    // Method to get the values of a form group including disabled controls
    getFormValuesWithDisabledControls(formGroup: FormGroup): any {
        let formValues = formGroup.getRawValue();
        Object.keys(formGroup.controls).forEach((key) => {
            if (formGroup.get(key) instanceof FormArray) {
                formValues[key] = this.getFormArrayValues(
                    formGroup.get(key) as FormArray
                );
            }
        });
        return formValues;
    }

    // Method to get the values of a form array including disabled controls
    getFormArrayValues(formArray: FormArray): any[] {
        return formArray.controls.map((control) =>
            this.getFormValuesWithDisabledControls(control as FormGroup)
        );
    }

    // Method to check if the sum of percentages is within the limit
    getPercentage(value: number) {
        return Math.round((value / 30) * 100);
    }

    reverseTiers(tiers: any) {
        if (tiers  && tiers.length > 0) {
            // Extract the percentage and voucherCode values
            const percentages = tiers.map(tier => tier.percentage);
            const voucherCodes = tiers.map(tier => tier.voucherCode);
        
            // Reverse the arrays
            const reversedPercentages = percentages.reverse();
            const reversedVoucherCodes = voucherCodes.reverse();
        
            // Assign the reversed values back to the tiers
            return tiers.map((tier, index) => ({
                ...tier,
                percentage: reversedPercentages[index],
                voucherCode: reversedVoucherCodes[index]
            }));
        } else {
            return [];
        }
    }

    // Method to update the percentage values
    updatePercentage() {
        const formValues = this.getFormValuesWithDisabledControls(this.referralServiceForm);
        let filteredForm: Tier[] = formValues.referralTiers.map((service: Tier) => {
            service.percentage = (service.percentage / 100) * 30;
            return service;
        }).filter(item => item.percentage !== 0 || item.voucherCode !== '')
          .filter(item => item.orderSequence !== null);
    
        this.updatedReferralValue = this.reverseTiers(filteredForm);
    }
    
    updateRate() {
        const formValues = this.getFormValuesWithDisabledControls(this.loyaltyServiceForm);
        let filteredForm: LoyaltyTier[] = formValues.loyaltyTiers.map((item: LoyaltyTier) => {
            if (item.voucherCode !== '') {
                item.rate = 0;
            }
            return item;
        }).filter(item => item.rate !== 0 || item.voucherCode !== '')
          .filter(item => item.tier !== null);
    
        this.updatedLoyaltyValue = filteredForm;
    }    

    save() {
        const body = {
            _id: this.data._id,
            channel: this.data.channel,
            expiryDuration: parseInt(this.manageConversionForm.value.expired),
            serviceConversions: this.allConversionService.length ? this.allConversionService : [],
            cashCoinsRate: this.data.cashCoinsRate,
        };

        console.log('ori',this.data);
        console.log('send be',body);
        
    
        // Call the service to update conversions
        this._loyaltyService.updateConversions(body._id, body).subscribe({
            next: () => {
                // Show success toast notification
                this.messageService.add({
                    severity: 'success',
                    summary: 'Channel\'s Conversion Setting Success',
                    detail: 'Conversion settings have been successfully updated.',
                    life: 3000
                });
            },
            error: (error) => {
                // Log error and show error toast notification
                console.error('Error updating conversion settings:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error Updating Conversion Settings',
                    detail: error.error?.message || 'An unexpected error occurred.',
                    life: 3000
                });
            },
        });
    }        

    submitBtn(): void {
        if (this.conversionServiceForm.valid) {
            const activeService = this.allConversionService.find(service => service.mergedRow);
    
            if (activeService) {
                // Get the form values
                const formValue = this.conversionServiceForm.value;
                formValue.serviceId = this.generateServiceId(formValue.serviceName);

                let body: any = {
                    serviceId: this.conversionServiceForm.get('serviceId').value,
                    serviceName: this.conversionServiceForm.get('serviceName').value,
                }

                console.log('referral: ',this.referralServiceForm.getRawValue())

                // Conditionally add fields if they have valid values
                const referral = this.referralServiceForm.getRawValue();
                const loyalty = this.loyaltyServiceForm.getRawValue();
                const microdealer = this.microdealerServiceForm.get('discountRate')?.value;

                console.log('referralTiers: ',referral.referralTiers.length)

                if (referral && referral.referralTiers.length > 0 && (referral.referralTiers.filter(tier => tier.percentage !== null).length > 0)) {
                    body.referralTiers = referral.referralTiers;
                }

                if (loyalty && loyalty.loyaltyTiers.length > 0 && (loyalty.loyaltyTiers.filter(tier => tier.rate !== null).length > 0)) {
                    body.loyaltyTiers = loyalty.loyaltyTiers;
                }

                if (microdealer && microdealer.length > 0) {
                    body.microDealer = microdealer;
                }
                
                // Remove empty or null entries from the existing services
                this.allConversionService = this.allConversionService.filter(service => 
                    service.serviceId !== '' || service.serviceId !== null
                );

                // Add or replace the active service
                const existingIndex = this.allConversionService.findIndex(service => service.mergedRow);
                if (existingIndex > -1) {
                    this.allConversionService[existingIndex] = body;
                } else {
                    this.allConversionService.push(body);
                }
    
                Object.assign(activeService, formValue);

                activeService.mergedRow = false;
            }

            this.conversionServiceForm.reset();
            this.isServiceBeingAdded = false; // Re-enable the button
        } else {
            console.error('Form is invalid');
        }  

        console.log('Final: ', this.allConversionService);
        
    }

    deleteBtn(serviceToDelete: any): void {
        console.log("Before deletion:", this.existServiceConversion, this.newServiceConversion, this.allConversionService, this.displayServices, this.newDisplayServices);
        
        this.existServiceConversion = this.existServiceConversion.filter(service => service !== serviceToDelete);
        this.newServiceConversion = this.newServiceConversion.filter(service => service !== serviceToDelete);
        this.allConversionService = this.allConversionService.filter(service => service !== serviceToDelete);
        this.displayServices = this.displayServices.filter(service => service !== serviceToDelete);
        this.newDisplayServices = this.newDisplayServices.filter(service => service !== serviceToDelete);
        
        console.log("After deletion:", this.existServiceConversion, this.newServiceConversion, this.allConversionService, this.displayServices, this.newDisplayServices);
    
        this.serviceChanges = true;
        this._changeDetectorRef.markForCheck();
    }  

    viewDetails(serviceId: number): void {
        if (this.expandedServiceId === serviceId) {
          this.expandedServiceId = null;
        } else {
          this.expandedServiceId = serviceId;
        }
    }   
    
    closeForm() {
        this.isServiceBeingAdded = false; // Hide the form
        if (this.allConversionService.length > 0) {
          this.allConversionService.pop(); // Remove the last row
        }
    }

    generateServiceId(serviceName: string): string {
        return serviceName.toLowerCase().replace(/\s+/g, '-');
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

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}