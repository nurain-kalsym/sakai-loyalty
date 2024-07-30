import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, ReplaySubject } from "rxjs";
import { Aging, Pagination } from "./loyalty.types";
import { HttpClient } from "@angular/common/http";
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
                        'Response from Bill Service (getAgingData)',
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

}