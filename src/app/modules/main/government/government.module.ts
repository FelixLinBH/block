import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BootstrapModule } from '../../shared/bootstrap/bootstrap.module';
import { GovernmentRoutingModule } from './government-routing.module';

import { GovernmentComponent } from './government.component';
// import { GovernmentCreateResumeComponent } from './components/create/government-create-resume.component';
import { GovernmentEditPermissionComponent } from './components/edit/government-edit-permission.component';
import { GovernmentEditPermissionComponent2 } from './components/edit2/government-edit-permission.component';
import { GovernmentEditPermissionComponent3 } from './components/edit3/government-edit-permission.component';

@NgModule({
    declarations: [
        GovernmentComponent,
        GovernmentEditPermissionComponent,
        GovernmentEditPermissionComponent2,
        GovernmentEditPermissionComponent3
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        BootstrapModule,
        GovernmentRoutingModule
    ]
})
export class GovernmentModule { }
