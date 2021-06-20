import { Component, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { ComponentBase } from 'src/app/base/component.base';
import { ProfileModel } from 'src/app/types';

@Component({
    selector: 'app-school-license-add',
    templateUrl: './school-license-add.component.html',
    styleUrls: ['./school-license-add.component.scss']
})
export class SchoolLicenseAddComponent extends ComponentBase {
    public licenseForm: FormGroup;
    public profile: ProfileModel = null;

    constructor(
        private injector: Injector,
        private formBuilder: FormBuilder
    ) {
        super(injector);
        this.licenseForm = this.formBuilder.group({
            school:['', [Validators.required]],
            contract: ['', [Validators.required, this.addressValidator]],
            name: ['', [Validators.required]],
            content: ['', [Validators.required]]
        });
        this.getProfile();

    }

    public async getProfile(): Promise<void> {
        const resume = await this.providerSvc.getResume(this.providerSvc.defaultAccount);
        const countReq = [];
        this.profile = new ProfileModel(resume);
        if(this.profile){
            await this.profile.setBasic();
        }
        if(this.profile.account){
            console.log(this.profile);
            countReq.push(this.providerSvc.executeMethod(resume.methods.getEducationCount().call()));
            forkJoin(countReq).pipe(
                switchMap(res => {
                    this.profile.setCounts(res);
                    return this.profile.setEducations();
                }),
                take(1)
            ).subscribe(() => {
                this.licenseForm = this.formBuilder.group({
                    school:[this.profile.educations.items[0].schoolName, [Validators.required]],
                    contract: ['', [Validators.required, this.addressValidator]],
                    name: ['', [Validators.required]],
                    content: ['', [Validators.required]],
                    comment: ['', [Validators.required]],
                    grade: ['', [Validators.required, Validators.pattern(/^(?:[1-9]?\d|100)$/)]]
                });
            });
        }
    } 

    public async addLicense(data: any): Promise<void> {
        const resume = await this.providerSvc.getResume(this.providerSvc.defaultAccount);
        this.providerSvc.executeMethod(
            resume.methods.setLicense(data.name, data.content,0)
            .send({ from: this.providerSvc.defaultAccount })
        ).pipe(
            take(1)
        ).subscribe(
            receipt => {
                this.transactionConfirmed();
                this.licenseForm.reset();
                this.setFormDisabled(this.licenseForm, false);
            },
            err => {
                this.transactionError();
                this.licenseForm.reset();
                this.setFormDisabled(this.licenseForm, false);
            }
        );
    }

}
