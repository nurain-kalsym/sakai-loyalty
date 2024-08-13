import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';
import { Conversion, Pagination } from 'src/app/core/loyalty/loyalty.types';

@Component({
    templateUrl: './conversion-settings.component.html',
})
export class ConversionSettingsComponent implements OnInit, OnDestroy {
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    columnConversion: string[] = ['channel', 'expiryDuration', 'operation'];
    allConversion: Conversion[];
    pagination: Pagination;
    isLoading = false;

    constructor(
        private _loyaltyService: LoyaltyService
    ) {}

    ngOnInit(): void {
        this._loyaltyService.getAllConversions({})
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (conversion) => {
                    this.allConversion = conversion;
                },
                (error) => {
                    console.error('Error fetching conversions:', error);
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

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
