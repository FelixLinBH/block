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
        if(accounts[0] == '0x3D3B9Dc24CCd143665b178862441402085064F51' 
        || accounts[0] == '0xcCBF3001907c5740C06192bDAC6D0ceCb00723A1'
        || accounts[0] == '0xcd8503Be20D0A1fA9B45F745B4F8E9c1Adcf513D'){
          this.isValidator = true;
        }
    });
  }

}
