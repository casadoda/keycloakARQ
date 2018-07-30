import { RequestOptionsArgs } from '@angular/http';

/**
 * http requests options
 */
export class HttpOptions implements RequestOptionsArgs {
    /**
     * Data to be sent. Only in POST and PUT requests.
     **/
    data: any;
    /** 
    * Headers to be sent with the request. 
    * Must be a well defined object. Example {'Content-Type': 'json'}
    **/
    headers: any = {};
    /**
     * Defines the response type.
     **/
    responseType: any;
}
