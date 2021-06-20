import { Component, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { ComponentBase } from 'src/app/base/component.base';

@Component({
    selector: 'app-school-license-add',
    templateUrl: './school-license-add.component.html',
    styleUrls: ['./school-license-add.component.scss']
})
export class SchoolLicenseAddComponent extends ComponentBase {
    public licenseForm: FormGroup;

    constructor(
        private injector: Injector,
        private formBuilder: FormBuilder
    ) {
        super(injector);
        this.licenseForm = this.formBuilder.group({
            contract: ['', [Validators.required, this.addressValidator]],
            name: ['', [Validators.required]],
            content: ['', [Validators.required]]
        });
    }

    public async addLicense(data: any): Promise<void> {
        const resume = await this.providerSvc.getResume(data.contract);
        this.providerSvc.executeMethod(
            resume.methods.setLicense(data.name, data.content)
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
