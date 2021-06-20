import { Component, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ComponentBase } from 'src/app/base/component.base';
import { from, forkJoin } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { Gender, ResumeInitialOptions } from 'src/app/types';

import { ProfileModel } from 'src/app/types';

@Component({
    selector: 'app-host',
    templateUrl: './host.component.html',
    styleUrls: ['./host.component.scss']
})
export class HostComponent extends ComponentBase {
    public profileForm: FormGroup;
    public profile: ProfileModel = null;
    public loaded = false;
    public created = false;
    public skills = [];

    //Empty profile
    public resumeInfo;
    public deployForm: FormGroup;

    constructor(
        private injector: Injector,
        private formBuilder: FormBuilder
    ) {
        super(injector);
        this.getProfile(formBuilder)
    }

    public async getProfile(formBuilder: FormBuilder): Promise<void> {
        const resume = await this.providerSvc.getResume(this.providerSvc.defaultAccount);
        this.profile = new ProfileModel(resume);
        if(resume){
            await this.profile.setBasic();
        }
        if(this.profile.account){
            console.log('created');
            this.created = true;
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
                this.dealSkills(formBuilder);
            });
        }else{
            console.log('need to create');
            this.deployForm = formBuilder.group({
                name: ['', [Validators.required]],
                age: [null, [Validators.required]],
                gender: [Gender.male, [Validators.required]]
            });
            this.loaded = true;
        }
    
       
    }
    private dealSkills(formBuilder: FormBuilder): void {
        const skills = this.profile.skills.items;
        if(skills.length == 0){
            this.loaded = true;
            console.log('empty skills');
            this.profileForm = formBuilder.group({
                name: [this.profile.name, [Validators.required]],
                age: [this.profile.age, [Validators.required]],
                contact: [this.profile.contact, [Validators.required]],
                autobiography: [this.profile.autobiography, [Validators.required]],
                skills: this.formBuilder.array([this.createSkillFields()])
            });

            return;
        }
        this.skills = skills;
        this.profileForm = formBuilder.group({
            name: [this.profile.name, [Validators.required]],
            age: [this.profile.age, [Validators.required]],
            contact: [this.profile.contact, [Validators.required]],
            autobiography: [this.profile.autobiography, [Validators.required]],
            skills:  this.formBuilder.array(skills.map((e) =>
            this.formBuilder.group({
                class: [e.class, [Validators.required]],
                name: [e.name, [Validators.required]]
            })
        ))
        });
        this.loaded = true;
    }

    public async updateProfile(data: any): Promise<void> {
        this.isPending = true;
        this.setFormDisabled(this.profileForm);
        console.log('data',data);
        const resume = await this.providerSvc.getResume(this.providerSvc.defaultAccount);
        const request = [];
        request.push(
            from(resume.methods.setContact(data.contact).send({ from: this.providerSvc.defaultAccount })),
            from(resume.methods.setAutobiography(data.autobiography).send({ from: this.providerSvc.defaultAccount })),
            from(resume.methods.removeSkill().send({ from: this.providerSvc.defaultAccount }))
        );
        for (const skill of data.skills) {
            request.push(from(resume.methods.setSkill(skill.class, skill.name).send({ from: this.providerSvc.defaultAccount })));
        }
        forkJoin(request).pipe(take(1)).subscribe(
            res => {
                this.transactionConfirmed();
                this.profileForm.reset();
                this.setFormDisabled(this.profileForm, false);
            },
            err => {
                this.transactionError(err.message);
                this.profileForm.reset();
                this.setFormDisabled(this.profileForm, false);
            }
        );
    }

    public addSkillField(): void {
        const skills = this.profileForm.controls.skills as FormArray;
        skills.push(this.createSkillFields());
    }

    public removeSkillField(index: number) {
        const skills = this.profileForm.controls.skills as FormArray;
        skills.removeAt(index);
    }

    private createSkillFields(): FormGroup {
        return this.formBuilder.group({
            class: ['', [Validators.required]],
            name: ['', [Validators.required]]
        });
    }

    public get ageRange(): Array<number> {
        const range = [];
        for (let i = 16; i <= 100; i++) {
            range.push(i);
        }
        return range;
    }

    public get hostGender(): string {
        let result = '';
        switch (this.resumeInfo.gender) {
            case Gender.male:
              result = '男';
              break;
            case Gender.female:
              result = '女';
              break;
            case Gender.other:
              result = '其他';
        }
        return result;
    }

    public deployResume(data: ResumeInitialOptions): void {
        if (Array.isArray(data.age)) {
            data.age = data.age[0];
        }
        this.isPending = true;
        this.setFormDisabled(this.deployForm);
        this.providerSvc.deployResume(data).subscribe(
            instance => {
                this.transactionConfirmed();
                this.setFormDisabled(this.deployForm, false);
                this.deployForm.reset();
                this.resumeInfo = data;
                this.resumeInfo.address = instance.address;
                this.isPending = false;
            },
            err => {
                this.transactionError(err.message);
                this.setFormDisabled(this.deployForm, false);
                this.deployForm.reset();
                this.isPending = false;
            }
        );
    }
}
