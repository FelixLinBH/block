import { Component, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { switchMap, take } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { ComponentBase } from 'src/app/base/component.base';
import { ProfileModel } from 'src/app/types';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent extends ComponentBase {
    public contractForm: FormGroup;
    public profile: ProfileModel = null;
    public skills = null;

    public loaded = false;

    constructor(
        private injector: Injector,
        private formBuilder: FormBuilder
    ) {
        super(injector);
        // this.contractForm = this.formBuilder.group({
        //     contract: ['', [Validators.required, this.addressValidator]]
        // });
        this.getProfile()
    }

    public async getProfile(): Promise<void> {
        const resume = await this.providerSvc.getResume(this.providerSvc.defaultAccount);
        const countReq = [];
        this.loaded = false;
        this.profile = new ProfileModel(resume);
        if(this.profile){
            await this.profile.setBasic();
        }
        if(this.profile.account){
            countReq.push(this.providerSvc.executeMethod(resume.methods.getEducationCount().call()));
            countReq.push(this.providerSvc.executeMethod(resume.methods.getExperienceCount().call()));
            countReq.push(this.providerSvc.executeMethod(resume.methods.getSkillCount().call()));

            forkJoin(countReq).pipe(
                switchMap(res => {
                    this.profile.setCounts(res);
                    
                    return this.profile.setEducations();
                }),
                switchMap(() => {
                    console.log('done5')
                    return this.profile.setExperiences();
                }),
                switchMap(() => {
                    console.log('done2');
                    return this.profile.setSkills();
                }),
                take(1)
            ).subscribe(() => {
                console.log('done3');
                this.loaded = true;
                this.dealSkills();
            });
        
        }

    }

    private dealSkills(): void {
        const skills = this.profile.skills.items;
        const classBuffer = skills.map(x => x.class);
        const noRepeatClass = classBuffer.filter((val, i, arr) => arr.indexOf(val) === i);
        const sk = [];
        noRepeatClass.forEach(key => {
          sk.push({
              class: key,
              items: skills.filter(x => x.class === key).map(x => x.name)
          });
        });
        this.skills = sk;
    }

}
