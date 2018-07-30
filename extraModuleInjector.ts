import {Injectable, Injector} from "@angular/core";
@Injectable()
export class ExtraModuleInjector {
  private static injector;

  public static get(token: any) {
    if (ExtraModuleInjector.injector) {    	
      return ExtraModuleInjector.injector.get(token);
    }
  }

  constructor(public injector: Injector) {
    ExtraModuleInjector.injector = injector;
  }
}