import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommunicationService } from 'src/app/core/communication/communication.service';
import { NotificationConfig } from 'src/app/core/communication/communication.types';
import { Message, MessageService } from 'primeng/api';
import { ValidationService } from 'src/app/core/validation/validation.service';

@Component({
    templateUrl: './notification-config.component.html',
    providers: [MessageService],
    styles: [
        `
        .p-badge-success {
          background-color: #28a745 !important;
          color: white !important;
        }
        .p-badge-danger {
          background-color: #dc3545 !important;
          color: white !important;
        }
        `
      ]
})
export class NotificationConfigComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    notificationConfig: NotificationConfig[] = [];
    data: NotificationConfig;
    isLoading = false;
    addNewDialog: boolean = false;
    isModified: boolean = false;
    configForm: FormGroup;
    rewardForm: FormGroup;
    imageUrl: string | null = null;
    uploadedFile: File | null = null;
    rewardStatus: string = 'OFF';
    showRewardsSettings = false;
    isOn: boolean = false;
    tooltipMessage: string = '';
    isThresholdVisible: boolean = false;
    includeRewards: boolean = false;
    types: { label: string, value: string }[] = [
        { label: 'Upgrade Reached', value: 'UPGRADE_REACHED' },
        { label: 'Downgrade Reached', value: 'DOWNGRADE_REACHED' },
        { label: 'Upgrade Threshold', value: 'UPGRADE_THRESHOLD' },
        { label: 'Period End Reminder', value: 'PERIODENDREMINDER_THRESHOLD' },
        { label: 'Coins Earned', value: 'COINS_EARNED' },
        { label: 'Birthday', value: 'BIRTHDAY' }
    ];
    rewardType: { label: string, value: string }[] = [
        { label: 'Coins', value: 'COINS' },
        /* { label: 'Voucher', value: 'VOUCHER' } */
    ];

    constructor(
        private _communicationService: CommunicationService,
        private cdr: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private messageService: MessageService,
    ) {}

    ngOnInit(): void {
        // Initialize forms
        this.initializeForms();

        // fetch data from the service
        this.isLoading = true;
        this._communicationService.getNotificationConfig()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (list) => {
                    this.notificationConfig = list;
                    this.cdr.detectChanges();
                },
                (error) => {
                    console.error('Error fetching notification config list: ', error);
                }
            );
        
        this.showRewardsSettings = this.rewardForm.get('includeRewards')?.value;
        
        // Watch for changes to the 'type' form control to toggle the visibility of the threshold field
        this.configForm.get('type')?.valueChanges.subscribe((value: string) => {
            const isThresholdFieldRequired = value === 'UPGRADE_THRESHOLD' || value === 'PERIODENDREMINDER_THRESHOLD';
            this.isThresholdVisible = isThresholdFieldRequired;
            const thresholdControl = this.configForm.get('threshold');
            if (isThresholdFieldRequired) {
                thresholdControl?.setValidators([Validators.required, ValidationService.numberOnlyValidator]);
            } else {
                thresholdControl?.clearValidators();
                thresholdControl?.setValue(0);
            }
            thresholdControl?.updateValueAndValidity();
        });
        
    }
        
    initializeForms() {
        // Initialize configForm
        this.configForm = this._formBuilder.group({
            imageUrl: [''],
            type: ['', Validators.required],
            channel: [{ value: 'e-kedai', disabled: true }, Validators.required],
            title: [ null , Validators.required],
            description: [ null, Validators.required],
            content: ['', Validators.required],
            threshold: [0, [Validators.required, ValidationService.numberOnlyValidator]],
        });

        // Initialize rewardForm
        this.rewardForm = this._formBuilder.group({
            description: [''],
            rewardType: ['', Validators.required],
            rewards: ['', Validators.required],
            days: [{ value: 0, disabled: false }, [Validators.required, ValidationService.numberOnlyValidator]],
            includeRewards: [false]
        });
    }
    
    addNew(){
        this.configForm.reset();
        this.addNewDialog = true;
    }

    onImageChange(event: any): void {
        // Check if the event contains files
        const file = event.files && event.files[0];
        
        if (file) {
            // File type validation
            const validTypes = ['image/jpeg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                console.error('Unsupported file type');
                return;
            }
    
            // File size validation (e.g., max 2MB)
            const maxSize = 2 * 1024 * 1024;
            if (file.size > maxSize) {
                console.error('File size exceeds 2MB');
                return;
            }
    
            const reader = new FileReader();
            reader.onload = (e) => {
                this.imageUrl = e.target?.result as string;
            };
            reader.onerror = () => {
                console.error('Failed to load image');
                this.imageUrl = 'assets/images/default-placeholder.jpg';
            };
            reader.readAsDataURL(file);
    
            // Save the file
            this.uploadedFile = file;
        }
    }

    updateRewardStatus(): void {
        // Determine the status based on the checkbox and whether rewards are included
        this.rewardStatus = this.showRewardsSettings ? 'ON' : 'OFF';
    
        if (this.rewardStatus === 'OFF') {
            this.rewardForm.get('includeRewards')?.setValue(false);
            // Reset values to null or 0 when rewards are turned off
            this.rewardForm.get('days')?.setValue(0);
            this.rewardForm.get('rewards')?.setValue(null);
            this.rewardForm.get('description')?.setValue(null);
            this.rewardForm.get('rewardType')?.setValue(null);
            this.showRewardsSettings = false;
        }
    }

    getNotificationTitle(): string {
        const title = this.configForm.get('title')?.value;
        return title === null || title === '' ? 'Enter the notification title' : title;
    }

    getNotificationBody(): string {
        const description = this.configForm.get('description')?.value;
        return description === null || description === '' ? 'Enter the notification body' : description;
    }

    onMouseOver(event: MouseEvent): void {
        (event.target as HTMLElement).style.color = 'var(--primary-color)';
    }
    
    onMouseOut(event: MouseEvent): void {
        (event.target as HTMLElement).style.color = '';
    } 
    
    // Enable/disable threshold field
    handleThresholdField(selectedType: string): void {
        this.isThresholdVisible = selectedType === 'UPGRADE_THRESHOLD' || selectedType === 'PERIODENDREMINDER_THRESHOLD';
        if (!this.isThresholdVisible) {
            this.configForm.get('threshold')?.setValue(0);
        }

        // Set the tooltip message based on the selected type
        if (selectedType === 'UPGRADE_THRESHOLD') {
            this.tooltipMessage = 'At what percentage of current spending the notification will trigger?';
        } else if (selectedType === 'PERIODENDREMINDER_THRESHOLD') {
            this.tooltipMessage = 'Total of remaining days before the period end';
        } else {
            this.tooltipMessage = '';
        }
    }

    submit(): void {
        const rewardBody = this.showRewardsSettings
            ? {
                status: this.rewardStatus,
                description: this.rewardForm.value.description,
                rewardType: this.rewardForm.value.rewardType,
                rewards: this.rewardForm.value.rewards,
                days: this.rewardStatus === 'ON' ? +this.rewardForm.value.days : 0
            }
            : { status: 'OFF', description: null, rewardType: null, rewards: null, days: 0 };

        const notificationConfig = {
            _id: this.data?._id ?? '',
            channel: this.configForm.value.channel,
            type: this.configForm.value.type,
            threshold: this.configForm.value.threshold || 0,
            status: this.isOn ? 'ON' : 'OFF',
            title: this.configForm.value.title,
            body: this.configForm.value.content,
            description: this.configForm.value.description,
            reward: JSON.stringify(rewardBody),
            file: this.uploadedFile
        };

        this._communicationService.setNotificationConfig(notificationConfig).subscribe({
            next: (response) => {
                this.messageService.add({ severity: 'success', summary: 'Notification Saved', detail: 'Your notification configuration has been saved.' });
                this.addNewDialog = false;
            },
            error: (err) => {
                console.error('Error saving notification configuration', err);
                this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: 'Could not save the notification configuration.' });
            }
        });
    }
    
    isFormValid(): boolean {
        return this.showRewardsSettings ? this.configForm.valid && this.rewardForm.valid : this.configForm.valid;
    }

    editConfig(): void {
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
