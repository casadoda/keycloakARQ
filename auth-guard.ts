import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {Injectable} from '@angular/core';

import { KeycloakService } from './keycloak.service';

@Injectable()
export class AuthGuard implements CanActivate {


  constructor(protected router: Router, protected keycloakService: KeycloakService) {}

  /**
   * CanActivate checks if the user is logged in and get the full list of roles (REALM + CLIENT)
   * of the logged user. This values are set to authenticated and roles params.
   *
   * @param route
   * @param state
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise((resolve, reject) => {
      
        console.log("canActivate");
        

        this.keycloakService.isLoggedIn()
          .then( (authenticated) => {
              if (!authenticated) {      
          
                // To mantain selected Route, it must be used "state.url" and disable initial navigation in RouterModule (@see https://angular.io/api/router/RouterModule)
                let redirectUri: string = window.location.origin; // + state.url;          
                this.keycloakService.login({"redirectUri":redirectUri});
                resolve(false);
              }

              // User is authenticated
              var result:boolean= this.isAccessAllowed(route, state);
              console.log("result: "+result);
              resolve(result);
          }).catch( (error) => {
              reject('An error happened during access validation. Details:' + error);
          });
    });
  }

  /** TS 2.1

    return new Promise(async (resolve, reject) => {
      try {
        console.log("canActivate");
        var authenticated =  await this.keycloakService.isLoggedIn();
        if (!authenticated) {       
          
           // To mantain selected Route, it must be used "state.url" and disable initial navigation in RouterModule (@see https://angular.io/api/router/RouterModule)
          let redirectUri: string = window.location.origin; // + state.url;          
          await this.keycloakService.login({"redirectUri":redirectUri});
        }
        var result:boolean= this.isAccessAllowed(route, state);
        
        console.log("result: "+result);
        resolve(result);

        //this.roles = await this.keycloakAngular.getUserRoles(true);

        //const result = this.authenticated; //await this.isAccessAllowed(route, state);
        //resolve(result);
      } catch (error) {
        reject('An error happened during access validation. Details:' + error);
      }
    });
  **/


  /**
   * 
   *
   * @param route
   * @param state
   */
  isAccessAllowed(  route: ActivatedRouteSnapshot,   state: RouterStateSnapshot ): boolean {
    console.log(route.data.allowedRoles);    

    if (route.data.allowedRoles) {
      return this.keycloakService.hasAnyRoleInResource(route.data.allowedRoles);
    } else {
      //No allowed Roles are defined in the route, then it will allow the access.
      return true;
    }
    
  }
}