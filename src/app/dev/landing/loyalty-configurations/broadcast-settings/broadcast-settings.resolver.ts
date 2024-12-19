import { inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommunicationService } from "src/app/core/communication/communication.service";

export const campaignResolver = (route: ActivatedRoute) => {
    const communicationService = inject(CommunicationService);

    return communicationService.getBroadcastNotification(
        {
            channel: 'e-kedai'
        }
    );
}