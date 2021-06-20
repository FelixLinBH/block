import { Component, Injector, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { ComponentBase } from 'src/app/base/component.base';

@Component({
  selector: 'app-government',
  templateUrl: './government.component.html',
  styleUrls: ['./government.component.scss']
})

export class GovernmentComponent extends ComponentBase {
  public permission = 0;

  constructor(
    private injector: Injector,
) {
    super(injector);
      this.providerSvc.getAccount().pipe(take(1)).subscribe(accounts => {
        this.providerSvc.defaultAccount = accounts[0];
        console.log('accounts',accounts[0]);
        if(accounts[0] == '0x3D3B9Dc24CCd143665b178862441402085064F51'){
          this.permission = 1;
        }else if(accounts[0] == '0xcCBF3001907c5740C06192bDAC6D0ceCb00723A1'){
          this.permission = 2;
        }else if(accounts[0] == '0xcd8503Be20D0A1fA9B45F745B4F8E9c1Adcf513D'){
          this.permission = 3;
        }
    });
  }

}