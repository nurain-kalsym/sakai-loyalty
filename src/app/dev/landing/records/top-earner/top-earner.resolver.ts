import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';

export const topEarnerResolver = (route: ActivatedRoute) => {
    const loyaltyService = inject(LoyaltyService);

    return loyaltyService.getTopEarner(
        {
            type: 'ALL',
            channel: null,
        }
    );
};

