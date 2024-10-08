import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';
import { LoyaltyConfig } from 'src/app/core/loyalty/loyalty.types';
import { ValidationService } from 'src/app/core/validation/validation.service';
import { trigger, style, transition, animate } from '@angular/animations';
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

    /* addNew() {
        this.setupForm.reset();
        this.setDefaultValues(); // Reset to default values when adding a new entry
        this.addNewDialog = true;
    } */

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

    /* save(): void {
        if (this.setupForm.invalid) {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please complete all required fields.' });
            return;
        }
    
        const selectedChannels = [];
        if (this.setupForm.value.eKedai) selectedChannels.push('e-kedai');
        if (this.setupForm.value.helloSim) selectedChannels.push('hello-sim');
    
        const type = selectedChannels.length > 1 ? 'unique' : 'basic';
    
        (this.setupForm.get('loyaltySetup') as FormArray).controls.forEach(group => {
            const groupForm = group as FormGroup;
            if (!groupForm.contains('type')) {
                groupForm.addControl('type', this._formBuilder.control(type));
            } else {
                groupForm.get('type').setValue(type);
            }
        });
    
        const body: any = {
            channels: selectedChannels,
            loyaltySetup: this.setupForm.getRawValue().loyaltySetup
        };
    
        // Check if loyaltyTierDetails is defined
        if (this.editMode && (!this.loyaltyTierDetails || !this.loyaltyTierDetails._id)) {
            console.error('LoyaltyTierDetails is not defined or missing _id.');
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'LoyaltyTierDetails is missing. Cannot save changes.' });
            return;
        }
    
        const saveOperation = this.editMode ? 
            this._loyaltyService.editLoyaltyConfig(this.loyaltyTierDetails._id, body) :
            this._loyaltyService.setLoyaltyConfig(body);
    
        saveOperation.subscribe(
            (data) => {
                const successMessage = this.editMode ? 'Loyalty Config updated successfully' : 'Loyalty Config created successfully';
                this.messageService.add({ severity: 'success', summary: 'Success', detail: successMessage });
                this.confirmationService.confirm({
                    message: `You have successfully ${this.editMode ? 'updated' : 'created'} the configuration.`,
                    accept: () => {
                        this.addNewDialog = false;
                        this.editMode = false; // Reset edit mode after successful save
                        this._loyaltyService.getLoyaltyConfig({ page: 1, pageSize: 10 }).subscribe(); // Refresh data
                    }
                });
            },
            (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
            }
        );
    } */

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
        
    /* edit(loyaltyConfig: LoyaltyConfig): void {
        // Set edit mode to true
        this.editMode = true;
    
        // Populate the form with selected configuration data
        const loyaltySetupArray = this.setupForm.get('loyaltySetup') as FormArray;
        loyaltySetupArray.clear(); // Clear existing form array controls
    
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
    
        // Set selected channels in the form
        this.setupForm.patchValue({
            eKedai: loyaltyConfig.channels.includes('e-kedai'),
            helloSim: loyaltyConfig.channels.includes('hello-sim')
        });
    
        // Disable fields based on the tier after populating the form
        this.disableFields();
    
        // Show the dialog for editing
        this.addNewDialog = true;
    } */   
    
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}

/* save(): void {
        if (this.setupForm.invalid) {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please complete all required fields.' });
            return;
        }
    
        const selectedChannels = [];
        if (this.setupForm.value.eKedai) selectedChannels.push('e-kedai');
        if (this.setupForm.value.helloSim) selectedChannels.push('hello-sim');
    
        const type = selectedChannels.length > 1 ? 'unique' : 'basic';
    
        (this.setupForm.get('loyaltySetup') as FormArray).controls.forEach(group => {
            const groupForm = group as FormGroup;
            if (!groupForm.contains('type')) {
                groupForm.addControl('type', this._formBuilder.control(type));
            } else {
                groupForm.get('type').setValue(type);
            }
        });
    
        const body: any = {
            channels: selectedChannels,
            loyaltySetup: this.setupForm.getRawValue().loyaltySetup
        };
    
        const saveOperation = this.editMode ? 
            this._loyaltyService.editLoyaltyConfig(this.loyaltyTierDetails._id, body) :
            this._loyaltyService.setLoyaltyConfig(body);
    
        saveOperation.subscribe(
            (data) => {
                const successMessage = this.editMode ? 'Loyalty Config updated successfully' : 'Loyalty Config created successfully';
                this.messageService.add({ severity: 'success', summary: 'Success', detail: successMessage });
                this.confirmationService.confirm({
                    message: `You have successfully ${this.editMode ? 'updated' : 'created'} the configuration.`,
                    accept: () => {
                        this.addNewDialog = false;
                        this.editMode = false; // Reset edit mode after successful save
                        this._loyaltyService.getLoyaltyConfig({ page: 1, pageSize: 10 }).subscribe(); // Refresh data
                    }
                });
            },
            (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
            }
        );
    }  */   

