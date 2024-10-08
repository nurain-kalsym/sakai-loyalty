import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Message, MessageService } from 'primeng/api';
import { debounceTime, distinctUntilChanged, Subject, switchMap, takeUntil } from 'rxjs';
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
    allServiceConversion: ServiceConversions[] = [];
    existServiceConversion: ServiceConversions[] = [];
    newServiceConversion: ServiceConversions[] = [];
    displayExistServices: ServiceConversions[] = [];
    displayServices: ServiceConversions[] = [];
    newDisplayServices: ServiceConversions[] = [];
    updatedReferralValue: Tier[] = [];
    updatedLoyaltyValue: LoyaltyTier[] = [];
    manageServiceDialog: boolean = false;
    loyaltyProgram: boolean = false;
    showAddServiceForm: boolean = false;
    sumPercentage: boolean = true;
    manageConversionForm: FormGroup;
    conversionServiceForm: FormGroup;
    referralServiceForm: FormGroup;
    loyaltyServiceForm: FormGroup;
    filterForm: FormGroup;
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
    hoveredIcons: { [key: string]: string } = {};
    filteredServiceConversion: ServiceConversions[] = [];
    notFound: boolean = false;
    openIndex: number = -1;
    referralTiers: Tier[] = [];
    editMode: boolean = false;

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

        // Subscribe to checkbox changes for loyalty programs
        this.conversionServiceForm.get('loyaltyProgram').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(value => this.loyaltyProgram = value);

        // Update service ID when service name changes
        this.conversionServiceForm.get('serviceName').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((input) => {
                this.conversionServiceForm.markAllAsTouched();
                this.conversionServiceForm.markAsDirty();

                if (input) {
                    this.conversionServiceForm.get('serviceId').patchValue(this.generateServiceId(input));
                } else {
                    this.conversionServiceForm.get('serviceId').patchValue('');
                }
            });

        // Subscribe to search form value changes and filter service conversions
        this.filterForm.get('search').valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                distinctUntilChanged(),
                switchMap((value) => {
                    this.openIndex = -1;
                    let searchText = value ? value.toLowerCase() : '';

                    // Filter the service conversions
                    this.filteredServiceConversion = this.allServiceConversion.filter(service => 
                        service.serviceName.toLowerCase().includes(searchText) ||
                        service.serviceId.toString().toLowerCase().includes(searchText)
                    );

                    this.notFound = this.filteredServiceConversion.length === 0;

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    return [this.filteredServiceConversion];
                })
            )
            .subscribe();

    }

    initializeForms(): void {
        // Manage Conversion Form
        this.manageConversionForm = this._formBuilder.group({
            channel: [''],
            expired: ['', [Validators.required, ValidationService.numberOnlyValidator]],
        });

        // Prepare existing and new service conversions
        this.existServiceConversion = this.data?.serviceConversions || [];
        this.allServiceConversion = [
            ...this.existServiceConversion,
            ...this.newServiceConversion,
        ];

        // Process new and existing service tiers
        if (this.newServiceConversion.length > 0) {
            this.newDisplayServices = this.newServiceConversion.map(service => ({
                ...service,
                referralTiers: service.referralTiers // No longer reversed
            }));
        }

        if (this.existServiceConversion.length > 0) {
            this.displayExistServices = this.existServiceConversion.map(service => ({
                ...service,
                referralTiers: service.referralTiers // No longer reversed
            }));
        }

        this.displayServices = [
            ...this.displayExistServices,
            ...this.newDisplayServices
        ];

        // Get ID from data
        this._id = this.data?._id;

        // Conversion Service Form
        this.conversionServiceForm = this._formBuilder.group({
            serviceId: [{ value: '', disabled: true }],
            serviceName: ['', [Validators.required, ValidationService.serviceNameValidator]],
            loyaltyProgram: [false],
        });        

        // Loyalty Service Form
        this.loyaltyServiceForm = this._formBuilder.group({
            loyaltyTiers: this._formBuilder.array([this.createLoyaltyFormGroup(1)]),
        });

        this.filterForm = this._formBuilder.group({
            search: [ null ]
        });
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
        return this._formBuilder.group({
          tier: [{ value: tier, disabled: true }, Validators.required],
          rate: [null, [Validators.required, ValidationService.numberOnlyValidator]],
          voucherCode: [null, [Validators.required]],
        });
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
        this.allServiceConversion = [...conversion.serviceConversions];
        this.manageServiceDialog = true;
        this.manageConversionForm.patchValue({
            expired: conversion.expiryDuration
        });
    }

    onAddNewRow() {
        if (!this.isServiceBeingAdded) {
            this.isServiceBeingAdded = true; // to disable the button

            this.allServiceConversion.push({
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
                    loyaltyRate: null,
                    voucherCode: null,
                }],
                mergedRow: true
            });
        }
    }  

    trackByServiceId(index: number, service: any): string {
        return service.serviceId;
    }
    
    loyaltyCheckbox(event: any) {
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

    // Method to add a new loyalty tier
    addLoyaltyTier(): void {
        if (this.loyaltyTiers.length < this.maxTiers) {
            this.loyaltyTiers.push(
                this.createLoyaltyFormGroup(this.loyaltyTiers.length + 1)
            );
        }
    }

    // Method to remove an existing loyalty tier
    removeLoyaltyTier(index: number): void {
        this.loyaltyTiers.removeAt(index);
        this.updateTierSequences();
    }

    // Method to update the sequence numbers of loyalty tiers
    updateTierSequences(): void {
        this.loyaltyTiers.controls.forEach((group, index) => {
            group.get('tier').setValue(index + 1);
        });
    }
    
    removeAllValidatorsAndMarkAsValid(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(controlName => {
            const control = formGroup.get(controlName);
            if (control instanceof FormGroup) {
                this.removeAllValidatorsAndMarkAsValid(control);
            } else {
                control.clearValidators();
                control.updateValueAndValidity();
            }
        });
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

    getPercentage() {
        const formValues = this.getFormValuesWithDisabledControls(
            this.loyaltyServiceForm
        );

        // Extract percentages and accumulate the total with checks
        const percentages = formValues.loyaltyTiers.map((item) => {
            const percentage = parseFloat(item.referralRate);
            return isNaN(percentage) ? 0 : percentage; // Ensure that invalid numbers are treated as 0
        });

        const sum = percentages.reduce((accumulator, currentValue) => {
            return accumulator + currentValue;
        }, 0);

        // Validate if the sum of percentages exceeds 100%
        if (sum > 100) {
            this.sumPercentage = false;
        } else {
            this.sumPercentage = true;
        }

        this._changeDetectorRef.markForCheck();
    }

    updateLoyaltyRate() {
        let loyaltyTiers = this.loyaltyServiceForm.get('loyaltyTiers').value;

        loyaltyTiers.forEach((tier, index) => {
            // Set the tier property to index + 1
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

    save() {
        const body = {
            _id: this.data._id,
            channel: this.data.channel,
            expiryDuration: parseInt(this.manageConversionForm.value.expired),
            serviceConversions: this.allServiceConversion.length ? this.allServiceConversion : [],
            // cashCoinsRate: this.data.cashCoinsRate,
        };

        console.log('ori',this.data);
        console.log('send be',body);
        
    
        // Call the service to update conversions
        this._loyaltyService.updateConversions(body._id, body).subscribe({
            next: () => {
                // Show success toast notification
                this.messageService.add({
                    key: 'toast',
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
                    key: 'toast',
                    severity: 'error',
                    summary: 'Error Updating Conversion Settings',
                    detail: error.error?.message || 'An unexpected error occurred.',
                    life: 3000
                });
            },
        });
    }        

    submitBtn(): void {
            if (this.editMode) {
                this.referralTiers = [];
            } 
            const loyalty = this.updateLoyaltyRate();
            const referral = this.referralTiers;
            const microdealer = {
                discountRate: this.microdealerServiceForm.get('discountRate').value
            }
    
            const service = {
                serviceName: this.conversionServiceForm.value.serviceName,
                serviceId: this.conversionServiceForm.value.serviceId
            };
    
            const combineData = {
                service,
                referral,
                loyalty,
                microdealer
            };
            
            this.loyaltyServiceForm.reset();
            this._changeDetectorRef.markForCheck();
    }

    edit(): void {}

    copyToClipboard(value: string) {
        const textArea = document.createElement('textarea');
        textArea.value = value;
        document.body.appendChild(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
            this.messageService.add({ 
                key: 'tost', 
                severity: 'success', 
                summary: 'success', 
                detail: 'Successfully copy text' 
            });
        } catch (err) {
            this.messageService.add({
                key: 'toast', 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Failed to copy text!'
            });
        }

        document.body.removeChild(textArea);
        this._changeDetectorRef.detectChanges();
    }    

    deleteBtn(serviceToDelete: any): void {
        console.log("Before deletion:", this.existServiceConversion, this.newServiceConversion, this.allServiceConversion, this.displayServices, this.newDisplayServices);
        
        this.existServiceConversion = this.existServiceConversion.filter(service => service !== serviceToDelete);
        this.newServiceConversion = this.newServiceConversion.filter(service => service !== serviceToDelete);
        this.allServiceConversion = this.allServiceConversion.filter(service => service !== serviceToDelete);
        this.displayServices = this.displayServices.filter(service => service !== serviceToDelete);
        this.newDisplayServices = this.newDisplayServices.filter(service => service !== serviceToDelete);
        
        console.log("After deletion:", this.existServiceConversion, this.newServiceConversion, this.allServiceConversion, this.displayServices, this.newDisplayServices);
    
        this.serviceChanges = true;
        this._changeDetectorRef.markForCheck();
        // this._changeDetectorRef.detectChanges();
    
        this.messageService.add({
            key: 'toast',
            severity: 'success',
            summary: 'Delete Success',
            detail: `Successfully deleted service: ${serviceToDelete}`
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

    toggleExpand(serviceId: number): void {
        if (this.expandedServiceId === serviceId) {
          this.expandedServiceId = null;
        } else {
          this.expandedServiceId = serviceId;
        }
    }
    
    closeForm() {
        this.isServiceBeingAdded = false; // Hide the form
        if (this.allServiceConversion.length > 0) {
          this.allServiceConversion.pop(); // Remove the last row
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

    clearSearch(): void {
        this.filterForm.get('search').setValue(null);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}