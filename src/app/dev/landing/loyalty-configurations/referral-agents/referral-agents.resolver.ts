import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';

export const referralPeopleResolver = (route: ActivatedRoute) => {
    const loyaltyService = inject(LoyaltyService);

    return forkJoin([
        loyaltyService.getReferralUsers({ 
            channel: 'ALL',
            page: 1,
            pageSize: 100
        })
    ]);
};
