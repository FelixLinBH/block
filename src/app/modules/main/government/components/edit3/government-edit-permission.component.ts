import { Component, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { forkJoin, from } from 'rxjs';
import { take } from 'rxjs/operators';
import { ComponentBase } from 'src/app/base/component.base';
import { OrganizationType } from 'src/app/types';

@Component({
    selector: 'app-government-edit-permission3',
    templateUrl: './government-edit-permission.component.html',
    styleUrls: ['./government-edit-permission.component.scss']
})
export class GovernmentEditPermissionComponent3 extends ComponentBase {
    public editForm: FormGroup;
    public profiles = null;
    public contract = null;

    constructor(
        private injector: Injector,
        private formBuilder: FormBuilder
    ) {
        super(injector);

        this.fetch()
        // this.editForm = this.formBuilder.group({
        //     contract: ['', [Validators.required, this.addressValidator]],
        //     address: ['', [Validators.required, this.addressValidator]],
        //     permission: [true, [Validators.required]],
        //     name: ['', [Validators.required]],
        //     type: [OrganizationType.school, [Validators.required]]
        // });
    }
    public async valid(index: any): Promise<void> {
        this.providerSvc.getAccount().pipe(take(1)).subscribe(async accounts => {
            console.log('index',index);
            this.isPending = true;
            const resume = await this.contract[index];
            const request = [];
            request.push(
                from(resume.methods.setProfileValid("1").send({ from: accounts[0] })),
            );

            forkJoin(request).pipe(take(1)).subscribe(
                res => {
                    this.transactionConfirmed();
                    // this.profileForm.reset();
                    // this.setFormDisabled(this.profileForm, false);
                },
                err => {
                    this.transactionError(err.message);
                    // this.profileForm.reset();
                    // this.setFormDisabled(this.profileForm, false);
                }
            );

        });
        
    }

    public async fetch(){
        const resume = await this.providerSvc.getNeedValidResume();
        this.profiles = resume.profiles;
        this.contract = resume.contract;
        console.log(this.profiles);

    }

    // public async editPermission(data: any): Promise<void> {
    //     this.isPending = true;
    //     this.setFormDisabled(this.editForm);
    //     // const resume = await this.providerSvc.getResume(data.contract);
    //     if (data.permission) {
    //         this.providerSvc.executeMethod(
    //             resume.methods.setPermission(data.address, data.name, data.type, data.permission)
    //             .send({ from: this.providerSvc.defaultAccount })
    //         ).pipe(
    //             take(1)
    //         ).subscribe(
    //             receipt => {
    //                 this.transactionConfirmed();
    //                 this.editForm.reset();
    //                 this.setFormDisabled(this.editForm, false);
    //             },
    //             err => {
    //                 this.transactionError(err.message);
    //                 this.editForm.reset();
    //                 this.setFormDisabled(this.editForm, false);
    //             }
    //         );
    //     } else {
    //         this.providerSvc.executeMethod(
    //             resume.methods.removePermission(data.address)
    //             .send({ from: this.providerSvc.defaultAccount })
    //         ).pipe(
    //             take(1)
    //         ).subscribe(
    //             receipt => {
    //                 this.transactionConfirmed();
    //                 this.editForm.reset();
    //                 this.setFormDisabled(this.editForm, false);
    //             },
    //             err => {
    //                 this.transactionError(err.message);
    //                 this.editForm.reset();
    //                 this.setFormDisabled(this.editForm, false);
    //             }
    //         );
    //     }
    // }

}
