import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ConfigurationsRoutingModule } from './configurations.routes';
import { ConversionSettingsComponent } from './conversion-settings/conversion-settings.component';
import { AppointReferralAgentComponent } from './referral-agents/referral-agents.component';
import { MicroDealerComponent } from './micro-dealer/micro-dealer.component';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LoyaltySettingsComponent } from './loyalty-settings/loyalty-settings.component';

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
        ConfigurationsRoutingModule,
        ToolbarModule,
        DropdownModule,
        DialogModule,
        ReactiveFormsModule,
        InputTextModule,
        InputTextareaModule,
        CheckboxModule,
        InputNumberModule,
        MessagesModule,
        ToastModule,
        ConfirmDialogModule
    ],
    declarations: [
        LoyaltySettingsComponent,
        ConversionSettingsComponent,
        AppointReferralAgentComponent,
        MicroDealerComponent
    ]
})
export class ConfigurationsModule { }
