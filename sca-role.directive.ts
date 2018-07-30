import {  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  ElementRef,
  OnInit,
  Attribute } from '@angular/core';

import { KeycloakService } from './keycloak.service'; 

@Directive({
  selector: '[appScaRole]'
})
export class ScaRoleDirective implements OnInit {

  private isLoggedIn: boolean=false;
  private permissions = [];  
  private isHidden = true;

  constructor(
  	private element: ElementRef,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef, 
    private keycloakService: KeycloakService) { }

  @Input() 
  set appScaRole(val: any) {
  	    this.permissions = val;
    	this.updateView();
   }

   ngOnInit() {
   		this.keycloakService.isReady().subscribe(value => {
      			if (true) 
      				this.updateView();
    	}); 
  }

  
   private updateView() {

     this.checkPermission().then (
         (hasAccess) => {
            if (hasAccess) {
                if(this.isHidden) {
                  this.viewContainer.createEmbeddedView(this.templateRef);
                  this.isHidden = false;
                }
            } else {
                this.isHidden = true;
                this.viewContainer.clear();
            }
         }
       )

/** ts 2.1
    if (this.checkPermission()) {
      if(this.isHidden) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.isHidden = false;
      }
    } else {
      this.isHidden = true;
      this.viewContainer.clear();
    } **/
  }

  private checkPermission(): Promise<boolean> {

    return new Promise((resolve, reject) => {  

    	let showContent=false;
    	let isKeycloakReady = this.keycloakService.isReady().getValue();
    	
    	console.log("is ready? : "+isKeycloakReady);
    	if (isKeycloakReady) // Keycloak SI está inicializado
    	{
        this.keycloakService.isLoggedIn()
          .then ( (authenticated) => {
            console.log("checkPermission: "+authenticated);
            if (authenticated) {
                if (this.permissions instanceof Array && this.permissions.length==0)
                {
                  //Ningún rol definido en el componente
                  resolve(true);
                } else if (this.keycloakService.hasAnyRoleInResource(this.permissions))
                {    
                  resolve(true);
                } else {
                  resolve(false); // No tiene el rol necesario
                }
            } else {
              // No autenticado
              resolve(false);
            }
          }).catch( (error) => {
            console.log("checkPermission: "+error);
            resolve(false);
          });
          
      } else {
        resolve(false);
      }
    });
  		
/** TS 2.1      if (this.keycloakService.isLoggedIn())
  		{  			
  			if (this.permissions instanceof Array && this.permissions.length==0)
  			{
  				//Ningún rol definido
  				showContent=true;
  			} else if (this.keycloakService.hasAnyRoleInResource(this.permissions))
  				{  	
  					showContent=true;
  				}
  		}
  	}
	
  	return showContent;

    **/

  	
  	/*if (!value) {  //Si no existen roles permitidos en la definición, mostramos la vista
  		this.drawEmbeddedView();
  		return;
  	}

  /*	let tmpRoles: string[] = value.toString().split(",");
  	let roles: string[] = tmpRoles.map( str => str.trim());

  	console.log(roles);

  	let showContent: boolean=false;


  	if (this.keycloakService.isLoggedIn())
  		if (this.keycloakService.hasAnyRoleInResource(roles))
  		{
  			console.log("has roles");
  			showContent=true;
  		}


  	if (showContent)
  		this.drawEmbeddedView();
  	else
  		this.clearEmbeddedView(); */

    /*if (!condition && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (condition && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    } */
  }

 /* private drawEmbeddedView(): void {
		this.viewContainer.createEmbeddedView(this.templateRef);
      //this.hasView = true;
  }

  private clearEmbeddedView(): void {
  	this.viewContainer.clear();
      //this.hasView = false;
  } */

}
