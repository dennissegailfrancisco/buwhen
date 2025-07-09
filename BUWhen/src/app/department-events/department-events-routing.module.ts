import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DepartmentEventsPage } from './department-events.page';

const routes: Routes = [
  {
    path: '',
    component: DepartmentEventsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DepartmentEventsPageRoutingModule {}
