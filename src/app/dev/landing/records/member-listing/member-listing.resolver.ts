import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoyaltyService } from 'src/app/core/loyalty/loyalty.service';

export const membersListResolver = (route: ActivatedRoute) => {
    const loyaltyService = inject(LoyaltyService);

    return loyaltyService.getAllMembers(
        {
            page: 1,
            pageSize: 20,
            search: null,
            channel: 'ALL',
            status: 'ALL',
            type: null,
        }
    );
};

