import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    imports: [
        NgbModule,

        // NgbTabsetModule,
        // NgbDatepickerModule,
        // NgbPaginationModule, NgbAlertModule,
        // NgbCarouselModule
    ],
    exports: [
        NgbModule,
        // NgbTabsetModule,
        // NgbDatepickerModule,
        // NgbPaginationModule, NgbAlertModule,
    ]
})
export class BootstrapModule { }
