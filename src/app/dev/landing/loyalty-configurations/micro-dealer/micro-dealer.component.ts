import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';
import { MicrodealerChannel, MicrodealerDetails } from 'src/app/core/loyalty/loyalty.types';
import { Message, MessageService } from 'primeng/api';

@Component({
    templateUrl: './micro-dealer.component.html',
    providers: [MessageService]
})
export class MicroDealerComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    topEarnerColumns: String[] = ['name', 'phone', 'email', 'channel', 'status', 'actions'];
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
    channels: { label: string, value: string }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'E-Kedai', value: 'e-kedai' },
        { label: 'Hello Sim', value: 'hello-sim' }
    ];
    status: { label: string, value: string }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' }
    ];

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
                id: dealer.id,
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
    addNew() {
        this.setupForm.reset();
        this.addNewDialog = true;
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

    showSuccessViaToast() {
        this.messageService.add({ key: 'tost', severity: 'success', summary: 'Success', detail: 'Message sent' });
    }

    ngOnDestroy() {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
