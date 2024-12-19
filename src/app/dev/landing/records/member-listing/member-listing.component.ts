import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, TreeNode } from 'primeng/api';
import { first, forkJoin, Subject, takeUntil } from 'rxjs';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';
import { CoinsData, Members, Pagination, MembershipInfo } from 'src/app/core/loyalty/loyalty.types';
import { __values } from 'tslib';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
    templateUrl: './member-listing.component.html',
    providers: [MessageService],
    styles: [`
        .ui-organizationchart {
            background-color: #f9f9f9; /* Background color */
            border: 1px solid #ddd; /* Border */
            padding: 10px; /* Padding */
        }
    
        .ui-organizationchart-node {
            border: 1px solid #007bff; /* Node border color */
            margin: 5px; /* Margin between nodes */
            transition: transform 0.2s; /* Animation on hover */
        }
    
        .ui-organizationchart-node:hover {
            transform: scale(1.05); /* Scale up on hover */
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2); /* Shadow on hover */
        }
    
        .text-md {
            font-weight: bold; /* Bold main text */
        }
    
        .text-sm {
            color: #ffffff; /* Color of smaller text */
        }
    
        .treeStyle {
            background-color: #740236; /* Top node background color */
            color: #ffffff; /* Top node text color */
            border-radius: 10px; /* Rounded corners for the top node */
            padding: 10px; /* Padding */
        }
    
        .custom-node {
            background-color: #4f46e5; /* Node background color */
            color: #ffffff; /* Node text color */
            border-radius: 10px; /* Rounded corners for custom nodes */
            padding: 10px; /* Padding */
            margin: 5px; /* Margin between nodes */
        }
      `]
})
export class MemberListingComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    membersListingColumn: string[] = ['phoneNumber', 'name', 'tier', 'action'];
    allMembers: Members[] = [];
    isLoading = false;
    isModified: boolean = false; 
    filterForm: FormGroup;
    membershipForm: FormGroup;
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
    selectedSortBy: string = 'A-Z';
    upgradeDialog: boolean = false;
    geneologyToolTip: string = null;
    currentStep = 1;
    showBackdrop = false;
    tours = {
        overlaySteps: [
            'tourGuideOverlay1',
            'tourGuideOverlay2',
            'tourGuideOverlay3',
            'tourGuideOverlay4',
            'tourGuideOverlay5'
        ],
        tourSteps: [
            'tourGuide1',
            'tourGuide2',
            'tourGuide3',
            'tourGuide4',
            'tourGuide5',
            'tourGuide6',
            'tourGuide7',
            'tourGuide8'
        ]
    };
    currentTourSteps: string[] = [];
    tourType: string = 'overlaySteps';

    channels: { label: string, value: string }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'E-Kedai', value: 'e-kedai' },
        { label: 'HelloSim', value: 'hello-sim' }
    ];
    status: { label: string, value: string }[] = [
        { label: 'All', value: 'ALL' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' }
    ];
    sortBy: {label: string, value: string}[] = [
        { label: 'Name (A-Z)', value: 'A-Z' },
        { label: 'Name (Z-A)', value: 'Z-A' },
        { label: 'Rank (Descending)', value: 'DESC_RANK' },
        { label: 'Rank (Ascending)', value: 'ASC-RANK' }
    ];
    treeChannel: { label: string, value: string }[] = [
        { label: 'E-Kedai', value: 'e-kedai' },
        { label: 'HelloSim', value: 'hello-sim' }
    ];
    membershipTier: { label: string, value: number }[] = [
        { label: 'Silver', value: 3 },
        { label: 'Gold', value: 2 },
        { label: 'Platinum', value: 1 }
    ];
    statusMember: { label: string, value: string }[] = [
        { label: 'Standard', value: 'STANDARD' },
        { label: 'Permanent', value: 'PERMENANT' },
    ];
    
    @ViewChild('tourGuideOverlay1') tourGuideOverlay1: OverlayPanel;
    @ViewChild('tourGuideOverlay2') tourGuideOverlay2: OverlayPanel;
    @ViewChild('tourGuideOverlay3') tourGuideOverlay3: OverlayPanel;
    @ViewChild('tourGuideOverlay4') tourGuideOverlay4: OverlayPanel;
    @ViewChild('tourGuideOverlay5') tourGuideOverlay5: OverlayPanel;

    @ViewChild('tourGuide1') tourGuide1: OverlayPanel;
    @ViewChild('tourGuide2') tourGuide2: OverlayPanel;
    @ViewChild('tourGuide3') tourGuide3: OverlayPanel;
    @ViewChild('tourGuide4') tourGuide4: OverlayPanel;
    @ViewChild('tourGuide5') tourGuide5: OverlayPanel;
    @ViewChild('tourGuide6') tourGuide6: OverlayPanel;
    @ViewChild('tourGuide7') tourGuide7: OverlayPanel;
    @ViewChild('tourGuide8') tourGuide8: OverlayPanel;

    constructor(
        private _loyaltyService: LoyaltyService,
        private _formBuilder: FormBuilder,
        private _formChannel: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private messageService: MessageService
    ) {}

    ngOnInit() {

        // Create the form
        this.filterForm = this._formBuilder.group({
            channel: ['ALL'],
            status: ['ALL'],
            sortBy: ['A-Z'],
            search: [null],
        });

        // create channel form 
        this.channelFilter = this._formChannel.group({channelTree: ['ALL']});
        this.channelFilter.get('channelTree').disable();
        
        // Membership upgrade form
        this.membershipForm = this._formBuilder.group({
            tier: [null, [Validators.required]],
            status: [null, [Validators.required]]
        });

        // Subscribe to data
        this._loyaltyService.membersList$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (list: Members[]) => {
                    this.allMembers = list;
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

        // Filter Sort By
        this.filterForm.get('sortBy').valueChanges.subscribe(
            (value) => {
                if (value) {
                    this.selectedSortBy = value;
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

    loadMembers(event: any) {
        const page = event.first / event.rows + 1;
        const pageSize = event.rows;

        let params = {
            page: page,
            pageSize: pageSize,
            search: this.filterForm.get('search').value || null,
            sortBy: this.selectedSortBy,
            type: 'ALL',
            channel: this.selectedChannel,
            status: this.selectedStatus
        };

        this._loyaltyService.getAllMembers(params).subscribe();
    }

    refTree(phone: string, channel: string) {
    
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
                this.referralTree = [];
                responses.forEach(response => {
                    if (response) {
                        this.referralTree.push(response);
                    }
                });
                this.showTree = this.referralTree.length > 0;
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
        this.showTree = this.referralTree.length > 0;
        this.displayMessage = this.referralTree.length === 0;
    }
    
    /* icon in referral tree */
    closeTree() {
        this.showTree = false;
        this.displayMessage = false;
    }

    clearSearch(): void {
        this.filterForm.get('search').setValue(null);
    }

    toggleOpen(index: number, userPhone: string) {
        if (this.openIndex === index) {
            this.openIndex = -1;
        } else {
            this._loyaltyService.getMembershipInfo({ phone: userPhone, channel: 'e-kedai' }).subscribe(
                (response: MembershipInfo) => {
                    this.selectedUser = response;
    
                    if (this.selectedUser.referral.referralCount > 0) {
                        this.geneologyToolTip = 'View Geneology';
                        this.channelFilter.get('channelTree').enable();
                    }
    
                    this.openIndex = index;
                },
                (error) => {
                    console.error('Error fetching membership info:', error);
                }
            );
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

    upgradeTier(phone: string) {
        // Fetch membership information before opening the dialog
        this._loyaltyService.getMembershipInfo({ phone }).subscribe(
            (membershipInfo) => {
                // Ensure the response structure is correct
                if (membershipInfo && membershipInfo.membershipTier) {
                    // Set the existing data into the form
                    this.membershipForm.patchValue({
                        tier: membershipInfo.membershipTier.tier.toString(),
                        status: membershipInfo.spending.memberStatus
                    });
                    
                    this.upgradeDialog = true; // Open the dialog
                } else {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Warning',
                        detail: 'No membership information found.'
                    });
                }
            },
            (error) => {
                // Handle the error if fetching membership info fails
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to fetch membership information.'
                });
            }
        );
    }

    getTooltip(value: string): string {
        switch (value) {
            case 'STANDARD':
                return 'Able to upgraded and downgraded';
            case 'PERMENANT':
                return 'Unable to upgraded and downgraded';
            default:
                return '';
        }
    }

    save() {
        if (this.membershipForm.invalid) {
            return; // Prevent saving if the form is invalid
        }
    
        const updatedData = {
            phone: this.selectedUser.phone,
            channel: 'e-kedai',
            tier: this.membershipForm.value.tier,
            status: this.membershipForm.value.status
        };
    
        this._loyaltyService.editMemberTier(updatedData).subscribe(
            (response) => {
                // Handle successful response
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Membership tier updated successfully.'
                });
                this.upgradeDialog = false;
                // this.membershipForm.reset();
            },
            (error) => {
                // Handle error response
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to update membership tier.'
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

    ngAfterViewInit(): void {
        console.log('View initialized, overlays ready.');
    }

    /* startTour(): void {
        console.log('Starting the tour');
        
        this.currentStep = 0;
        this.hideAllOverlays();
        this.showBackdrop = true;

        const firstOverlayId = this.overlaySteps[this.currentStep];
        console.log('Showing Overlay: ', firstOverlayId);

        setTimeout(() => {
            this.showTourOverlay(firstOverlayId);
        }, 200);
    } */

    startTour(tourType: string): void {
        this.tourType = tourType;

        // Retreive steps for the selected tour
        this.currentTourSteps = this.tours[tourType];
        if (!this.currentTourSteps) {
            console.error(`Tour type ${tourType} tour`);
            return;
        }

        console.log(`Starting the ${tourType} tour`);
        
        this.currentStep = 0;
        this.hideAllOverlays();
        this.showBackdrop = true;

        const firstOverlayId = this.currentTourSteps[this.currentStep];
        console.log('Showing Overlay: ', firstOverlayId);
        
        setTimeout(() => {
            this.showTourOverlay(firstOverlayId);
        }, 200);
    }

    showTourOverlay(overlayId: string): void {
        const targetElement = document.getElementById(overlayId);
        if (!targetElement) {
            console.error(`Target element with ID '${overlayId}' not found.`);
            return;
        }
    
        this.hideAllOverlays();
        this.applyFocusEffect(overlayId);
    
        // Determine the correct overlay reference dynamically
        const overlayKey = this.tourType === 'overlaySteps' 
            ? `tourGuideOverlay${this.currentStep + 1}` 
            : `tourGuide${this.currentStep + 1}`;
        
        const overlay = this[overlayKey];
        if (overlay) {
            overlay.show(new MouseEvent('click'), targetElement);
        } else {
            console.error(`Overlay for ID '${overlayId}' is not defined.`);
        }
    }    

    applyFocusEffect(activeOverlayId: string): void {
        this.currentTourSteps.forEach((stepId) => {
            const element = document.getElementById(stepId);
            if (element) {
                if (stepId === activeOverlayId) {
                    element.style.zIndex = '200';
                    element.style.boxShadow = '0 0 10px 2px rgba(255, 255, 255, 0.8)';
                    element.style.background = 'rgba(255, 255, 255, 1)';
                } else {
                    element.style.zIndex = '0';
                    element.style.boxShadow = 'none';
                    element.style.background = 'rgba(255, 255, 255, 0.3)';
                }
            }
        });
    }

    hideAllOverlays(): void {
        // Reset styles for all elements in current tour steps
        this.currentTourSteps.forEach((stepId) => {
            const element = document.getElementById(stepId);
            if (element) {
                element.style.zIndex = '0';
                element.style.boxShadow = 'none';
                element.style.background = '';
            }
        });
    
        // Dynamically hide all overlays for the current tour type
        for (let i = 1; i <= this.tours[this.tourType].length; i++) {
            const overlayKey = this.tourType === 'overlaySteps' 
                ? `tourGuideOverlay${i}` 
                : `tourGuide${i}`;
            const overlay = this[overlayKey];
            if (overlay) {
                overlay.hide();
            }
        }
    }    

    nextStep(): void {
        if (this.currentStep < this.currentTourSteps.length - 1) {
            this.hideAllOverlays();
            this.currentStep++;

            const nextOverlayId = this.currentTourSteps[this.currentStep];
            setTimeout(() => {
            this.showTourOverlay(nextOverlayId);
            }, 200);
        } else {
            console.log('Tour finished!');
            this.endTour();
        }
    }

    previousStep(): void {
        if (this.currentStep > 0) {
            this.hideAllOverlays();
            this.currentStep--;

            const prevOverlayId = this.currentTourSteps[this.currentStep];
            setTimeout(() => {
            this.showTourOverlay(prevOverlayId);
            }, 200);
        }
    }

    endTour(forceReset: boolean = true): void {
        console.log('Tour ended');
        this.hideAllOverlays();
        this.showBackdrop = false;
        if (forceReset) {
            this.currentStep = 0;
        }
    }

    /* showTourOverlay(overlayId: string): void {
        const targetElement = document.getElementById(overlayId);
        if (!targetElement) {
            console.error(`Target element with ID '${overlayId}' not found.`);
            return;
        }
    
        this.hideAllOverlays();
    
        // Highlight the current step
        this.applyFocusEffect(overlayId);
    
        const overlay = this[`tourGuideOverlay${this.currentStep + 1}`];
        if (overlay) {
            overlay.show(new MouseEvent('click'), targetElement);
        } else {
            console.error(`Overlay for ID '${overlayId}' is not defined.`);
        }
    }

    applyFocusEffect(activeOverlayId: string): void {
        this.overlaySteps.forEach((stepId) => {
            const element = document.getElementById(stepId);
            if (element) {
                if (stepId === activeOverlayId) {
                    element.style.zIndex = '200'; // Bring the active element to the front
                    element.style.boxShadow = '0 0 10px 2px rgba(255, 255, 255, 0.8)';
                    element.style.background = 'rgba(255, 255, 255, 1)';
                } else {
                    element.style.zIndex = '0';
                    element.style.boxShadow = 'none';
                    element.style.background = 'rgba(255, 255, 255, 0.3)'; // Dim inactive elements
                }
            }
        });
    }

    hideAllOverlays(): void {
        this.overlaySteps.forEach((stepId) => {
            const element = document.getElementById(stepId);
            if (element) {
                element.style.zIndex = '0';
                element.style.boxShadow = 'none';
                element.style.background = ''; // Reset styles
            }
        });
    
        if (this.tourGuideOverlay1) this.tourGuideOverlay1.hide();
        if (this.tourGuideOverlay2) this.tourGuideOverlay2.hide();
        if (this.tourGuideOverlay3) this.tourGuideOverlay3.hide();
        if (this.tourGuideOverlay4) this.tourGuideOverlay4.hide();
        if (this.tourGuideOverlay5) this.tourGuideOverlay5.hide();
    } */

    /* hideAllOverlays(): void {
        console.log('Hide all overlays');
        // this.showBackdrop = false;
        if (this.tourGuideOverlay1) this.tourGuideOverlay1.hide();
        if (this.tourGuideOverlay2) this.tourGuideOverlay2.hide();
        if (this.tourGuideOverlay3) this.tourGuideOverlay3.hide();
        if (this.tourGuideOverlay4) this.tourGuideOverlay4.hide();
        if (this.tourGuideOverlay5) this.tourGuideOverlay5.hide();
    } */

    /* nextStep(): void {
        console.log('Current step before next:', this.currentStep);
        
        if (this.currentStep < this.overlaySteps.length - 1) {
            this.hideAllOverlays();

            this.currentStep++;
            const nextOverlayId = this.overlaySteps[this.currentStep];

            console.log('Next step index:', this.currentStep);
            console.log('Attempting to show overlay:', nextOverlayId);

            setTimeout(() => {
                this.showTourOverlay(nextOverlayId);
            },200);
        } else {
            console.log('Tour finished!');
            this.endTour();
        }
    }

    previousStep(): void {
        if (this.currentStep > 0) {
            console.log('Moving to previous step', this.currentStep - 1);
            
            this.hideAllOverlays();
            this.currentStep--;

            setTimeout(() => {
                const prevOverlayId = this.overlaySteps[this.currentStep];
                console.log('Showing overlay:', prevOverlayId);
                this.showTourOverlay(prevOverlayId);
            }, 200);
        }
    }

    endTour(forceReset: boolean = true): void {
        console.log('Tour ended');
        this.hideAllOverlays();
        this.showBackdrop = false;
        if (forceReset) {
            this.currentStep = 0;
        }
    } */

    ngOnDestroy() {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
