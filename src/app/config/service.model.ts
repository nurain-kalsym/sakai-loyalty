export interface IAppConfig {
    env: {
        name: string;
    };
    serviceUrl: {
        loyaltyService: string;
        profileService: string;
        communicationService: string;
    };
    logging: number;
}
