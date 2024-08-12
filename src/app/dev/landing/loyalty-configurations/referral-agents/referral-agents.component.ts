import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';
import { Pagination, ReferralUsers } from 'src/app/core/loyalty/loyalty.types';
import { Message, MessageService } from 'primeng/api';

@Component({
    templateUrl: './referral-agents.component.html',
    providers: [MessageService]
})
export class AppointReferralAgentComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    ColumnUsers = ['name','phone', 'email','channel','referralCode','actions'];
    referralUsers: ReferralUsers[] = [];
    transformedUsers: any[] = [];
    messages: Message[] = [];
    isLoading = false;
    addNewDialog: boolean = false;
    isModified: boolean = false;
    deleteUserDialog: boolean = false;
    filterForm: FormGroup;
    setupForm: FormGroup;
    pagination: Pagination;
    selectedChannel: string = 'ALL';
    channels: { label: string, value: string }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'E-Kedai', value: 'e-kedai' },
        { label: 'Hello Sim', value: 'hello-sim' }
    ];
    

    constructor(
        private _loyaltyService: LoyaltyService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {

        // Create the form
        this.filterForm = this._formBuilder.group({channel: ['ALL']});

        // Setup Form
        this.setupForm = this._formBuilder.group({
            phone: ['', Validators.required],
            referralCode: ['', Validators.required],
            channel: ['', Validators.required]
        }); 

        this.isLoading = true;
        this._loyaltyService.getReferralUsers({ channel: 'ALL', page: 1, pageSize: 10 }).subscribe(
          (response) => {
            // console.log('API Response:', response);
            this.referralUsers = response.context.records || [];
            this.transformedUsers = this.referralChannel(this.referralUsers);
            // console.log('Transformed Users:', this.transformedUsers);
            this.isLoading = false;
          },
          (error) => {
            console.error('Error fetching Referral User list:', error);
            this.isLoading = false;
          }
        );

        // Get Pagination
        this._loyaltyService.referralUsersPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: Pagination) => {
                if (pagination) {
                    this.pagination = pagination;
                }
                this._changeDetectorRef.markForCheck();
            });

        this.filterForm.get('channel').valueChanges.subscribe(
            (value) => {
                if (value) {
                    this.selectedChannel = value;
                    this.loadUsers({ first: 0, rows: this.pagination.size });
                }
            }
        );
    }

    loadUsers(event: any) {
        const page = event.first / event.rows + 1;
        const pageSize = event.rows;

        let params = {
            page: page,
            pageSize: pageSize,
            channel: 'ALL'
        };

        this._loyaltyService.getReferralUsers(params).subscribe();
    }

    referralChannel(users: ReferralUsers[]): any[] {
        let transformed = users.flatMap(user => {
            if (!user.referral || !Array.isArray(user.referral)) {
            console.warn('Referral data missing or invalid for user:', user);
            return [];
            }
            return user.referral.map(referral => ({
            name: user.name,
            phone: user.phone,
            email: user.email,
            channel: referral.channel,
            referralCode: referral.referralCode,
            referralCount: referral.referralCount,
            }));
        });
        
        console.log('Transformed Data:', transformed);
        transformed = transformed.filter(user => user.referralCode !== '');
        console.log('Filtered Transformed Data:', transformed);
        return transformed;
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

    addNew() {
        // this.setupForm.reset();
        this.addNewDialog = true;
    }

    checkPhoneNumber(phone: string): string {
        if (!phone.startsWith('6')) {
            phone = '6' + phone;
        }
        return phone;
    }

    submit() {
        const phone = this.checkPhoneNumber(this.setupForm.get('phone').value);
        const referralCode = this.setupForm.get('referralCode').value;
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

    deleteBtn(phoneNumber: string, channelName: string) {
        console.log('Phone Number', phoneNumber);
        console.log('Channel Name', channelName);
    }

    showSuccessViaToast() {
        this.messageService.add({ key: 'tost', severity: 'success', summary: 'Success', detail: 'Message sent' });
    }
    
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
