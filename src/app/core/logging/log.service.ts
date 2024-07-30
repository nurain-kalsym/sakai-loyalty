import { Injectable } from '@angular/core';
import { AppConfig } from 'src/app/config/service.config';

export enum LogLevel {
    All = 0,
    Debug = 1,
    Info = 2,
    Warn = 3,
    Error = 4,
    Fatal = 5,
    Off = 6
}

@Injectable({
    providedIn: 'root'
})
export class LogService {

    level: LogLevel = LogLevel.All;
    logWithDate: boolean = true;
    
    constructor(
        private _appConfig: AppConfig,
    ){    
    }
        
    debug(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.Debug, optionalParams);
    }

    info(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.Info, optionalParams);
    }

    warn(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.Warn, optionalParams);
    }

    error(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.Error, optionalParams);
    }

    fatal(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.Fatal, optionalParams);
    }

    log(msg: string, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.All, optionalParams);
    }

    loadLevel(){
        return this.level = this._appConfig.settings.logging;
    }

    private writeToLog(msg: string, level: LogLevel, params: any[]) {
        this.loadLevel();
        if (this.shouldLog(level)) {
            let value: string = "";
            
            // Build log string
            if (this.logWithDate) {
                value = new Date() + "\n";
            }
            
            value += "Type: " + LogLevel[this.level];
            if (params.length === 1) {
                value += "\nExtra Info: ";
                console.groupCollapsed(msg);
                console.log(value,params);
                console.groupEnd();
            } else {
                value += "\nMessage: " + msg;
                if (params.length > 1) {
                    value += "\nExtra Info: " + this.formatParams(params);
                }
                console.log(value);
            }
            
            // Log the value
        }
    }

    private shouldLog(level: LogLevel): boolean {
        let ret: boolean = false;
        if ((level >= this.level && level !== LogLevel.Off) || this.level === LogLevel.All) {
            ret = true;
        }
        return ret;
    }

    private formatParams(params: any[]): string {
        let ret: string = params.join(",");
        
        // Is there at least one object in the array?
        if (params.some(p => typeof p == "object")) {
            ret = "";
            
            let i = 0;
            // Build comma-delimited string
            for (let item of params) {
                if (i==0)
                  ret += JSON.stringify(item);
                else
                  ret += "," + JSON.stringify(item);
                i++;
            }
        } 
        return ret;
    }
}

