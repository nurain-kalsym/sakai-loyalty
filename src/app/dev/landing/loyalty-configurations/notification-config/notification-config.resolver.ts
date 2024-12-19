import { inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommunicationService } from "src/app/core/communication/communication.service";

export const notifictaionConfigResolver = (route: ActivatedRoute) => {
    const communicationService = inject(CommunicationService);

    return communicationService.getNotificationConfig(
        {
            channel: 'e-kedai'
        }
    );
}