import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoyaltySettingsComponent } from './loyalty-settings/loyalty-settings.component';
import { ConversionSettingsComponent } from './conversion-settings/conversion-settings.component';
import { AppointReferralAgentComponent } from './referral-agents/referral-agents.component';
import { MicroDealerComponent } from './micro-dealer/micro-dealer.component';
import { CoinsConversionComponent } from './coins-conversion-settings/coins-conversion-settings.componen';
import { NotificationConfigComponent } from './notification-config/notification-config.component';
import { BroadcastSettingsComponent } from './broadcast-settings/broadcast-settings.component';

@NgModule({
    imports: [RouterModule.forChild([
        {
            path: 'loyalty-settings',
            component: LoyaltySettingsComponent
        },
        {
            path: 'conversion-settings',
            component: ConversionSettingsComponent
        },
        {
            path: 'coins-conversion-settings',
            component: CoinsConversionComponent
        },
        {
            path: 'notification-config',
            component: NotificationConfigComponent
        },
        {
            path: 'broadcast-settings',
            component: BroadcastSettingsComponent
        },
        {
            path: 'appoint-referral-agents',
            component: AppointReferralAgentComponent
        },
        {
            path: 'appoint-micro-dealers',
            component: MicroDealerComponent
        }
    ])],
    exports: [RouterModule]
})
export class ConfigurationsRoutingModule { }
