import { Component, Injector, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { ComponentBase } from 'src/app/base/component.base';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent extends ComponentBase {
  public isValidator = false;

  constructor(
    private injector: Injector,
) {
    super(injector);
      this.providerSvc.getAccount().pipe(take(1)).subscribe(accounts => {
        this.providerSvc.defaultAccount = accounts[0];
        console.log('accounts',accounts[0]);
        if(accounts[0] == '0x21A6F916E2c3CB469015b58A149F557AbB41A91C' 
        || accounts[0] == '0x2a087010AcA778404188E75Eb6d009384Bc7298B'
        || accounts[0] == '0x3511d6914612Db885B70bf137D905e06247Dc9aD'){
          this.isValidator = true;
        }
    });
  }

}
