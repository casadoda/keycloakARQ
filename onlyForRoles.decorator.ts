import { ReflectiveInjector } from '@angular/core';
import { SecurityException } from './securityException';
import { Exception } from './exception';
import {KeycloakService} from "./keycloak.service";
import {ExtraModuleInjector} from "./extraModuleInjector";
import {appInjector} from "./startup/app-injector";



/**
 * The OnlyForRoles decorator checks if current user has some of thes roles required for
 * method execution. It doesn't have any of the required roles, throws a SecurityException.
 * Example : @OnlyForRoles(['admin']) methodName() {} 
 * @throws SecurityException if current user doesn't have any of the required roles and tries
 * to execute the decorated method.
 **/ 
 export function OnlyForRoles(roles: string[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {

    let oldFunction = descriptor.value;
            descriptor.value = function () {

              let injector = appInjector();
              if (!injector)
               throw new Exception("Injector not available.");
              
              let kcService: KeycloakService = injector.get(KeycloakService);              
              if (!kcService)
               throw new Exception("kcService not available."); 

             if (!kcService.isReady().getValue())
                throw new Exception("kcService not initialized.");                

                if (!kcService.hasAnyRoleInResource(roles) ) { 
                    let userId = kcService.getUsername();
                    let typeName = target.constructor.name;
                    let exception_message =
                        getExceptionMessageFor(propertyKey, typeName, userId);
                    throw new SecurityException(roles, propertyKey, exception_message);
                }

                return oldFunction.apply(this, arguments);
            };
    return descriptor;
  }
}


function getExceptionMessageFor(methodName: string, typeName: string, userId: string) {
    return `Unauthorized access to ${methodName} method of type ${typeName} with user ${userId}.`;
}






/*
export function onlyForRoleFactory(injector) {
    let kcService = injector.get(KeycloakService);
    return function OnlyForRole(role: string) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            let oldFunction = descriptor.value;
            descriptor.value = function () {
                if (!kcService.hasResourceRol(role) ) { 
                    let userId = kcService.getUsername();
                    let typeName = target.constructor.name;
                    let exception_message =
                        getExceptionMessageFor(propertyKey, typeName, userId);
                    throw new SecurityException(role, propertyKey, exception_message);
                }

                return oldFunction.apply(this, arguments);
            };
        };
    };
} */