/* save(): void {
        // Ensure the form is valid before proceeding
        if (this.setupForm.invalid) {
            this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please complete all required fields.' });
            return;
        }
    
        // Get selected channels based on the form values
        const selectedChannels = [];
        if (this.setupForm.value.eKedai) {
            selectedChannels.push('e-kedai');
        }
        if (this.setupForm.value.helloSim) {
            selectedChannels.push('hello-sim');
        }
    
        // Determine the type based on the number of selected channels
        const type = selectedChannels.length > 1 ? 'unique' : 'basic';
    
        // Add or update the type field in each loyalty setup group
        (this.setupForm.get('loyaltySetup') as FormArray).controls.forEach(group => {
            const groupForm = group as FormGroup; // Cast to FormGroup
            if (!groupForm.contains('type')) {
                groupForm.addControl('type', this._formBuilder.control(type));
            } else {
                groupForm.get('type').setValue(type);
            }
        });
    
        // Prepare the body for the API request
        const body: any = {
            channels: selectedChannels,
            loyaltySetup: this.setupForm.getRawValue().loyaltySetup
        };
    
        // Determine if we're editing or adding new
        const saveOperation = this.editMode ? this._loyaltyService.editLoyaltyConfig(this.loyaltyTierDetails._id, body) :
            this._loyaltyService.setLoyaltyConfig(body);
    
        saveOperation.subscribe(
            (data) => {
                const successMessage = this.editMode ? 'Loyalty Config updated successfully' : 'Loyalty Config created successfully';
                this.messageService.add({ severity: 'success', summary: 'Success', detail: successMessage });
                this.confirmationService.confirm({
                    message: `You have successfully ${this.editMode ? 'updated' : 'created'} the configuration.`,
                    accept: () => {
                        this.addNewDialog = false;
                        this._loyaltyService.getLoyaltyConfig({ page: 1, pageSize: 10 }).subscribe(); // Refresh data
                    }
                });
            },
            (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
            }
        );
    } */

/* edit(loyaltyConfig: LoyaltyConfig, index: number): void {
        this.editMode = true; // Set the component to edit mode
        this.loyaltyTierDetails = loyaltyConfig; // Store the selected loyalty configuration details
        this.addNewDialog = true; // Open the dialog for editing
    
        // Reset the form and set values to match the selected loyalty configuration
        this.setupForm.reset();
        this.setupForm.patchValue({
            eKedai: loyaltyConfig.channels.includes('e-kedai'),
            helloSim: loyaltyConfig.channels.includes('hello-sim')
        });
    
        // Populate the form array for loyalty setup
        const loyaltySetupControls = this.setupForm.get('loyaltySetup') as FormArray;
        loyaltySetupControls.clear(); // Clear existing form array
    
        // Populate the form array with the selected loyalty configuration details
        loyaltyConfig.loyaltySetup.forEach((setup) => {
            loyaltySetupControls.push(this._formBuilder.group({
                tier: [setup.tier, Validators.required],
                target: [setup.target, [Validators.required, ValidationService.numberOnlyValidator]],
                timeFrame: [setup.timeFrame, [Validators.required, ValidationService.numberOnlyValidator]],
                type: [setup.type]
            }));
        });
    
        this.cdr.markForCheck(); // Mark for change detection to update the view
    } */ 