import { Injectable } from "@angular/core";
import { map, Observable, ReplaySubject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { AppConfig } from "src/app/config/service.config";
import { LogService } from "../logging/log.service";
import { AddCampaignNotification, AddNotificationConfig, CampaignNotification, NotificationConfig } from "./communication.types";

@Injectable({
    providedIn: 'root',
})
export class CommunicationService { 

    // -----------------------------------------------------------------------------------------------------
    // @ Declarations
    // -----------------------------------------------------------------------------------------------------

    private _notificationConfig: ReplaySubject<NotificationConfig[]> = new  ReplaySubject<NotificationConfig[]>(1);
    private _addnotificationConfig: ReplaySubject<AddNotificationConfig> = new ReplaySubject<AddNotificationConfig>(1);
    private _campaignNotification: ReplaySubject<CampaignNotification[]> = new ReplaySubject<CampaignNotification[]>(1);

    // -----------------------------------------------------------------------------------------------------
    // @ Constructor
    // -----------------------------------------------------------------------------------------------------
    constructor(
        private _httpClient: HttpClient,
        private _apiServer: AppConfig,
        private _logging: LogService,
    ) { }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /** Setter and Getter for Notification Config */
    set notificationConfig(value: NotificationConfig[]) {
        this._notificationConfig.next(value);
    }
    get notificationConfig$(): Observable<NotificationConfig[]> {
        return  this._notificationConfig.asObservable();
    }

    /** Setter and Getter for  Add Notification Config */
    set addNotificationConfig(value: AddNotificationConfig) {
        this._addnotificationConfig.next(value);
    }
    get addNotificationConfig$(): Observable<AddNotificationConfig> {
        return this._addnotificationConfig.asObservable();
    }

    /** Setter and Getter for Campaign Notification */
    set campaignNotification(value: CampaignNotification[]) {
        this._campaignNotification.next(value);
    }
    get campaignNotification$(): Observable<CampaignNotification[]> {
        return this._campaignNotification.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ APIs
    // -----------------------------------------------------------------------------------------------------

    getNotificationConfig( params: {channel: string} = {channel: null }): Observable<any> {
        let communicationService = this._apiServer.settings.serviceUrl.communicationService;

        // Delete empty value
        Object.keys(params).forEach((key) => {
            if (Array.isArray(params[key])) {
                params[key] = params[key].filter((element) => element !== null);
            }
            if (
                params[key] === null ||
                params[key] === undefined ||
                params[key] === '' ||
                (Array.isArray(params[key]) && params[key].length === 0)
            ) {
                delete params[key];
            }
        });

        const header = {
            params
        };

        return this._httpClient
            .get<any>(
                communicationService + '/notification-config', 
                header
            )
            .pipe(
                map((response) => {
                    const notificationConfig = response.data;

                    this._logging.debug(
                        'Response from Commuication Service (getNotificationConfig)',
                        response
                    );

                    // return data
                    this._notificationConfig.next(notificationConfig);

                    return notificationConfig;
                })
            );
    }
    
    setNotificationConfig(body: AddNotificationConfig): Observable<any> {
        const communicationService = this._apiServer.settings.serviceUrl.communicationService;
    
        // Use FormData to handle multipart/form-data
        const formData = new FormData();
        for (const key in body) {
            if (body[key] !== undefined) {
                formData.append(
                    key,
                    body[key]
                );
            }
        }
    
        // Log formData content for debugging
        formData.forEach((value, key) => {
            console.log(`${key}: ${value}`);  // Logs each key-value in FormData
        });
    
        return this._httpClient
            .post<any>(`${communicationService}/notification-config`, formData)
            .pipe(
                map((response) => {
                    this._logging.debug(
                        'Response from Communication Service (setNotificationConfig)',
                        response
                    );
    
                    return response;
                })
            );
    }
    
    updateNotificationConfig(id: string, body: AddNotificationConfig): Observable<any> {
        const communicationService = this._apiServer.settings.serviceUrl.communicationService;
    
        // Use FormData to handle multipart/form-data
        const formData = new FormData();
        for (const key in body) {
            if (body[key] !== undefined) {
                formData.append(
                    key,
                    body[key]
                );
            }
        }
    
        return this._httpClient
            .put<any>(`${communicationService}/notification-config/${id}`, formData)
            .pipe(
                map((response) => {
                    this._logging.debug(
                        'Response from Communication Service (updateNotificationConfig)',
                        response
                    );
    
                    return response;
                })
            );
    }

    getBroadcastNotification(
        params: {channel: string} = {channel: null}
    ): Observable<any> {
        let communicationService = this._apiServer.settings.serviceUrl.communicationService;

        // Delete empty value
        Object.keys(params).forEach((key) => {
            if (Array.isArray(params[key])) {
                params[key] = params[key].filter((element) => element !== null);
            }
            if (
                params[key] === null ||
                params[key] === undefined ||
                params[key] === '' ||
                (Array.isArray(params[key]) && params[key].length === 0)
            ) {
                delete params[key];
            }
        });

        const header = {
            params
        };

        return this._httpClient
            .get<any>(
                communicationService + '/campaign-notification',
                header
            )
            .pipe(
                map((response) => {
                    const campaignNotification = response.data;

                    this._logging.debug(
                        'Response from Communication Service (getBroadcastNotification)',
                        response
                    );

                    // return data
                    this._campaignNotification.next(campaignNotification);

                    return campaignNotification;
                })
            );
    }

    setBroadcastNotification(
        body: FormData // Update the parameter type to FormData
    ): Observable<any> {
        const communicationService = this._apiServer.settings.serviceUrl.communicationService;
    
        return this._httpClient
            .post<any>(`${communicationService}/campaign-notification`, body)
            .pipe(
                map((response) => {
                    this._logging.debug(
                        'Response from Communication Service (setBroadcastNotification)',
                        response
                    );
    
                    return response;
                })
            );
    }

    updateBroadcastNotification(
        id: string, body: AddCampaignNotification
    ): Observable<any> {
        const communicationService = this._apiServer.settings.serviceUrl.communicationService;

        // use FormData to handle multipart/form-data
        const formData = new FormData();
        for (const key in body) {
            if (body[key] !== undefined) {
                formData.append(
                    key,
                    body[key]
                );
            }
        }

        return this._httpClient
            .put<any>(`${communicationService}/campaign-notification/${id}`, formData)
            .pipe(
                map((response) => {
                    this._logging.debug(
                        'Response from Communication Service (updateBroadcastNotification)',
                        response
                    );

                    return response;
                })
            );
    }
    
}