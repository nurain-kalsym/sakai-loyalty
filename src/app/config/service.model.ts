export interface IAppConfig {
    env: {
        name: string;
    };
    serviceUrl: {
        loyaltyService: string;
        profileService: string;
    };
    logging: number;
}
