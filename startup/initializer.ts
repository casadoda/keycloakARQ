import { Injector } from '@angular/core'; 
import { KeycloakService } from '../keycloak.service'; 
import { HttpClientModule, HttpClient  } from '@angular/common/http';
//import {ExtraModuleInjector} from "../keycloak/extraModuleInjector";
import {appInjector} from './app-injector';

export function initializer(keycloakService: KeycloakService, http: HttpClient, injector: Injector, configJSON?: any): () => Promise<any> {
  
  return (): Promise<any> => {
    return new Promise( (resolve, reject) => {
      try {
        console.log("keycloak.initializer ");
        //console.log("Injector: "+injector);
        //new ExtraModuleInjector(injector);  //Nos guardamos el Injector para poder utilizarlo en el decorator
        appInjector(injector);

        //let kcService = injector.get(KeycloakService);
        //console.log("kc"+kcService.getUsername());

        /*let configKC:any = null;

        if (configJSON[0] != undefined) {
          configKC = configJSON[0];
        }*/

        keycloakService.init(configJSON[0])
              .then( ()=>{
                  resolve()})
              .catch( (error)=> {
                reject(error)}); 
        
        /* http.get('/assets/config.json').subscribe ( rawConfiguration => {            
            //this.applyConfiguration(rawConfiguration);
            console.log('SCA config'+rawConfiguration["keycloak"]);
            keycloakService.init(rawConfiguration["keycloak"])
              .then( ()=>{
                  resolve()})
              .catch( (error)=> {
                reject(error)}); 
             });


        */
        
      } catch (error) {
        reject(error);
      }
    });
  }; 
}