import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, map, Observable, ReplaySubject, switchMap, take, tap, throwError } from "rxjs";
import { Aging, CoinsHistory, Conversion, Earner, LoyaltyConfig, Members, MicrodealerDetails, Pagination, ReferralTree, ReferralUsers } from "./loyalty.types";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AppConfig } from "src/app/config/service.config";
import { LogService } from "../logging/log.service";

@Injectable({
    providedIn: 'root',
})
export class LoyaltyService { 

    // -----------------------------------------------------------------------------------------------------
    // @ Declarations
    // -----------------------------------------------------------------------------------------------------

    private _agingData: ReplaySubject<Aging[]> = new ReplaySubject<Aging[]>(1);
    private _agingDataPagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);
    private _topEarner: ReplaySubject<Earner[]> = new ReplaySubject<Earner[]>(1);
    private _coinsHistory: ReplaySubject<CoinsHistory[]> = new ReplaySubject<CoinsHistory[]>(1);
    private _coinsHistoryPagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);
    private _membersList: ReplaySubject<Members[]> = new ReplaySubject<Members[]>(1);
    private _membersListPagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);
    private _referralTree: ReplaySubject<ReferralTree> = new ReplaySubject<ReferralTree>(1);
    private _microDealer: ReplaySubject<MicrodealerDetails[]> = new ReplaySubject<MicrodealerDetails[]>(1);
    private _referralUsers: ReplaySubject<ReferralUsers[]> = new ReplaySubject<ReferralUsers[]>(1);
    private _referralUsersPagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);
    private _conversion: ReplaySubject<Conversion[]> = new ReplaySubject<Conversion[]>(1);
    private _conversionPagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);
    private _loyaltyConfig: ReplaySubject<LoyaltyConfig[]> = new ReplaySubject<LoyaltyConfig[]>(1);
    private _loyaltyConfigPagination: BehaviorSubject<Pagination | null> = new BehaviorSubject(null);


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

    /** Setter and Getter for Aging Data */
    set agingData(value: Aging[]) {
        this._agingData.next(value);
    }
    get agingData$(): Observable<Aging[]> {
        return this._agingData.asObservable();
    }

    /** Setter and Getter for Aging Data Paginations */
    set agingDataPagination(value: Pagination) {
        // Store the value
        this._agingDataPagination.next(value);
    }

    get agingDataPagination$(): Observable<Pagination> {
        return this._agingDataPagination.asObservable();
    }

    /** Setter and Getter for Top Earner */
    set topEarner(value: Earner[]) {
        this._topEarner.next(value);
    }
    get topEarner$(): Observable<Earner[]> {
        return this._topEarner.asObservable();
    }

    /** Setter and Getter for Coins History */
    set coinsHistory(value: CoinsHistory[]) {
        this._coinsHistory.next(value);
    }
    get coinsHistory$(): Observable<CoinsHistory[]> {
        return this._coinsHistory.asObservable();
    }

   /** Setter and Getter for Coins History Paginations */
   set coinsHistoryPagination(value: Pagination) {
        // Store the value
        this._coinsHistoryPagination.next(value);
    }

    get coinsHistoryPagination$(): Observable<Pagination> {
        return this._coinsHistoryPagination.asObservable();
    }

    /** Setter and Getter for Members Listing */
    set membersList(value: Members[]) {
        this._membersList.next(value);
    }
    get membersList$(): Observable<Members[]> {
        return this._membersList.asObservable();
    }

    /** Setter and Getter for Members Listing Paginations */
    set membersListPagination(value: Pagination) {
        // Store the value
        this._membersListPagination.next(value);
    }

    get membersListPagination$(): Observable<Pagination> {
        return this._membersListPagination.asObservable();
    }

    /** Setter and Getter for Referral Tree */
    set referralTree(value: ReferralTree) {
        this._referralTree.next(value);
    }
    get referralTree$(): Observable<ReferralTree> {
        return this._referralTree.asObservable();
    }

    /** Setter and Getter for MicroDealer */
    set microDealers(value: MicrodealerDetails[]) {
        this._microDealer.next(value);
    }
    get microDealers$(): Observable<MicrodealerDetails[]> {
        return this._microDealer.asObservable();
    }

    /** Setter and Getter for Referral Users */
    set referralUsers(value: ReferralUsers[]) {
        this._referralUsers.next(value);
    }
    get referralUsers$(): Observable<ReferralUsers[]> {
        return this._referralUsers.asObservable();
    }
    
    /** Setter and Getter for Referral Users Paginations */
    set referralUsersPagination(value: Pagination) {
        this._referralUsersPagination.next(value);
    }
    get referralUsersPagination$(): Observable<Pagination> {
        return this._referralUsersPagination.asObservable();
    }

    /** Setter and Getter for Conversions */
    set conversion(value: Conversion[]) {
        this._conversion.next(value);
    }
    get conversion$(): Observable<Conversion[]> {
        return this._conversion.asObservable();
    }

    /** Setter and Getter for Conversions Paginations */
    set conversionPagination(value: Pagination) {
        this._conversionPagination.next(value);
    }
    get conversionPagination$(): Observable<Pagination> {
        return this._conversionPagination.asObservable();
    }

    /** Setter and Getter for Loyalty Config */
    set loyaltyConfig(value: LoyaltyConfig[]) {
        this._loyaltyConfig.next(value);
    }
    get loyaltyConfig$(): Observable<LoyaltyConfig[]> {
        return this._loyaltyConfig.asObservable();
    }
    
    /** Setter and Getter for Loyalty Config Paginations */
    set loyaltyConfigPagination(value: Pagination) {
        // Store the value
        this._loyaltyConfigPagination.next(value);
    }

    get loyaltyConfigPagination$(): Observable<Pagination> {
        return this._loyaltyConfigPagination.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ APIs
    // -----------------------------------------------------------------------------------------------------

    getAgingData(
        params: {
            page?: number;
            pageSize?: number;
            month?: number;
            year?: number;
            channel?: string;
        } = {
                page: 1,
                pageSize: 20,
                month: null,
                year: null,
                channel: null,
            }
    ): Observable<any> {
        let loyaltyService = this._apiServer.settings.serviceUrl.loyaltyService;

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
            params: params,
        };

        return this._httpClient
            .get<any>(
                loyaltyService + '/admin/api/get-aging-data',
                header
            )
            .pipe(
                map((response) => {
                    const agingDataList = response.data.records;

                    this._logging.debug(
                        'Response from Loyalty Service (getAgingData)',
                        response
                    );

                    const agingDataPagination = {
                        length: response.data.pagination.length,
                        size: response.data.pagination.size,
                        page: response.data.pagination.page,
                        lastPage: response.data.pagination.lastPage,
                        startIndex: response.data.pagination.startIndex,
                        endIndex: response.data.pagination.endIndex,
                    };

                    //  return pagination
                    this._agingDataPagination.next(agingDataPagination);

                    // return data
                    this._agingData.next(agingDataList);

                    return agingDataList;
                })
            );
        }

    getTopEarner(
        params: {
            type?: string;
            channel?: string;
        } = {
            type: 'ALL',
            channel: null
        }
    ): Observable<any> {
        let loyaltyService = this._apiServer.settings.serviceUrl.loyaltyService;

        const header = {
            params,
        };

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

        return this._httpClient
            .get<any>(
                loyaltyService + '/admin/api/get-top-earner',
                header
            )
            .pipe(
                map((response) => {
                    const topEarnerList = response.data;

                    this._logging.debug(
                        'Response from Loyalty Service (getTopEarner)',
                        response
                    );

                    // return data
                    this._topEarner.next(topEarnerList);

                    return topEarnerList;
                })
            );
        }

    getAllCoinsHistory(
        params: {
            page?: number;
            pageSize?: number;
            search?: string;
            type?: string;
            channel?: string;
            startDate?: string;
            endDate?: string;
        } = {
                page: 1,
                pageSize: 20,
                search: null,
                type: 'ALL',
                channel: 'ALL',
                startDate: null,
                endDate: null,
            }
    ): Observable<any> {
        let loyaltyService = this._apiServer.settings.serviceUrl.loyaltyService;

        const header = {
            params,
        };

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

        return this._httpClient
            .get<any>(
                loyaltyService + '/admin/api/get-coins-history',
                header
            )
            .pipe(
                map((response) => {
                    const coinsHistoryList = response.data.records;

                    this._logging.debug(
                        'Response from Loyalty Service (getAllCoinsHistory)',
                        response
                    );

                    const coinsHistoryPagination = {
                        length: response.data.pagination.length,
                        size: response.data.pagination.size,
                        page: response.data.pagination.page,
                        lastPage: response.data.pagination.lastPage,
                        startIndex: response.data.pagination.startIndex,
                        endIndex: response.data.pagination.endIndex,
                    };

                    //  return pagination
                    this._coinsHistoryPagination.next(coinsHistoryPagination);

                    // return data
                    this._coinsHistory.next(coinsHistoryList);

                    return coinsHistoryList;
                })
            );
        }

    getAllMembers(
        params: {
            page?: number;
            pageSize?: number;
            search?: string;
            channel?: string;
            status?: string;
            type?: string;
        } = {
                page: 1,
                pageSize: 20,
                search: null,
                channel: 'ALL',
                status: 'ALL',
                type: null,
            }
    ): Observable<any> {
        let loyaltyService = this._apiServer.settings.serviceUrl.loyaltyService;

        const header = {
            params,
        };

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

        return this._httpClient
            .get<any>(
                loyaltyService + '/admin/api/get-members-list',
                header
            )
            .pipe(
                map((response) => {
                    const membersList = response.data.records;

                    this._logging.debug(
                        'Response from Loyalty Service (getAllMembers)',
                        response
                    );

                    const membersListPagination = {
                        length: response.data.pagination.length,
                        size: response.data.pagination.size,
                        page: response.data.pagination.page,
                        lastPage: response.data.pagination.lastPage,
                        startIndex: response.data.pagination.startIndex,
                        endIndex: response.data.pagination.endIndex,
                    };

                    //  return pagination
                    this._membersListPagination.next(membersListPagination);

                    // return data
                    this._membersList.next(membersList);

                    return membersList;
                })
            );
        }

    getReferralTree(
        params: {
            phone?: string;
            channel?: string;
        } = {
            phone: null,
            channel: null,
        }
    ): Observable<any> {
        let loyaltyService = this._apiServer.settings.serviceUrl.loyaltyService;

        const header = {
            params,
        };

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

        return this._httpClient
            .get<any>(
                loyaltyService + '/admin/api/get-referral-tree',
                header
            )
            .pipe(
                map((response) => {
                    const referralTree = response.data;

                    this._logging.debug(
                        'Response from Loyalty Service (getReferralTree)',
                        response
                    );

                    // return data
                    this._referralTree.next(referralTree);

                    return referralTree;
                })
            );
        }

    getMicroDealer(
        params: {
            page?: number;
            pageSize?: number;
            channel?: string;
        } = {
                page: 1,
                pageSize: 100,
                channel: 'ALL',
            }
    ): Observable<any> {
        let loyaltyService = this._apiServer.settings.serviceUrl.loyaltyService;

        const header = {
            params,
        };

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

        return this._httpClient
            .get<any>(loyaltyService + '/micro-dealer/get-users-list', header)
            .pipe(
                map((response) => {
                    const microDealerList = response.data.records;

                    this._logging.debug(
                        'Response from Loyalty Service (getMicroDealer)',
                        response
                    );

                    // return data
                    this._microDealer.next(microDealerList);

                    return microDealerList;
                })
            );
        }

    setMicrodealer( 
        params: { 
            phone?: string; 
            channel?: string; 
        } = { 
            phone: null, 
            channel: 'ALL' 
        }
    ): Observable<any> {
        let loyaltyService = this._apiServer.settings.serviceUrl.loyaltyService;
    
        const header = {
            params,
        };
    
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
    
        return this._httpClient
            .post<any>(loyaltyService + '/micro-dealer/setup-dealers', null, header)
            .pipe(
                catchError((error) => {
                    this._logging.error('Error add new Microdealer:', error);
                    return throwError(error);
                }),
                map((response) => {
                    this._logging.debug('Response from Loyalty Service (setMicrodealer)', response);
                    return response;
                })
            );
        }

    updateDealerStatus(
        params: {
            phone?: string;
            channel?: string;
            status?: string;
        } = {
            phone: null,
            channel: null,
            status: null,
        }
    ): Observable<any> {
        let loyaltyService = this._apiServer.settings.serviceUrl.loyaltyService;
        const header = {
            params,
        };

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

        return this.microDealers$.pipe(
            take(1),
            switchMap((microDealers) =>
                this._httpClient
                    .put<any>(loyaltyService + '/micro-dealer/update-status/' + params.phone, null, header)
                    .pipe(
                        catchError((error) => {
                            this._logging.error(
                                'Error updating microdealer',
                                error
                            );
                            return throwError(error);
                        }),
                        map((response) => {
                            this._logging.debug(
                                'Response from Loyalty Service (updateDealerStatus)',
                                response
                            );
                            return response;
                        })
                    )
                )
            );
        }

    getReferralUsers(params: {
        channel: string;
        page: number;
        pageSize: number;
    } = {
        channel: 'ALL',
        page: null,
        pageSize: null,
    }): Observable<any> {
        let profileService = this._apiServer.settings.serviceUrl.profileService;
        
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
                )   
                {
                    delete params[key];
                }
        });
        
        const header = {
            params,
        };
        
        // console.log('Request Parameters:', params);
        
        return this._httpClient
        .get<any>(profileService + '/admin-referral/get-referral-users', header)
        .pipe(
            tap((response) => {
            // console.log('API Response:', response);
            const userList = response ? response.context.records : [];

            const userListPagination = {
                length: response.context.pagination.length,
                size: response.context.pagination.size,
                page: response.context.pagination.page,
                lastPage: response.context.pagination.lastPage,
                startIndex: response.context.pagination.startIndex,
                endIndex: response.context.pagination.endIndex,
            };

            //  return pagination
            this._referralUsersPagination.next(userListPagination);
            this._referralUsers.next(userList);
            })
        );
    }

    setReferralUser(phone: string, refCode: string, params: { channel: string } = { channel: null }): Observable<any> {
        let profileService = this._apiServer.settings.serviceUrl.profileService;

        const header = {
            params,
        };

        return this._httpClient.post<any>(profileService + '/admin-referral/add/' + phone + '/' + refCode, null, header).pipe(
            catchError((error) => {
                this._logging.error(
                    'Error setting referral code to user:',
                    error
                );
                return throwError(error);
            }),
            map((response) => {
                this._logging.debug(
                    'Response from Bill Service (setReferralUser)',
                    response
                );

                return response;
            })
        );
    }

    removeAgentUser(phone: string, params: { channel: string } = { channel: null }): Observable<Conversion> {
        let profileService = this._apiServer.settings.serviceUrl.profileService;

        const header = {
            params
        };

        return this._httpClient.put<any>(profileService + '/admin-referral/remove-referral-code/' + phone, null, header).pipe(
            catchError((error) => {
                this._logging.error(
                    'Error remove referral code from agent user:',
                    error
                );
                return throwError(error);
            }),
            map((response) => {
                this._logging.debug(
                    'Response from Loyalty Service (removeAgentUser)',
                    response
                );

                return response;
            })
        );
    }
        
    getAllConversions(
        params: {
            page?: number;
            pageSize?: number;
            searchKey?: string;
            sortBy?: string;
            sortOrder?: string;
        } = {
                page: null,
                pageSize: null,
                searchKey: null,
                sortBy: null,
                sortOrder: null,
            }
    ): Observable<any> {
        let loyaltyService = this._apiServer.settings.serviceUrl.loyaltyService;

        const header = {
            params,
        };

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

        return this._httpClient
            .get<any>(loyaltyService + '/conversion-setup/get-conversions', header)
            .pipe(
                map((response) => {
                    const conversionList = response.data.data;

                    this._logging.debug(
                        'Response from Loyalty Service (getAllConversions)',
                        response
                    );

                    const conversionPagination = {
                        length: response.data.pagination.length,
                        size: response.data.pagination.size,
                        page: response.data.pagination.page,
                        lastPage: response.data.pagination.lastPage,
                        startIndex: response.data.pagination.startIndex,
                        endIndex: response.data.pagination.endIndex,
                    };

                    //  return pagination
                    this._conversionPagination.next(conversionPagination);

                    // return data
                    this._conversion.next(conversionList);

                    return conversionList;
                })
            );
        }
        
        updateConversions(id: string, body: Conversion): Observable<any> {
            let loyaltyService = this._apiServer.settings.serviceUrl.loyaltyService;
    
            if (body.serviceConversions.length > 0) {
                Object.keys(body).forEach((key) => {
                    if (Array.isArray(body[key])) {
                        body[key] = body[key].filter((element) => element !== null);
                    }
                    if (
                        body[key] === null ||
                        body[key] === undefined ||
                        body[key] === '' ||
                        (Array.isArray(body[key]) && body[key].length === 0)
                    ) {
                        delete body[key];
                    }
                });
            }
    
            return this.conversion$.pipe(
                take(1),
                switchMap((conversion) =>
                    this._httpClient
                        .put<any>(loyaltyService + '/conversion-setup/update/' + id, body)
                        .pipe(
                            map((response) => {
                                this._logging.debug(
                                    'Response from Loyalty Service (updateConversions)',
                                    response
                                );
    
                                const index = conversion.findIndex(
                                    (item) => item._id === body._id
                                );
                                // debugger;
                                if (response.status === 200) {
                                    if (index >= 0) {
                                        conversion[index].channel = body.channel;
                                        conversion[index].expiryDuration =
                                            body.expiryDuration;
                                        conversion[index].serviceConversions =
                                            body.serviceConversions;
                                    }
                                    // Update Conversions
                                    this._conversion.next(conversion);
    
                                    return conversion[index];
                                }
    
                                return conversion[index];
                            })
                        )
                )
            );
        }

        createConversion(body: Conversion): Observable<any> {
            let loyaltyService = this._apiServer.settings.serviceUrl.loyaltyService;
    
            // Delete empty value body
            Object.keys(body).forEach((key) => {
                if (Array.isArray(body[key])) {
                    body[key] = body[key].filter((element) => element !== null);
                }
                if (
                    body[key] === null ||
                    body[key] === undefined ||
                    body[key] === '' ||
                    (Array.isArray(body[key]) && body[key].length === 0)
                ) {
                    delete body[key];
                }
            });
    
            // Log the body before making the service call
            this._logging.debug('Request body before service call', body);
    
            return this.conversion$.pipe(
                take(1),
                switchMap((conversion) =>
                    this._httpClient
                        .post<any>(loyaltyService + '/conversion-setup/store', body)
                        .pipe(
                            catchError((error) => {
                                this._logging.error(
                                    'Error creating conversion:',
                                    error
                                );
                                return throwError(error);
                            }),
                            map((response) => {
                                this._logging.debug(
                                    'Response from Loyalty Service (createConversion)',
                                    response
                                );
                                const newConversion = response.data;
                                conversion.unshift(newConversion);
                                // Update the conversions
                                this._conversion.next(conversion);
                                return newConversion;
                            })
                        )
                )
            );
        }

        getLoyaltyConfig(
            params: { page: number, pageSize: number } = { page: null, pageSize: null }): Observable<any> {
                let loyaltyService = this._apiServer.settings.serviceUrl.loyaltyService;
    
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
                params,
            };
    
            return this._httpClient
                .get<any>(
                    loyaltyService + '/loyalty-config/get-list',
                    header
                )
                .pipe(
                    map((response) => {
                        const loyaltyConfig = response.data.records;
    
                        this._logging.debug(
                            'Response from Loyalty Service (getLoyaltyConfig)',
                            response
                        );
    
                        // return data
                        this._loyaltyConfig.next(loyaltyConfig);
    
                        return loyaltyConfig;
                    })
                );
        }

        setLoyaltyConfig(body: any): Observable<any> {
            let loyaltyService = this._apiServer.settings.serviceUrl.loyaltyService;
        
            return this._httpClient.post<any>(loyaltyService + '/loyalty-config/store', body)
                .pipe(
                    map((response) => {
                        if (response.code === 200) {
                            this._logging.debug('Loyalty config created successfully', response);
                            return response.data;
                        } else {
                            throw new Error(response.message);
                        }
                    }),
                    catchError((error) => {
                        this._logging.error('Error creating loyalty config', error);
                        return throwError(error);
                    })
                );
        }
        
        /* setLoyaltyConfig(body: any): Observable<any> {
            let loyaltyService = this._apiServer.settings.serviceUrl.loyaltyService;
    
            return this._httpClient.post<any>(loyaltyService + '/loyalty-config/store', body).pipe(
                catchError((error) => {
                    this._logging.error(
                        'Error setting setting up loyalty config:',
                        error
                    );
                    return throwError(error);
                }),
                map((response) => {
                    this._logging.debug(
                        'Response from Loyalty Service (setLoyaltyConfig)',
                        response
                    );
    
                    return response;
                })
            );
        } */

        /* editLoyaltyConfig(id: string, body: any): Observable<Conversion> {
            let loyaltyService = this._apiServer.settings.serviceUrl.loyaltyService;
    
            return this._httpClient.put<any>(loyaltyService + '/loyalty-config/update/' + id, body).pipe(
                catchError((error) => {
                    this._logging.error(
                        'Error updating loyalty config',
                        error
                    );
                    return throwError(error);
                }),
                map((response) => {
                    this._logging.debug(
                        'Response from Loyalty Service (editLoyaltyConfig)',
                        response
                    );
    
                    return response;
                })
            );
        } */

        editLoyaltyConfig(id: string, body: any): Observable<any> {
            let loyaltyService = this._apiServer.settings.serviceUrl.loyaltyService;
        
            return this._httpClient.put<any>(loyaltyService + '/loyalty-config/update/' + id, body)
                .pipe(
                    map((response) => {
                        if (response.code === 200) {
                            this._logging.debug('Loyalty config updated successfully', response);
                            return response.data;
                        } else {
                            throw new Error(response.message);
                        }
                    }),
                    catchError((error) => {
                        this._logging.error('Error updating loyalty config', error);
                        return throwError(error);
                    })
                );
        }            
}