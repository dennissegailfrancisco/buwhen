import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, LoadingController, AlertController } from '@ionic/angular';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { Event, Department, CreateEventDto } from '../../models/event.model';

@Component({
  selector: 'app-event-modal',
  templateUrl: './event-modal.component.html',
    styleUrls: ['./event-modal.component.scss'],
  standalone: false
})
export class EventModalComponent implements OnInit {
  @Input() event?: Event;
  @Input() mode: 'create' | 'edit' = 'create';

  eventForm!: FormGroup;
  isSubmitting = false;
  departments = Object.values(Department);
  today = new Date().toISOString().split('T')[0];
hours: string[] = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
minutes: string[] = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private eventService: EventService,
    private authService: AuthService,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.createForm();
    if (this.mode === 'edit' && this.event) {
      this.populateForm();
    }
  }

private createForm() {
  this.eventForm = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    date: ['', Validators.required],
    hours: ['', Validators.required], // Hours dropdown
    minutes: ['', Validators.required], // Minutes dropdown
    ampm: ['', Validators.required], // AM/PM dropdown
    venue: ['', [Validators.required, Validators.minLength(3)]],
    department: [Department.CITE, Validators.required],
    type: ['departmental', Validators.required]
  });


    // If user can create university events, enable the type selection
    if (!this.authService.canCreateUniversityEvents()) {
      this.eventForm.get('type')?.setValue('departmental');
      this.eventForm.get('type')?.disable();
    }
  }

  private populateForm() {
    if (this.event) {
      this.eventForm.patchValue({
        title: this.event.title,
        description: this.event.description,
        date: this.event.date,
        time: this.event.time,
        venue: this.event.venue,
        department: this.event.department,
        type: this.event.type
      });
    }
  }

  async onSubmit() {
    if (this.eventForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const loading = await this.loadingController.create({
        message: this.mode === 'create' ? 'Creating event...' : 'Updating event...',
      });
      await loading.present();

      const formValue = this.eventForm.getRawValue();
      const eventData: CreateEventDto = {
        title: formValue.title,
        description: formValue.description,
        date: formValue.date,
        time: formValue.time ? `${formValue.hours}:${formValue.minutes} ${formValue.ampm}` : '',
        venue: formValue.venue,
        department: formValue.department,
        type: formValue.type
      };

      if (this.mode === 'create') {
        this.eventService.createEvent(eventData).subscribe({
          next: async (newEvent) => {
            await loading.dismiss();
            this.isSubmitting = false;
            await this.showSuccessAlert('Event created successfully!');
            this.dismiss(newEvent);
          },
          error: async (error) => {
            await loading.dismiss();
            this.isSubmitting = false;
            await this.showErrorAlert('Failed to create event');
          }
        });
      } else if (this.event) {
        this.eventService.updateEvent(this.event.id, eventData).subscribe({
          next: async (updatedEvent) => {
            await loading.dismiss();
            this.isSubmitting = false;
            if (updatedEvent) {
              await this.showSuccessAlert('Event updated successfully!');
              this.dismiss(updatedEvent);
            } else {
              await this.showErrorAlert('Failed to update event');
            }
          },
          error: async (error) => {
            await loading.dismiss();
            this.isSubmitting = false;
            await this.showErrorAlert('Failed to update event');
          }
        });
      }
    }
  }

  dismiss(data?: any) {
    this.modalController.dismiss(data);
  }

  private async showSuccessAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Success',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  canCreateUniversityEvents(): boolean {
    return this.authService.canCreateUniversityEvents();
  }

  // Form getters for validation
  get title() { return this.eventForm.get('title'); }
  get description() { return this.eventForm.get('description'); }
  get date() { return this.eventForm.get('date'); }
  get time() { return this.eventForm.get('time'); }
  get venue() { return this.eventForm.get('venue'); }
  get department() { return this.eventForm.get('department'); }
  get type() { return this.eventForm.get('type'); }
}
