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
    public created = false;
    public isValidator = false;

    constructor(
        private injector: Injector,
        private formBuilder: FormBuilder
    ) {
        super(injector);
        this.providerSvc.getAccount().pipe(take(1)).subscribe(accounts => {
            this.providerSvc.defaultAccount = accounts[0];
            if(accounts[0] == '0x21A6F916E2c3CB469015b58A149F557AbB41A91C' 
            || accounts[0] == '0x2a087010AcA778404188E75Eb6d009384Bc7298B'
            || accounts[0] == '0x3511d6914612Db885B70bf137D905e06247Dc9aD'){
              this.isValidator = true;
              this.loaded = true;
            }else{
                this.getProfile()
            }
        });
    }

    public async getProfile(): Promise<void> {
        this.providerSvc.getAccount().pipe(take(1)).subscribe(async accounts => {
            const resume = await this.providerSvc.getResume(accounts[0]);
            if(resume == null){
                this.loaded = true;
                return;
            }
            const countReq = [];
            this.loaded = false;
            this.profile = new ProfileModel(resume);
            if(this.profile){
                this.created = true;
                await this.profile.setBasic();
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
                            return this.profile.setExperiences();
                        }),
                        switchMap(() => {
                            return this.profile.setSkills();
                        }),
                        take(1)
                    ).subscribe(() => {
                        this.loaded = true;
                        this.dealSkills();
                    });
                
                }
            }            
        });


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
