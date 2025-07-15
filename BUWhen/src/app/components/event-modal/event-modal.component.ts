
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
  hourOptions: string[] = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  minuteOptions: string[] = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
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
    hours: ['', Validators.required], 
    minutes: ['', Validators.required], 
    ampm: ['', Validators.required], 
    venue: ['', [Validators.required, Validators.minLength(3)]],
    department: [Department.CITE, Validators.required],
    type: ['departmental', Validators.required]
  });


    if (!this.authService.canCreateUniversityEvents()) {
      this.eventForm.get('type')?.setValue('departmental');
      this.eventForm.get('type')?.disable();
    }
  }

  private populateForm() {
    if (this.event) {
      let hours = '';
      let minutes = '';
      let ampm = '';
      
      if (this.event.time) {
        const timeMatch = this.event.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (timeMatch) {
          hours = timeMatch[1].padStart(2, '0');
          minutes = timeMatch[2];
          ampm = timeMatch[3].toUpperCase();
        }
      }

      this.eventForm.patchValue({
        title: this.event.title,
        description: this.event.description,
        date: this.event.date,
        hours: hours,
        minutes: minutes,
        ampm: ampm,
        venue: this.event.venue,
        department: this.event.department,
        type: this.event.type
      });
    }
  }

  async onSubmit() {
    if (this.eventForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formValue = this.eventForm.getRawValue();

      let dateValue = formValue.date;
      if (dateValue instanceof Date) {
        dateValue = dateValue.toISOString().split('T')[0];
      }
      if (!dateValue || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        this.isSubmitting = false;
        await this.showErrorAlert('Please select a valid date.');
        return;
      }

      const eventData: CreateEventDto = {
        title: formValue.title.trim(),
        description: formValue.description.trim(),
        date: dateValue,
        time: `${formValue.hours}:${formValue.minutes} ${formValue.ampm}`,
        venue: formValue.venue.trim(),
        department: formValue.department,
        type: formValue.type
      };

      const eventDateTime = new Date(`${eventData.date}T${this.convertTo24Hour(eventData.time)}`);
      const now = new Date();
      if (eventDateTime < now) {
        this.isSubmitting = false;
        await this.showErrorAlert('Cannot add events in the past.');
        return;
      }

      const allEvents = this.eventService.getCurrentEventsArray();
      const isDuplicate = allEvents.some(ev =>
        ev.title.trim().toLowerCase() === eventData.title.toLowerCase() &&
        ev.date === eventData.date &&
        ev.time === eventData.time &&
        (this.mode !== 'edit' || (this.event && ev.id !== this.event.id))
      );
      if (isDuplicate) {
        this.isSubmitting = false;
        await this.showErrorAlert('An event with the same title, date, and time already exists.');
        return;
      }

      const loading = await this.loadingController.create({
        message: this.mode === 'create' ? 'Creating event...' : 'Updating event...',
      });
      await loading.present();

      try {
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
      } catch (err: any) {
        await loading.dismiss();
        this.isSubmitting = false;
        await this.showErrorAlert(err?.message || 'Invalid event data.');
      }
    }
  }

  private convertTo24Hour(time12h: string): string {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    let h = parseInt(hours, 10);
    if (modifier.toUpperCase() === 'PM' && h < 12) h += 12;
    if (modifier.toUpperCase() === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${minutes}:00`;
  }

  onDateChange(event: CustomEvent) {
    let value = event.detail?.value;
    if (typeof value === 'string' && value.includes('T')) {
      value = value.split('T')[0];
    }
    const dateControl = this.eventForm.get('date');
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      dateControl?.setValue(value);
      if (dateControl?.hasError('invalidDate')) {
        dateControl.setErrors(null);
      }
    } else {
      dateControl?.setErrors({ invalidDate: true });
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

  get title() { return this.eventForm.get('title'); }
  get description() { return this.eventForm.get('description'); }
  get date() { return this.eventForm.get('date'); }
  get hours() { return this.eventForm.get('hours'); }
  get minutes() { return this.eventForm.get('minutes'); }
  get ampm() { return this.eventForm.get('ampm'); }
  get venue() { return this.eventForm.get('venue'); }
  get department() { return this.eventForm.get('department'); }
  get type() { return this.eventForm.get('type'); }
}
