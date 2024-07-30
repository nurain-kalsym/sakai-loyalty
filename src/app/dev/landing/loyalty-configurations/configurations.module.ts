import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { PanelMenuModule } from 'primeng/panelmenu';
import { LoyaltySettingsComponent } from './loyalty-settings/loyalty-settings.component';
import { ConfigurationsRoutingModule } from './configurations.routes';
import { ConversionSettingsComponent } from './conversion-settings/conversion-settings.component';
import { AppointReferralAgentComponent } from './referral-agents/referral-agents.component';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ChartModule,
        MenuModule,
        TableModule,
        StyleClassModule,
        PanelMenuModule,
        ButtonModule,
        ConfigurationsRoutingModule
    ],
    declarations: [
        LoyaltySettingsComponent,
        ConversionSettingsComponent,
        AppointReferralAgentComponent
    ]
})
export class ConfigurationsModule { }
