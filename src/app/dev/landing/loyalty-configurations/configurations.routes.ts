import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoyaltySettingsComponent } from './loyalty-settings/loyalty-settings.component';
import { ConversionSettingsComponent } from './conversion-settings/conversion-settings.component';
import { AppointReferralAgentComponent } from './referral-agents/referral-agents.component';

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
            path: 'appoint-referral-agents',
            component: AppointReferralAgentComponent
        },
        // {
        //     path: 'appoint-micro-dealers',
        //     component:
        // }
    ])],
    exports: [RouterModule]
})
export class ConfigurationsRoutingModule { }
