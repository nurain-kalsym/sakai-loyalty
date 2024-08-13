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
    userToDelete: any = null;
    filterForm: FormGroup;
    setupForm: FormGroup;
    pagination: Pagination;
    selectedChannel: string = 'ALL';
    channels: { label: string, value: string }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'E-Kedai', value: 'e-kedai' },
        { label: 'HelloSim', value: 'hello-sim' }
    ];

    constructor(
        private _loyaltyService: LoyaltyService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private messageService: MessageService,
    ) {}

    ngOnInit(): void {
        // Create the form
        this.filterForm = this._formBuilder.group({channel: ['ALL']});
    
        // Setup Form
        this.setupForm = this._formBuilder.group({
            phone: [null, Validators.required],
            referralCode: ['', Validators.required],
            channel: ['', Validators.required]
        }); 
    
        this.isLoading = true;
        this.loadUsers({ first: 0, rows: 10 });
    
        // Get Pagination
        this._loyaltyService.referralUsersPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: Pagination) => {
                if (pagination) {
                    this.pagination = pagination;
                }
                this._changeDetectorRef.markForCheck();
            });
    
        // Channel filter
        this.filterForm.get('channel').valueChanges.subscribe(value => {
            if (value) {
                this.selectedChannel = value;
                this.loadUsers({ first: 0, rows: this.pagination?.size });
            }
        });
    }
    
    loadUsers(event: any) {
        const page = event.first / event.rows + 1;
        const pageSize = event.rows;
    
        let params = {
            page: page,
            pageSize: pageSize,
            channel: this.selectedChannel
        };
    
        this._loyaltyService.getReferralUsers(params).subscribe(response => {
            this.referralUsers = response.context.records || [];
            this.transformedUsers = this.referralChannel(this.referralUsers);
            this.isLoading = false;
        }, error => {
            console.error('Error fetching Referral User list:', error);
            this.isLoading = false;
        });
    }    

    referralChannel(users: ReferralUsers[]): any[] {
        let transformed = users.flatMap(user => {
            if (!user.referral || !Array.isArray(user.referral)) {
                console.warn('Referral data missing or invalid for user:', user);
                return [];
            }

            return user.referral
                .filter(referral => this.selectedChannel === 'ALL' || referral.channel === this.selectedChannel)
                .map(referral => ({
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

    addNew() {
        this.setupForm.reset();
        this.addNewDialog = true;
    }

    submit() {
        if (this.setupForm.valid) {
            const phone = this.checkPhoneNumber(this.setupForm.get('phone').value);
            const referralCode = this.setupForm.get('referralCode').value;
            const channel = this.setupForm.get('channel').value;
    
            this._loyaltyService.setReferralUser(phone, referralCode, { channel }).subscribe(
                response => {
                    if (response.code === 200) {
                        console.log('Successfully added new referral agent:', response);
                        this.messageService.add({ 
                            key: 'tost', 
                            severity: 'success', 
                            summary: 'Success', 
                            detail: 'Successfully added new referral agent' 
                        });
                        this.addNewDialog = false;
                        this.isModified = false;
                        this.setupForm.reset();
                        this.loadUsers({ first: 0, rows: this.pagination?.size });
                    } else {
                        console.warn('Failed to add new referral agent:', response);
                        this.messageService.add({
                            key: 'tost',
                            severity: 'warn',
                            summary: 'Warning',
                            detail: response.message || 'Failed to add new referral agent'
                        });
                    }
                },
                error => {
                    console.error('Error adding new referral agent:', error);
                    this.messageService.add({ 
                        key: 'tost', 
                        severity: 'error', 
                        summary: 'Error', 
                        detail: error.error.message || 'An error occurred while adding the referral agent'
                    });
                }
            );
        }
    }
        

    deleteBtn(user: any) {
        this.userToDelete = user;
        this.deleteUserDialog = true;
    } 
    
    confirmDelete() {
    if (this.userToDelete) {
            const { phone, channel } = this.userToDelete;
            this._loyaltyService.removeAgentUser(phone, { channel })
            .subscribe(
                response => {
                    // Handle success
                    this.messageService.add({ key: 'tost', severity: 'success', summary: 'Success', detail: 'User deleted successfully' });
                    this.deleteUserDialog = false;
                    this.loadUsers({ first: 0, rows: this.pagination?.size || 10 });
                },
                error => {
                    // Handle error
                    this.messageService.add({ key: 'tost', severity: 'error', summary: 'Error', detail: 'Error deleting user' });
                }
            );
        }
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
    
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
