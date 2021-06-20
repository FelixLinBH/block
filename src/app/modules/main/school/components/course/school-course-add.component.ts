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
        this.courseForm = this.formBuilder.group({
            school:['', [Validators.required]],
            contract: ['', [Validators.required, this.addressValidator]],
            name: ['', [Validators.required]],
            content: ['', [Validators.required]],
            comment: ['', [Validators.required]],
            grade: ['', [Validators.required, Validators.pattern(/^(?:[1-9]?\d|100)$/)]]
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
                this.courseForm = this.formBuilder.group({
                    school:[this.profile.educations.items[0].schoolName, [Validators.required]],
                    contract: ['', [Validators.required, this.addressValidator]],
                    name: ['', [Validators.required]],
                    content: ['', [Validators.required]],
                    comment: ['', [Validators.required]],
                    grade: ['', [Validators.required, Validators.pattern(/^(?:[1-9]?\d|100)$/)]]
                });
            });
        }
        });
        
    } 

    public async addCourse(data: any): Promise<void> {
        this.isPending = true;
        this.setFormDisabled(this.courseForm);
        this.providerSvc.getAccount().pipe(take(1)).subscribe(async accounts => {
            const resume = await this.providerSvc.getResume(accounts[0]);
            this.providerSvc.executeMethod(
                resume.methods.setCourse(data.name, data.content, data.comment, data.grade, 0)
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
        });
        
    }

}
