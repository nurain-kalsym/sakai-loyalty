import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';

export const referralPeopleResolver = (route: ActivatedRoute) => {
    const profileService = inject(LoyaltyService);

    return profileService.getReferralUsers(
        {
            channel: 'ALL',
            page: 1,
            pageSize: 20
        }
    );
};
