import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';

export const microdealerResolver = (route: ActivatedRoute) => {
    const loyaltyService = inject(LoyaltyService);

    return loyaltyService.getMicroDealer(
        {
            page: 1,
            pageSize: 100,
            channel: 'ALL',
        }
    );
};

