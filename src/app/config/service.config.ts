import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IAppConfig } from './service.model';
import { environment } from 'src/environments/environment';

@Injectable()
export class AppConfig {
    public settings: IAppConfig;
    static settings: IAppConfig;
    constructor(private http: HttpClient) { }
    load() {
        const jsonFile = `assets/dev/config/config.${environment.name}.json`;
        return new Promise<void>((resolve, reject) => {
            this.http.get(jsonFile).toPromise().then((response : IAppConfig) => {
               this.settings = <IAppConfig>response;
               AppConfig.settings = <IAppConfig>response;
               resolve();
            }).catch((response: any) => {
               reject(`Could not load file '${jsonFile}': ${JSON.stringify(response)} : ${response}`);
            });
        });
    }
}
