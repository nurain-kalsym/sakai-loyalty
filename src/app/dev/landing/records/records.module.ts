import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { PanelMenuModule } from 'primeng/panelmenu';
import { RecordsRoutingModule } from './records.routes';
import { AgingDataComponent } from './aging-data/aging-data.component';
import { DropdownModule } from 'primeng/dropdown';
import { ReactiveFormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { TopEarnerComponent } from './top-earner/top-earner.component';
import { CoinsHistoryComponent } from './coins-history/coins-history.component';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
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
        RecordsRoutingModule,
        DropdownModule,
        ReactiveFormsModule,
        PaginatorModule,
        CalendarModule,
        InputTextModule
    ],
    declarations: [
        AgingDataComponent,
        TopEarnerComponent,
        CoinsHistoryComponent
    ]
})
export class RecordsModule { }
