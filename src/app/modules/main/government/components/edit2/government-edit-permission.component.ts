import { Component, Injector } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { forkJoin, from } from 'rxjs';
import { take } from 'rxjs/operators';
import { ComponentBase } from 'src/app/base/component.base';
import { OrganizationType } from 'src/app/types';

@Component({
    selector: 'app-government-edit-permission2',
    templateUrl: './government-edit-permission.component.html',
    styleUrls: ['./government-edit-permission.component.scss']
})
export class GovernmentEditPermissionComponent2 extends ComponentBase {
    public editForm: FormGroup;
    public resume = null;

    constructor(
        private injector: Injector,
    ) {
        super(injector);
        this.fetch()
    }

    public async valid(index: any): Promise<void> {
        this.providerSvc.getAccount().pipe(take(1)).subscribe(async accounts => {
            console.log('index',index);
            this.isPending = true;
            const resume = await this.resume[index].contract;
            const request = [];
            request.push(
                from(resume.methods.setEducationValid("1",0).send({ from: accounts[0] })),
            );

            forkJoin(request).pipe(take(1)).subscribe(
                res => {
                    this.transactionConfirmed();
                },
                err => {
                    this.transactionError(err.message);
                }
            );
        });
        
    }

    public async fetch(){
        const resume = await this.providerSvc.getNeedValidSchoolResume();
        this.resume = resume;
        for (let index = 0; index < resume.length; index++) {
            const element = resume[index];
            console.log(element.profile);
            console.log(element.education);
            console.log(element.contract);
        }
        
    }
}
