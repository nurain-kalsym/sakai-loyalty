import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';
import { MicrodealerChannel, MicrodealerDetails } from 'src/app/core/loyalty/loyalty.types';

@Component({
    templateUrl: './micro-dealer.component.html',
})
export class MicroDealerComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    topEarnerColumns: String[] = ['name', 'phone', 'email', 'channel', 'microdealer', 'actions'];
    allDealer: MicrodealerDetails[] = [];
    filteredMicrodealers: MicrodealerChannel[] = [];
    filterForm: FormGroup;
    setupForm: FormGroup;
    updateForm: FormGroup;
    selectedChannel: string = 'ALL';
    selectedStatus: string = 'ALL';
    isLoading = false;
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
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        // Create the form
        this.filterForm = this._formBuilder.group({
            channel: ['ALL'],
            status: ['ALL']
        });

        // Setup Form
        this.setupForm = this._formBuilder.group({
            phone: [null, Validators.required],
            channel: [null, Validators.required]
        });

        // Update Form
        this.updateForm = this._formBuilder.group({
            status: [null, Validators.required]
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
    

    addNew() {
        this.addNewDialog = true;
    }

    updateStatus() {
        this.updateStatusDialog = true;
    }

    /* Submit Button */
    submit() {
        console.log(this.setupForm.getRawValue());
    }

    /* Update Button */
    update() {
        console.log('Updated',this.updateForm.getRawValue());
    }

    formatChannel(channel: string): string {
        if (channel === 'hello-sim') {
            return channel.replace('-', ' ');
        } else {
            return channel;
        }
    }

    ngOnDestroy() {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
