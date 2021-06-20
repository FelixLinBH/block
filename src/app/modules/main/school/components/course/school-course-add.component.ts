import { Component, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ComponentBase } from 'src/app/base/component.base';
import { switchMap, take } from 'rxjs/operators';
import { ProfileModel } from 'src/app/types';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-school-course-add',
    templateUrl: './school-course-add.component.html',
    styleUrls: ['./school-course-add.component.scss']
})
export class SchoolCourseAddComponent extends ComponentBase {
    public courseForm: FormGroup;
    public profile: ProfileModel = null;

    constructor(
        private injector: Injector,
        private formBuilder: FormBuilder
    ) {
        super(injector);
        this.getProfile();

        this.courseForm = this.formBuilder.group({
            contract: ['', [Validators.required, this.addressValidator]],
            name: ['', [Validators.required]],
            content: ['', [Validators.required]],
            comment: ['', [Validators.required]],
            grade: ['', [Validators.required, Validators.pattern(/^(?:[1-9]?\d|100)$/)]]
        });
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
                console.log('done3');
                
            });
        }
    } 

    public async addCourse(data: any): Promise<void> {
        this.isPending = true;
        this.setFormDisabled(this.courseForm);
        const resume = await this.providerSvc.getResume(this.providerSvc.defaultAccount);
        this.providerSvc.executeMethod(
            resume.methods.setCourse(data.name, data.content, data.comment, data.grade)
            .send({ from: this.providerSvc.defaultAccount })
        ).pipe(
            take(1)
        ).subscribe(
            receipt => {
                this.transactionConfirmed();
                this.courseForm.reset();
                this.setFormDisabled(this.courseForm, false);
            },
            err => {
                this.transactionError();
                this.courseForm.reset();
                this.setFormDisabled(this.courseForm, false);
            }
        );
    }

}
