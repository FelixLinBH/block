import { Component, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { ComponentBase } from 'src/app/base/component.base';

@Component({
  selector: 'app-company-experience-add',
  templateUrl: './company-experience-add.component.html',
  styleUrls: ['./company-experience-add.component.scss']
})
export class CompanyExperienceAddComponent extends ComponentBase {
    public experienceForm: FormGroup;

    constructor(
        private injector: Injector,
        private formBuilder: FormBuilder
    ) {
        super(injector);
        this.experienceForm = this.formBuilder.group({
            name: ['', [Validators.required]],
            position: ['', [Validators.required]],
            startDate: ['', [Validators.required]]
        });
    }

    public async addExperience(data: any): Promise<void> {
        data.startDate = new Date(data.startDate.year, data.startDate.month - 1, data.startDate.day).valueOf();
        this.isPending = true;
        this.setFormDisabled(this.experienceForm);

        this.providerSvc.getAccount().pipe(take(1)).subscribe(async accounts => {
            const resume = await this.providerSvc.getResume(accounts[0]);
            this.providerSvc.executeMethod(
                resume.methods.setExperience(data.position, data.startDate, data.name)
                .send({ from: accounts[0] })
            ).pipe(
                take(1)
            ).subscribe(
                receipt => {
                    this.transactionConfirmed();
                    this.experienceForm.reset();
                    this.setFormDisabled(this.experienceForm, false);
                },
                err => {
                    this.transactionError();
                    this.experienceForm.reset();
                    this.setFormDisabled(this.experienceForm, false);
                }
            );
        });

    }

}
