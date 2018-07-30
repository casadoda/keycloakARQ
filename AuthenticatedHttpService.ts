import { Injectable } from '@angular/core';
import { HttpService } from './http/httpService';
import { HttpOptions } from './http/httpOptions';
import { Exception } from './exception';
import {KeycloakService} from './keycloak.service'

/**
* The authenticated http service is a service for doing http request
* with a configured authentication token in header.
**/
@Injectable() 
export class AuthenticatedHttpService {

    /**
    * Token which allows user to fetch a specific resource.
    * - without using their username and password. Once their token has 
    * been obtained (by login for example), the user can offer the token 
    * - which offers access to a specific resource for a time period - to the remote site.
    **/
    private authenticationToken: string;


    private getDefaultHeaders: () => {};

    /** 
    * @param http Http service base [[HttpService]] that will be called with decorated
    * options - authentication token in header.
    **/
    constructor(private http: HttpService, private keycloakService: KeycloakService) {
    }


    /** 
    * Configures the authenticated http service
    **/
    public configure(getDefaultHeaders: () => {}) {
        this.getDefaultHeaders = getDefaultHeaders;
    }

    

    /** 
    * Http GET request
    * @param url resource url
    * @param options request options
    **/
    public get(url: string, options: HttpOptions = new HttpOptions()): Promise<any> {      
      if (!options)
        options = new HttpOptions();

      return new Promise((resolve, reject) => {         
        this.configureAuthenticationHeaderIn(options).then( () => {          
          return this.http.get(url, options).then ( (any) => {resolve(any)}
            ). catch( (error) => {reject(error)});
        });
      });        
    }

    /** 
    * Http POST request with authentication
    * @param url resource url
    * @param options request options
    **/
    post(url: string, options: HttpOptions = new HttpOptions()): Promise<any> {
      if (!options)
        options = new HttpOptions();
      return new Promise((resolve, reject) => {         
        this.configureAuthenticationHeaderIn(options).then( () => {
          return this.http.post(url, options).then ( (any) => {resolve(any)}
            ). catch( (error) => {reject(error)});
        });
      });
    }

    /** 
    * Http PUT request with authentication
    * @param url resource url
    * @param options request options
    **/
    
    put(url: string, options: HttpOptions = new HttpOptions()): Promise<any> {
        if (!options)
          options = new HttpOptions();
        return new Promise((resolve, reject) => {         
        this.configureAuthenticationHeaderIn(options).then( () => {
          return this.http.put(url, options).then ( (any) => {resolve(any)}
            ). catch( (error) => {reject(error)});
        });
      });
    }

    /** 
    * Http DELETE request with authentication
    * @param url resource url
    * @param options request options
    **/
    
    delete(url: string, options: HttpOptions = new HttpOptions()): Promise<any> {
        if (!options)
          options = new HttpOptions();
        return new Promise((resolve, reject) => {         
        this.configureAuthenticationHeaderIn(options).then( () => {
          return this.http.delete(url, options).then ( (any) => {resolve(any)}
            ). catch( (error) => {reject(error)});
        });
      });
    }

    /** 
    * Http PATCH request with authentication
    * @param url resource url
    * @param options request options
    **/
    
    patch(url: string, body: any, options: HttpOptions = new HttpOptions()): Promise<any> {
        if (!options)
          options = new HttpOptions();
        return new Promise((resolve, reject) => {         
        this.configureAuthenticationHeaderIn(options).then( () => {
          return this.http.patch(url, options).then ( (any) => {resolve(any)}
            ). catch( (error) => {reject(error)});
        });
      });
    }
    

    private configureAuthenticationHeaderIn(options: HttpOptions = new HttpOptions()): Promise<any> {
        return new Promise((resolve, reject) => {      
          this.keycloakService.getToken()
            .then( (token) => {
                let optionsHeaders = options.headers || {};
                let finalHeaders = this.getDefaultHeaders ? Object.assign({}, this.getDefaultHeaders(), optionsHeaders) : optionsHeaders;
                options.headers = finalHeaders;
                options.headers.Authorization = `Bearer ${token}`;
                resolve();
            }).catch( (error) => {               
               throw new Exception(`[AuthenticatedHttpService]: ` +
                `you can't use this service without token.`+ error);
            });
         });  


    }
}
