import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TreeNode } from 'primeng/api';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';
import { CoinsData, Members, Pagination, MembershipInfo } from 'src/app/core/loyalty/loyalty.types';

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
    membersListingColumn: string[] = ['phoneNumber', 'name', 'tier', 'action'];
    // membersListingColumn: string[] = ['phoneNumber', 'name', 'email', 'referral', 'loyalty', 'microdealer', 'action'];
    allMembers: Members[] = [];
    isLoading = false;
    filterForm: FormGroup;
    channelFilter: FormGroup;
    summary: CoinsData[] = [];
    referralTree: TreeNode[] = [];
    summaryEkedai: any;
    summaryHelloSim: any
    displayMessage = false;
    openIndex: number | null = null;
    showTree = false;
    pagination: Pagination;
    selectedUser: MembershipInfo = null;
    selectedChannel: string = 'ALL';
    selectedType: string = 'ALL';
    selectedStatus: string = 'ALL';
    selectedChannelTree: string = 'ALL';
    geneologyToolTip: string = null;
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
    treeChannel: { label: string, value: string }[] = [
        { label: 'E-Kedai', value: 'e-kedai' },
        { label: 'Hello Sim', value: 'hello-sim' }
    ];

    constructor(
        private _loyaltyService: LoyaltyService,
        private _formBuilder: FormBuilder,
        private _formChannel: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {}

    ngOnInit() {

        // Create the form
        this.filterForm = this._formBuilder.group({
            channel: ['ALL'],
            status: ['ALL'],
            search: [null],
        });

        // create channel form 
        this.channelFilter = this._formChannel.group({channelTree: ['ALL']});
        this.channelFilter.get('channelTree').disable();
        
        // Subscribe to data
        this._loyaltyService.membersList$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (list: Members[]) => {
                    this.allMembers = list;
                    // this.populateSummary();
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
        /* this.filterForm.get('type').valueChanges.subscribe(
            (value) => {
                if (value) {
                    this.selectedType = value;
                    this.loadMembers({ first: 0, rows: this.pagination.size });
                }
            }
        ); */

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

        //filter Tree channel
        this.channelFilter.valueChanges.subscribe(() => {
            console.log('Referral Tree Data:', this.referralTree);
            this.showTree = false;
            const { channelTree } = this.channelFilter.value;
            if (channelTree) {
              this.referralTree = this.referralTree.filter(tree => tree.data.name.includes(channelTree));
            }
          });
    }

    /* populateSummary() {
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
    } */

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

    refTree(phone: string, channel: string) {
        // console.log('Ref Tree called with phone:', phone, 'and channel:', channel);
    
        const validChannels = ['e-kedai', 'hello-sim'];
        const channels = validChannels.includes(channel) ? [channel] : [];
    
        if (channels.length === 0) {
          this.referralTree = [];
          this.showTree = false;
          this.displayMessage = true;
          this.updateTreeDisplay();
          return;
        }
    
        const observables = channels.map(ch => this._loyaltyService.getReferralTree({ phone: phone, channel: ch }));
    
        forkJoin(observables).subscribe({
          next: responses => {
            this.referralTree = []; // Clear existing tree
            responses.forEach(response => {
              if (response) {
                this.referralTree.push(response);
              }
            });
            this.referralTree.forEach(tree => this.updateStyleClass(tree));
            this.showTree = true;
            this.updateTreeDisplay();
          },
          error: err => {
            console.error('Error:', err);
            this.referralTree = [];
            this.showTree = false;
            this.updateTreeDisplay();
          }
        });
    }

    updateTreeDisplay() {
        // console.log('Updating Tree Display with:', this.referralTree);
        this.showTree = this.referralTree.length > 0;
        this.displayMessage = this.referralTree.length === 0;
    }
    
    updateStyleClass(tree: TreeNode) {
        tree.styleClass = (tree.data.layer === 2) ? 'custom-node' : 'treeStyle';

        if (tree.children && tree.children.length > 0) {
            tree.children.forEach(child => this.updateStyleClass(child));
        }
    }
    
    /* icon in referral tree */
    closeTree() {
        this.showTree = false;
        this.displayMessage = false;
    }

    clearSearch(): void {
        this.filterForm.get('search').setValue(null);
    }

    /* toggleOpen(index: number): void {
        this.openIndex = this.openIndex === index ? null : index;
    } */

    toggleOpen(index: number, userPhone: string) {
        if (this.openIndex === index) {
            this.openIndex = -1;
        } else {
            this._loyaltyService.getMembershipInfo({ phone: userPhone }).subscribe((response) => {
                this.selectedUser = response;
                if (this.selectedUser.referral.referralCount > 0) {
                this.geneologyToolTip = 'View Geneology'
                this.channelFilter.get('channelTree').enable();
                } 
                this.openIndex = index;
            });
        }
    
        this.clearChannelSelection();
        this.showTree = false;
    }

    clearChannelSelection() {
        if (this.channelFilter) {
            this.channelFilter.get('channelTree').setValue(null);
        }
        this.showTree = false;
        this.displayMessage = false;
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

    ngOnDestroy() {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
