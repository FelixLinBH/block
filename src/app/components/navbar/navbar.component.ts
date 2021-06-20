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
        if(accounts[0] == '0x71D0e103488551189DBe7f612aaFFa7B34Ca9cb0'){
          this.isValidator = true;
        }
    });
  }

}
