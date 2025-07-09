import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { IonicModule } from '@ionic/angular';
import { EventModalComponent } from '../components/event-modal/event-modal.component';

@NgModule({
  declarations: [EventModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // Add ReactiveFormsModule here
    IonicModule,
  ],
  exports: [EventModalComponent],
})
export class SharedModule {}