import {Injectable} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

//declare var Keycloak: any;
import * as Keycloak_ from 'keycloak-js';
export const Keycloak = Keycloak_;


import { Observable, Observer, Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


import { KeycloakEvent, KeycloakEventType } from './interfaces/keycloak-event';

@Injectable()
export class KeycloakService {

	 /**
   * Keycloak-js instance.
   */
   //private _instance: any; //Keycloak.KeycloakInstance;
   private _instance: Keycloak.KeycloakInstance;

   private _userProfile: Keycloak.KeycloakProfile;

   private _hasBeenInitialized = new BehaviorSubject(false);

    /**
   * Observer for the keycloak events
   */
  private _keycloakEvents$: Subject<KeycloakEvent>;

  constructor() {
    this._keycloakEvents$ = new Subject<KeycloakEvent>();
  }
	

	isReady(): BehaviorSubject<boolean> {
		return  this._hasBeenInitialized;
	}


	/**
	 * @returns
   * A Promise with a boolean indicating if the initialization was successful.
   */
	init(config?: any): Promise<boolean> {
		//this.keycloakAdapter = new Keycloak('assets/keycloak.json');
		/***
		@see https://www.keycloak.org/docs/3.3/securing_apps/topics/oidc/javascript-adapter.html#_javascript_adapter
			new Keycloak();
			new Keycloak('http://localhost/keycloak.json');
			new Keycloak({ url: 'http://localhost/auth', realm: 'myrealm', clientId: 'myApp' });
		*/
		if (this._hasBeenInitialized.getValue())
			this._hasBeenInitialized.next(false);

		if (config) {
			console.log('init keycloak by json '+config);
			console.log(JSON.stringify(config));
			this._instance = Keycloak(config);
			
		} else {
			console.log('init keycloak by file');
			this._instance = Keycloak('assets/keycloak.json');
		}
        
		this.bindsKeycloakEvents();
		
        
		return new Promise((resolve, reject) => {
			 	/*
					However, there are two options available to make the adapter automatically authenticate. 
					You can pass login-required or check-sso to the init function. 
					login-required will authenticate the client if the user is logged-in to Keycloak or display the login page if not. 
					check-sso will only authenticate the client if the user is already logged-in, if the user is not logged-in the browser 
					will be redirected back to the application and remain unauthenticated.
			 	*/
            	this._instance.init({ onLoad: 'check-sso',  checkLoginIframe: false}) //,  checkLoginIframe: false}) si se deja por defecto es true, y si no hay session
            													// lanza un error en una promise desde adapter que provoca un error al no tener
            													// success defindo.
	                .success(  authenticated => {
	                	this._hasBeenInitialized.next(true); //Notificar que se ha inicializado
	                	console.log("is authenticated:  "+authenticated);

	                	if (authenticated) {
	                		 //await this.loadUserProfile();

	                    	//this.keycloakAdapter.loggedIn = true;
	                    	//this._instance.authz = this.keycloakAdapter;
	                    	/*this._instance.logoutUrl = 
	                    		this._instance.authServerUrl + 
	                    		"/realms/" + 
	                    		this._instance.realm + 
	                    		"/protocol/openid-connect/logout?redirect_uri=" +
	                    		document.baseURI; */
	 					}
	                    resolve(authenticated);
	                })
                	.error(() => {
                		
                    	reject('An error happened during Keycloak initialization.');
                	});        
			
		});
	}


	/**
   * Redirects to login form on (options is an optional object with redirectUri and/or
   * prompt fields).
   *
   * @param options
   * Object, where:
   *  - redirectUri: Specifies the uri to redirect to after login.
   *  - prompt:By default the login screen is displayed if the user is not logged-in to Keycloak.
   * To only authenticate to the application if the user is already logged-in and not display the
   * login page if the user is not logged-in, set this option to none. To always require
   * re-authentication and ignore SSO, set this option to login .
   *  - maxAge: Used just if user is already authenticated. Specifies maximum time since the
   * authentication of user happened. If user is already authenticated for longer time than
   * maxAge, the SSO is ignored and he will need to re-authenticate again.
   *  - loginHint: Used to pre-fill the username/email field on the login form.
   *  - action: If value is 'register' then user is redirected to registration page, otherwise to
   * login page.
   *  - locale: Specifies the desired locale for the UI.
   * @returns
   * A void Promise if the login is successful and after the user profile loading.
   */
  login(options: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {    	
      this._instance
        .login(options)
        .success(  () => {
          //await this.loadUserProfile();
          resolve();
        })
        .error(error => {
          reject('An error happened during the login.');
        });
    });
  }


  /**
   * Check if user is logged in.
   *
   * @returns
   * A boolean that indicates if the user is logged in.
   */
  isLoggedIn(): Promise<boolean> {    

    return new Promise((resolve, reject) => {
        this.updateToken(20).then(() => {         
            resolve(true);
         }).catch( (error) => {           
            resolve(false);
         });
    });
   

      /* TS 2.1 try {
        await this.updateToken(20);
        resolve(true);
      } catch (error) {
        resolve(false);
      }
    }); */  
  }

   isTokenExpired(minValidity: number = 0): boolean {
    return this._instance.isTokenExpired(minValidity);
  }

   /**
   * If the token expires within minValidity seconds the token is refreshed. If the
   * session status iframe is enabled, the session status is also checked.
   * Returns a promise telling if the token was refreshed or not. If the session is not active
   * anymore, the promise is rejected.
   *
   * @param minValidity
   * Seconds left. (minValidity is optional, if not specified 5 is used)
   * @returns
   * Promise with a boolean indicating if the token was succesfully updated.
   */
  updateToken(minValidity: number = 5): Promise<boolean> {
    return new Promise( (resolve, reject) => {
      if (!this._instance) {
        reject(false);
        return;
      }
      
      this._instance
        .updateToken(minValidity)
        .success(refreshed => {        	
          resolve(refreshed);
        })
        .error(error => {
          reject('Failed to refresh the token, or the session is expired');
        }); 
    });
  }

  /**
   * Redirects to logout.
   *
   * @param redirectUri
   * Specifies the uri to redirect to after logout.
   * @returns
   * A void Promise if the logout was successful, cleaning also the userProfile.
   */
  logout(redirectUri?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const options: any = {
        redirectUri
      };

      this._instance
        .logout(options)
        .success(() => {
          //this._userProfile = undefined!;
          resolve();
        })
        .error(error => {
          reject('An error happened during logout.');
        });
    });
  }

    /**
   * Loads the users profile.
   * Returns promise to set functions to be invoked if the profile was loaded successfully, or if
   * the profile could not be loaded.
   *
   * @param forceReload
   * If true will force the loadUserProfile even if its already loaded.
   * @returns
   * A promise with the KeycloakProfile data loaded.
   */
  /*loadUserProfile(forceReload: boolean = false): Promise<Keycloak.KeycloakProfile> {
    return new Promise(async (resolve, reject) => {
      if (this._userProfile && !forceReload) {
        return resolve(this._userProfile);
      }

      this._instance
        .loadUserProfile()
        .success(result => {
          this._userProfile = result as Keycloak.KeycloakProfile;
          resolve(this._userProfile);
        })
        .error(err => {
          reject('The user profile could not be loaded.');
        });
    });
  } */


    /**
   * Returns the authenticated token, calling updateToken to get a refreshed one if
   * necessary. If the session is expired this method calls the login method for a new login.
   *
   * @returns
   * Promise with the generated token.
   */
  getToken(): Promise<string> {
    return new Promise( (resolve, reject) => {     

      this.updateToken(10)
        .then(  (refreshed) => {                  
             resolve(this._instance.token);            
        }).catch( () => {
          this.login();          
        });
      /* TS 2.1 try {
      	
        await this.updateToken(10);
        
        resolve(this._instance.token);
      } catch (error) {
        this.login();
        
      } */


    });
  }  

  /*getToken(): string {
  	if (this._instance.authenticated)
  		return this._instance.token;
  	else
  		return null;
  } */

  getTokenParsed(): any { //it's a JSON
  	if (this._instance.authenticated)
  		return this._instance.tokenParsed;
  	else
  		return null;
  }

  /**
   * Returns the logged username.
   *
   * @returns
   * The logged username.
   */
  getUsername(): string {    
    if (this._instance.authenticated)
    	return this._instance.tokenParsed["preferred_username"];

   	return null;
  }

  /**
   * Returns the logged subject.
   *
   * @returns
   * The logged subject.
   */
  getSubject(): string {    
    if (this._instance.authenticated)
      return this._instance.subject;

     return null;
  }

  getClientId(): string {
  	if (this._instance.authenticated)
  		return this._instance.clientId;		
  	else
  		return null;
  }

  getFullName(): string {
  	if (this._instance.authenticated)
  		return this._instance.tokenParsed['name'];
  	else
  		return null;
		//return KeycloakService.auth.authz.tokenParsed.name;
	}

  getResourceRoles(): string[] {
  		if (this._instance.authenticated)
  			if (this._instance.tokenParsed.resource_access) 
  				if (this._instance.tokenParsed.resource_access[this._instance.clientId])  				
  					return this._instance.tokenParsed.resource_access[this._instance.clientId].roles;
  				
  			
  		//return this._instance.tokenParsed.resource_access[this._instance.clientId].roles;

  		return null;
		/*console.log(KeycloakService.auth.authz.clientId);
		console.log(KeycloakService.auth.authz.tokenParsed);
		return KeycloakService.auth.authz.tokenParsed.resource_access[KeycloakService.auth.authz.clientId].roles; */
  }

  getRealmRoles(): string[] {
  		
  		if (this._instance.authenticated)
  			if (this._instance.tokenParsed.realm_access) 
  				return this._instance.tokenParsed.realm_access.roles;  			
  		
  		//return this._instance.tokenParsed.resource_access[this._instance.clientId].roles;

  		return null;
		/*console.log(KeycloakService.auth.authz.clientId);
		console.log(KeycloakService.auth.authz.tokenParsed);
		return KeycloakService.auth.authz.tokenParsed.resource_access[KeycloakService.auth.authz.clientId].roles; */
  }

  
  getExpDate(): number {
  	if (this._instance.authenticated)
		return this._instance.tokenParsed.exp;		

	return null;
  }

  hasResourceRole(rol: string): boolean {
  	if (this._instance.authenticated)
  		return this._instance.hasResourceRole(rol);

  	return null;
  }



  /**
  	Check if the user has one of the roles asked in the current client_id. 
  */
  hasAnyRoleInResource(roles: string[]): boolean {
  	let userResourceRoles: string[] = this.getResourceRoles();

  	
  	if (roles && roles instanceof Array && roles.length>0 && userResourceRoles)
  	{
  		return roles.some( (value) => {return userResourceRoles.indexOf(value)>=0 });
  	}
  	return false;
  }


