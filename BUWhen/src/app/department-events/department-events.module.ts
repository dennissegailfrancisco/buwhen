import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DepartmentEventsPageRoutingModule } from './department-events-routing.module';
import { DepartmentEventsPage } from './department-events.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [DepartmentEventsPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DepartmentEventsPageRoutingModule,
      SharedModule,
  ],
})
export class DepartmentEventsPageModule {}