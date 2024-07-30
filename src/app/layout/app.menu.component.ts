import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(public layoutService: LayoutService) { }

    ngOnInit() {

        console.log('menu')
        this.model = [
            {
                // label: 'Menu',
                items: [
                    {
                        label: 'Dashbboard', icon: 'pi pi-fw pi-home',
                        routerLink: ['/']
                    },
                    {
                        label: 'Configurations', icon: 'pi pi-fw pi-cog',
                        items: [
                            {
                                label: 'Loyalty Tiers', icon: 'pi pi-fw pi-share-alt',
                                routerLink: ['/configurations/loyalty-settings']
                            },
                            {
                                label: 'Coins Conversion', icon: 'pi pi-fw pi-bitcoin',
                                routerLink: ['/configurations/conversion-settings']
                            },
                            {
                                label: 'Appoint Referral Agents', icon: 'pi pi-fw pi-users',
                                routerLink: ['/configurations/appoint-referral-agents']
                            },
                            {
                                label: 'Appoint Micro-Dealers', icon: 'pi pi-fw pi-id-card',
                                routerLink: ['/configurations/appoint-micro-dealers']
                            },
                        ]
                    },
                    {
                        label: 'Records', icon: 'pi pi-fw pi-folder',
                        items: [
                            {
                                label: 'Members Listing', icon: 'pi pi-fw pi-user',
                                routerLink: ['/records/members-listing']
                            },
                            {
                                label: 'Coins History', icon: 'pi pi-fw pi-history',
                                routerLink: ['/records/coins-history']
                            },
                            {
                                label: 'Top Earner', icon: 'pi pi-fw pi-star',
                                routerLink: ['/records/top-earner']
                            },
                            {
                                label: 'Aging Data', icon: 'pi pi-fw pi-table',
                                routerLink: ['/records/aging-data']
                            },
                        ]
                    },
                    
                ]
            },
        ];
    }
}
