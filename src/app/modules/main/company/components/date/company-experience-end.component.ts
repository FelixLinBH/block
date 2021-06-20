import { Component, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { ComponentBase } from 'src/app/base/component.base';
import { ProfileModel } from 'src/app/types';

@Component({
  selector: 'app-company-experience-end',
  templateUrl: './company-experience-end.component.html',
  styleUrls: ['./company-experience-end.component.scss']
})
export class CompanyExperienceEndComponent extends ComponentBase {
    public endDateForm: FormGroup;
    public profile: ProfileModel = null;

    constructor(
        private injector: Injector,
        private formBuilder: FormBuilder
    ) {
        super(injector);
        this.endDateForm = this.formBuilder.group({
            name: ['', [Validators.required]],
            endDate: ['', [Validators.required]]
        });
        this.getProfile();
    }

    public async getProfile(): Promise<void> {
        this.providerSvc.getAccount().pipe(take(1)).subscribe(async accounts => {
            const resume = await this.providerSvc.getResume(accounts[0]);
            const countReq = [];
            this.profile = new ProfileModel(resume);
            if(this.profile){
                await this.profile.setBasic();
            }
            if(this.profile.account){
    
                const countReq = [];
                countReq.push(this.providerSvc.executeMethod(resume.methods.getEducationCount().call()));
                countReq.push(this.providerSvc.executeMethod(resume.methods.getExperienceCount().call()));
                countReq.push(this.providerSvc.executeMethod(resume.methods.getSkillCount().call()));
        
                forkJoin(countReq).pipe(
                    switchMap(res => {
                        console.log('setEducations');
                        this.profile.setCounts(res);
                        return this.profile.setEducations();
                    }),
                    switchMap(() => {
                        console.log('setExperiences');
                        return this.profile.setExperiences();
                    }),
                    switchMap(() => {
                        console.log('setSkills');
                        return this.profile.setSkills();
                    }),
                    take(1)
                ).subscribe(() => {
                    this.endDateForm = this.formBuilder.group({
                        name: [this.profile.experiences.items[0].companyName, [Validators.required]],
                        endDate: ['', [Validators.required]]
                    });
                });
            }
        });
        
    } 


    public async setEndDate(data: any): Promise<void> {
        data.endDate = new Date(data.endDate.year, data.endDate.month - 1, data.endDate.day).valueOf();
        this.isPending = true;
        this.setFormDisabled(this.endDateForm);
        this.providerSvc.getAccount().pipe(take(1)).subscribe(async accounts => {
            const resume = await this.providerSvc.getResume(accounts[0]);
            this.providerSvc.executeMethod(
                resume.methods.setJobEndDate(data.endDate,0)
                .send({ from: accounts[0] })
            ).pipe(
                take(1)
            ).subscribe(
                receipt => {
                    this.transactionConfirmed();
                    this.endDateForm.reset();
                    this.setFormDisabled(this.endDateForm, false);
                },
                err => {
                    this.transactionError();
                    this.endDateForm.reset();
                    this.setFormDisabled(this.endDateForm, false);
                }
            );
        });
        
    }

}
