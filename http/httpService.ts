import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { HttpOptions } from './httpOptions';
import { EventEmitter } from '@angular/core';
const GET = 'GET';
const POST = 'POST';
const PUT = 'PUT';
const DELETE = 'DELETE';
const PATCH = 'PATCH';

@Injectable()
export class HttpService {
    /**
    * The request initialized event emitter
    * @event requestInit event triggered before executing a http request
    */
    requestInit = new EventEmitter();
    /**
    * The request resolved event emitter
    * @event requestResolved event triggered after request if is resolved without errors
    */
    requestResolved = new EventEmitter();
    /**
    * The request failed event emitter
    * @event requestFailed event triggered after request if is rejected with errors
    */
    requestFailed = new EventEmitter();

    constructor(private http: Http) {
    }

    /** 
    * Http GET request
    * @param url resource url
    * @param options request options
    **/
    public get(url: string, options?: HttpOptions): Promise<any> {
        this.emitRequestInitEventFor(GET, options);
        return new Promise((resolve, reject) => {
            this.http.get(url, options).subscribe((res: any) => {
                this.emitRequestResolvedEventFor(GET, options);
                resolve(res);
            }, (err) => {
                this.emitRequestFailedEventFor(GET, options);
                reject(err);
            });
        });
    }

    private emitRequestInitEventFor(verb, options) {
        this.requestInit.emit({ value: { type: verb, options } });
    }

    private emitRequestResolvedEventFor(verb, options) {
        this.requestResolved.emit({ value: { type: verb, options } });
    }

    private emitRequestFailedEventFor(verb, options) {
        this.requestFailed.emit({ value: { type: verb, options } });
    }

    /** 
    * Http POST request
    * @param url resource url
    * @param options request options
    **/
    post(url: string, options: HttpOptions = new HttpOptions()): Promise<any> {
        this.emitRequestInitEventFor(POST, options);
        return new Promise((resolve, reject) => {
            this.http.post(url, options.data, options).subscribe((res: any) => {
                this.emitRequestResolvedEventFor(POST, options);
                resolve(res);
            }, (err) => {
                this.emitRequestFailedEventFor(POST, options);
                reject(err);
            });
        });
    }

    /** 
    * Http PUT request
    * @param url resource url
    * @param options request options
    **/
    put(url: string, options: HttpOptions = new HttpOptions()): Promise<any> {
        this.emitRequestInitEventFor(PUT, options);
        return new Promise((resolve, reject) => {
            this.http.put(url, options, options).subscribe((res: any) => {
                this.emitRequestResolvedEventFor(PUT, options);
                resolve(res);
            }, (err) => {
                this.emitRequestFailedEventFor(PUT, options);
                reject(err);
            });
        });
    }

    /** 
    * Http DELETE request
    * @param url resource url
    * @param options request options
    **/
    delete(url: string, options?: HttpOptions): Promise<any> {

        this.emitRequestInitEventFor(DELETE, options);
        return new Promise((resolve, reject) => {
            this.http.delete(url, options).subscribe((res: any) => {
                this.emitRequestResolvedEventFor(DELETE, options);
                resolve(res);
            }, (err) => {
                this.emitRequestFailedEventFor(DELETE, options);
                reject(err);
            });
        });
    }

    /** 
    * Http PATCH request
    * @param url resource url
    * @param options request options
    **/
    patch(url: string, body: any, options?: HttpOptions): Promise<any> {

        this.emitRequestInitEventFor(PATCH, options);
        return new Promise((resolve, reject) => {
            this.http.patch(url, body, options).subscribe((res: any) => {
                this.emitRequestResolvedEventFor(PATCH, options);
                resolve(res);
            }, (err) => {
                this.emitRequestFailedEventFor(PATCH, options);
                reject(err);
            });
        });
    }
}