/**
   * Binds the keycloak-js events to the keycloakEvents Subject
   * which is a good way to monitor for changes, if needed.
   *
   * The keycloakEvents returns the keycloak-js event type and any
   * argument if the source function provides any.
   */
  private bindsKeycloakEvents(): void {
    if (!this._instance) {
      console.warn(
        'Keycloak Angular events could not be registered as the keycloak instance is undefined.'
      );
      return;
    }

   
    this._instance.onAuthError = errorData => {
      this._keycloakEvents$.next({ args: errorData, type: KeycloakEventType.OnAuthError });
    };

    this._instance.onAuthLogout = () => {
      this._keycloakEvents$.next({ type: KeycloakEventType.OnAuthLogout });
    };

    this._instance.onAuthRefreshError = () => {
      this._keycloakEvents$.next({ type: KeycloakEventType.OnAuthLogout });
    };

    this._instance.onAuthSuccess = () => {
      this._keycloakEvents$.next({ type: KeycloakEventType.OnAuthSuccess });
    };

    this._instance.onTokenExpired = () => {
      this._keycloakEvents$.next({ type: KeycloakEventType.OnTokenExpired });
    };

    this._instance.onReady = authenticated => {
      this._keycloakEvents$.next({ args: authenticated, type: KeycloakEventType.OnReady });
    }; 
  }


}
