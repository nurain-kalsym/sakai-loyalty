import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TreeNode } from 'primeng/api';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';
import { CoinsData, Members, Pagination } from 'src/app/core/loyalty/loyalty.types';

@Component({
    templateUrl: './member-listing.component.html',
    styles: [`
        .treeStyle {
            background-color: #740236;
            color: #ffffff;
            border-radius: 10px;
        }
        .custom-node {
            background-color: #262262;
            color: #ffffff;
            border-radius: 10px;
        }
        .p-node-toggler {
            display: flex;
            justify-content: center;
            background-color: #AD597F;
            pointer-events: none;
        }
        .p-organizationchart-line-left {
            border-right: 1px solid #BEBEBF;
        }
        .p-organizationchart-line-right {
            border-left: 1px solid #BEBEBF;
        }
        .p-organizationchart-line-top {
            border-top: 1px solid #BEBEBF;
        }
        .p-organizationchart-line-down {
            background-color: #BEBEBF;
        }
    `]
})
export class MemberListingComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    membersListingColumn: string[] = ['phoneNumber', 'name', 'email', 'referral', 'loyalty', 'microdealer', 'action'];
    allMembers: Members[] = [];
    isLoading = false;
    filterForm: FormGroup;
    summary: CoinsData[] = [];
    referralTree: TreeNode[] = [];
    summaryEkedai: any;
    summaryHelloSim: any;
    displayMessage: boolean = false;
    openIndex: number | null = null;
    showTree: boolean = false;
    pagination: Pagination;
    selectedChannel: string = 'ALL';
    selectedType: string = 'ALL';
    selectedStatus: string = 'ALL';
    selectedChannelTree: string = 'ALL';
    channels: { label: string, value: string }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'E-Kedai', value: 'e-kedai' },
        { label: 'Hello Sim', value: 'hello-sim' }
    ];
    types: { label: string, value: string }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'Referral', value: 'REFERRAL' },
        { label: 'Loyalty', value: 'LOYALTY' }
    ];
    status: { label: string, value: string }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' }
    ];

    constructor(
        private _loyaltyService: LoyaltyService,
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {}

    ngOnInit() {

        // Create the form
        this.filterForm = this._formBuilder.group({
            channel: ['ALL'],
            status: ['ALL'],
            type: ['ALL'],
            search: [null],
        });
        
        // Subscribe to data
        this._loyaltyService.membersList$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (list: Members[]) => {
                    this.allMembers = list;
                    this.populateSummary();
                },
                (error) => {
                    console.error('Error fetching members list:', error);
                }
            );

        // Get Pagination
        this._loyaltyService.membersListPagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: Pagination) => {
                if (pagination) {
                    this.pagination = pagination;
                }
                this._changeDetectorRef.markForCheck();
            });

        // Filter channel
        this.filterForm.get('channel').valueChanges.subscribe(
            (value) => {
                if (value) {
                    this.selectedChannel = value;
                    this.loadMembers({ first: 0, rows: this.pagination.size });
                }
            }
        );

        // Filter type
        this.filterForm.get('type').valueChanges.subscribe(
            (value) => {
                if (value) {
                    this.selectedType = value;
                    this.loadMembers({ first: 0, rows: this.pagination.size });
                }
            }
        );

        // Filter status
        this.filterForm.get('status').valueChanges.subscribe(
            (value) => {
                if (value) {
                    this.selectedStatus = value;
                    this.loadMembers({ first: 0, rows: this.pagination.size });
                }
            }
        );

        // Search Filter 
        this.filterForm.get('search').valueChanges.subscribe(
            (value) => {
                this.loadMembers({ first: 0, rows: this.pagination.size });
            }
        );
    }

    populateSummary() {
        this.allMembers.forEach(member => {
            member.summary = [];

            member.referral.forEach(item => {
                item = { ...item, type: 'Referral' };
                member.summary.push(item);
            });

            member.loyalty.forEach(item => {
                item = { ...item, type: 'Loyalty' };
                member.summary.push(item);
            });

            this.summaryEkedai = member.summary.filter(
                summary => summary.channel === 'e-kedai'
            );

            this.summaryHelloSim = member.summary.filter(
                summary => summary.channel === 'hello-sim'
            );
        });
        console.log('e-Kedai', this.summaryEkedai, 'hello-sim', this.summaryHelloSim);
    }

    loadMembers(event: any) {
        const page = event.first / event.rows + 1;
        const pageSize = event.rows;

        let params = {
            page: page,
            pageSize: pageSize,
            search: this.filterForm.get('search').value || null,
            type: 'ALL',
            channel: 'ALL',
            status: 'ALL'
        };

        this._loyaltyService.getAllMembers(params).subscribe();
    }

    clearSearch(): void {
        this.filterForm.get('search').setValue(null);
    }

    toggleOpen(index: number): void {
        this.openIndex = this.openIndex === index ? null : index;
    }

    ngOnDestroy() {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
