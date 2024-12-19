import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { CommunicationService } from 'src/app/core/communication/communication.service';
import { AddCampaignNotification, CampaignNotification } from 'src/app/core/communication/communication.types';
import { DateTime } from 'luxon';
import { DatePipe } from '@angular/common';

@Component({
    templateUrl: './broadcast-settings.component.html',
    providers: [MessageService, DatePipe]
})
export class BroadcastSettingsComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    broadcastNotification: CampaignNotification[] = [];
    broadcastForm: FormGroup;
    rewardForm: FormGroup;
    isLoading = false;
    imageUrl: string | null = null;
    uploadedFile: File | null = null;
    rewardStatus: string = 'OFF';
    showRewardsSettings = false;
    activeTabIndex: number = 0;
    addNewDialog: boolean = false;
    editMode: boolean = false;
    rewardType: { label: string, value: string }[] = [
        { label: 'Coins', value: 'COINS' },
        /* { label: 'Voucher', value: 'VOUCHER' } */
    ];       
    
    constructor(
        private _formBuilder: FormBuilder,
        private _communicationService: CommunicationService,
        private messageService: MessageService,
        private datePipe: DatePipe
    ) {}

    ngOnInit(): void {
        this.isLoading = true;
    
        this.initializeForms();
    
        // Fetch notifications
        this._communicationService.getBroadcastNotification({ channel: 'e-kedai' })
        .subscribe({
            next: (notifications) => {
                this.broadcastNotification = notifications.map(broadcast => ({
                    ...broadcast,
                    notificationDateTime: broadcast.notificationDateTime
                        ? new Date(broadcast.notificationDateTime) // Convert to Date object
                        : null,
                }));
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to fetch notifications:', err);
                this.isLoading = false;
            },
        });
    
        // Subscribe to changes in the includeRewards checkbox
        this.rewardForm.get('includeRewards')?.valueChanges.subscribe((value) => {
            this.showRewardsSettings = value; // Controls visibility in template
    
            if (value) {
                // Add validators when rewards are included
                this.rewardForm.get('rewardType')?.setValidators(Validators.required);
                this.rewardForm.get('rewards')?.setValidators(Validators.required);
            } else {
                // Clear validators when rewards are excluded
                this.rewardForm.get('rewardType')?.clearValidators();
                this.rewardForm.get('rewards')?.clearValidators();
            }
            // Update validity status and propagate changes
            this.rewardForm.get('rewardType')?.updateValueAndValidity();
            this.rewardForm.get('rewards')?.updateValueAndValidity();
        });
    }    
    
    initializeForms() {
        // broadcastForm
         this.broadcastForm = this._formBuilder.group({
             title: ['', Validators.required],
             description: ['', Validators.required],
             body: ['', Validators.required], // It is a content
             sendMethod: ['IMMEDIATE', Validators.required],
             imageUrl: [''],
             notificationDate: [null, Validators.required],
             notificationTime: [null, Validators.required],
             status: ['PENDING']
         });

         this.broadcastForm.get('sendMethod')?.valueChanges.subscribe((sendMethod) => {
            if (sendMethod === 'SCHEDULED') {
                this.broadcastForm.get('notificationDate')?.setValidators(Validators.required);
                this.broadcastForm.get('notificationTime')?.setValidators(Validators.required);
            } else {
                this.broadcastForm.get('notificationDate')?.clearValidators();
                this.broadcastForm.get('notificationTime')?.clearValidators();
            }
            this.broadcastForm.get('notificationDate')?.updateValueAndValidity();
            this.broadcastForm.get('notificationTime')?.updateValueAndValidity();
         });
        
        // rewardForm
        this.rewardForm = this._formBuilder.group({
            status: 'OFF',
            description: [''],
            rewardType: ['', Validators.required],
            rewards: ['', Validators.required],
            days: 0,
            includeRewards: [false]
        });
    }

    updateRewardStatus(): void {
        this.rewardStatus = this.showRewardsSettings ? 'ON' : 'OFF';
    
        if (this.rewardStatus === 'OFF') {
            // Reset fields when rewards are turned off
            this.rewardForm.reset({
                status: 'OFF',
                includeRewards: false,
                days: 0,
                rewards: null,
                description: null,
                rewardType: null,
            });
            this.showRewardsSettings = false;
        }
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

    getNotificationTitle(): string {
        const title = this.broadcastForm.get('title')?.value;
        return title === null || title === '' ? 'Enter the broadcast title' : title;
    }

    getNotificationBody(): string {
        const description = this.broadcastForm.get('description')?.value;
        return description === null || description === '' ? 'Enter the broadcast body' : description;
    }

    onMouseOver(event: MouseEvent): void {
        (event.target as HTMLElement).style.color = 'var(--primary-color)';
    }
    
    onMouseOut(event: MouseEvent): void {
        (event.target as HTMLElement).style.color = '';
    }

    submitBtn(): void {
        if (!this.isFormValid()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Please ensure all fields are filled out correctly.',
            });
            console.error('Form is invalid');
            return;
        }
    
        const sendMethod = this.broadcastForm.get('sendMethod')?.value;
    
        // Combine date and time if the method is 'SCHEDULED'
        let sendDate: Date | null = null;
        if (sendMethod === 'SCHEDULED') {
            sendDate = this.combineDateAndTime();
            if (!sendDate) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Validation Error',
                    detail: 'Please ensure the notification date and time are valid.',
                });
                return;
            }
        } else if (sendMethod === 'IMMEDIATE') {
            sendDate = new Date(); // Current date and time
        }
    
        const rewardBody = this.showRewardsSettings
            ? {
                  status: 'ON',
                  description: this.rewardForm.get('description')?.value || null,
                  rewardType: this.rewardForm.get('rewardType')?.value || null,
                  rewards: this.rewardForm.get('rewards')?.value || null,
                  days: parseInt(this.rewardForm.get('days')?.value, 10) || 0,
              }
            : {
                  status: 'OFF',
                  description: null,
                  rewardType: null,
                  rewards: null,
                  days: 0,
              };
    
        const campaignNotification: AddCampaignNotification = {
            channel: 'e-kedai',
            status: 'PENDING',
            sendMethod: sendMethod,
            title: this.broadcastForm.get('title')?.value,
            description: this.broadcastForm.get('description')?.value,
            body: this.broadcastForm.get('body')?.value,
            file: this.uploadedFile,
            reward: JSON.stringify(rewardBody),
            sendDate: sendDate ? sendDate : null, // Ensure sendDate is correctly set
        };
    
        // Convert the object to FormData
        const formData = new FormData();
        formData.append('channel', campaignNotification.channel);
        formData.append('status', campaignNotification.status);
        formData.append('sendMethod', campaignNotification.sendMethod);
        formData.append('title', campaignNotification.title);
        formData.append('description', campaignNotification.description);
        formData.append('body', campaignNotification.body);
        if (campaignNotification.file) {
            formData.append('file', campaignNotification.file);
        }
        formData.append('reward', campaignNotification.reward);
        if (campaignNotification.sendDate) {
            formData.append('sendDate', campaignNotification.sendDate.toISOString());
        }
    
        this._communicationService.setBroadcastNotification(formData).subscribe({
            next: (response) => {
                if (response.code === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Broadcast notification added successfully.',
                    });
                    this.broadcastForm.reset();
                    this.rewardForm.reset();
                    this.uploadedFile = null;
                    this.imageUrl = null;
                    this.showRewardsSettings = false;
                }
            },
            error: (error) => {
                console.error('Error adding broadcast notification:', error);
            },
        });
    }         
    
    /* combineDateAndTime(): Date | null {
        const notificationDate = this.broadcastForm.value.notificationDate;
        const notificationTime = this.broadcastForm.value.notificationTime;
    
        if (!notificationDate || !notificationTime) {
            return null;
        }
    
        const date = new Date(notificationDate); // Ensure this is a Date object.
        const [hours, minutes] = notificationTime.split(':').map(Number);
    
        date.setHours(hours, minutes); // Combine the date and time directly.
    
        return date; // Return the combined Date object.
    } */ 
   
    combineDateAndTime(): Date | null {
        const notificationDate = this.broadcastForm.get('notificationDate')?.value;
        const notificationTime = this.broadcastForm.get('notificationTime')?.value;
    
        // Log the types and values for debugging
        console.log('Type of Notification Date:', typeof notificationDate, notificationDate);
        console.log('Type of Notification Time:', typeof notificationTime, notificationTime);
    
        // Handle different types of inputs
        const dateStr = notificationDate instanceof Date 
            ? notificationDate.toISOString().split('T')[0]  // Format Date to YYYY-MM-DD
            : notificationDate;
    
        const timeStr = notificationTime instanceof Date
            ? notificationTime.toISOString().split('T')[1]?.substr(0, 8) // Format Time to HH:mm:ss
            : notificationTime;
    
        // Check if values are valid
        if (!dateStr || !timeStr || typeof dateStr !== 'string' || typeof timeStr !== 'string') {
            console.error('Notification date or time is invalid.');
            return null;
        }
    
        try {
            // Combine the date and time
            const combinedDateTime = new Date(`${dateStr}T${timeStr}`);
            
            // Validate the combined date and time
            if (isNaN(combinedDateTime.getTime())) {
                console.error('Combined date and time are invalid.');
                return null;
            }
    
            return combinedDateTime;
        } catch (error) {
            console.error('Error combining date and time:', error);
            return null;
        }
    }
    
    formatDate(date: string | Date): string {
        return this.datePipe.transform(date, 'MMM d, yyyy h:mm a') || '';
    }

    isFormValid(): boolean {
        return this.showRewardsSettings ? this.broadcastForm.valid && this.rewardForm.valid : this.broadcastForm.valid;
    }

    onEditBroadcast(broadcastNotification: CampaignNotification): void {
        this.editMode = true; // Enable edit mode
        this.addNewDialog = true; // Show the dialog for editing
    
        const sendDateTime = broadcastNotification.sendDate 
            ? new Date(broadcastNotification.sendDate) 
            : null;
    
        const sendTime = sendDateTime 
            ? DateTime.fromJSDate(sendDateTime).toFormat('hh:mm a') 
            : null;
    
        // Patch the broadcast notification values into the broadcast form
        this.broadcastForm.patchValue({
            title: broadcastNotification.title || '',
            description: broadcastNotification.description || '',
            body: broadcastNotification.body || '',
            sendMethod: broadcastNotification.sendMethod || 'IMMEDIATE',
            imageUrl: broadcastNotification.imageId || null,
            notificationDate: sendDateTime ? sendDateTime : null,
            notificationTime: sendTime,
            status: broadcastNotification.status || 'PENDING',
        });
    
        // Handle rewards data
        const rewardsData = broadcastNotification.rewards;
    
        if (rewardsData) {
            // Patch the rewards data into the reward form
            this.rewardForm.patchValue({
                status: rewardsData.status || 'OFF',
                description: rewardsData.description || '',
                rewardType: rewardsData.rewardType || '',
                rewards: rewardsData.rewards || '',
                days: rewardsData.days || 0,
                includeRewards: rewardsData.status === 'ON',
            });
    
            this.showRewardsSettings = rewardsData.status === 'ON';
        } else {
            // Reset the reward form if no rewards data is provided
            this.rewardForm.reset({
                status: 'OFF',
                includeRewards: false,
                days: 0,
                rewards: null,
                description: null,
                rewardType: null,
            });
    
            this.showRewardsSettings = false;
        }
    }

    reset(): void {
        this.broadcastForm.reset();
        this.rewardForm.reset();
    }

    ngOnDestroy() {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
