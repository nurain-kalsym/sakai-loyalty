import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';

export const coinsHistoryResolver = (route: ActivatedRoute) => {
    const loyaltyService = inject(LoyaltyService);

    return loyaltyService.getAllCoinsHistory(
        {
            page: 1,
            pageSize: 20,
            search: null,
            type: 'ALL',
            channel: 'ALL',
            startDate: null,
            endDate: null,
        }
    );
};

