import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../services/event.service';
import { Event, Department } from '../models/event.model';
import { ModalController, AlertController, LoadingController } from '@ionic/angular';
import { EventModalComponent } from '../components/event-modal/event-modal.component';
import { Subscription } from 'rxjs'; 
@Component({
  selector: 'app-department-events',
  templateUrl: './department-events.page.html',
  styleUrls: ['./department-events.page.scss'],
  standalone: false,
})
export class DepartmentEventsPage implements OnInit, OnDestroy {
  departmentName: string = '';
  department: Department | null = null;
  events: Event[] = [];
  private eventsSubscription?: Subscription;

  // For custom delete dialog
  showDeleteDialog: boolean = false;
  eventToDelete: string | null = null;

  constructor(
    private route: ActivatedRoute, 
    private eventService: EventService,   
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.departmentName = params['department'] || 'Unknown Department';
      this.department = this.getDepartmentEnum(this.departmentName);
      this.loadEvents();
    });
  }

  ngOnDestroy() {
    if (this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
  }

  loadEvents() {
    if (this.department) {
      // Unsubscribe from previous subscription
      if (this.eventsSubscription) {
        this.eventsSubscription.unsubscribe();
      }

      // Subscribe to events for this department
      this.eventsSubscription = this.eventService.getEventsByDepartment(this.department).subscribe({
        next: (events) => {
          this.events = events;
          console.log(`Loaded ${events.length} events for ${this.departmentName}:`, events);
        },
        error: (error) => {
          console.error('Error loading events:', error);
          this.events = [];
        }
      });
    } else {
      console.warn('Invalid department:', this.departmentName);
      this.events = [];
    }
  }

addEvent() {
  const department = this.getDepartmentEnum(this.departmentName);
  if (!department) {
    console.error('Invalid department selected');
    return;
  }

  const newEvent = {
    title: 'New Event',
    description: 'Description of the new event',
    date: '2025-12-01',
    time: '10:00',
    venue: 'New Venue',
    department: department, // Ensured department is not null
    type: 'departmental' as 'departmental', // Explicitly typed as 'departmental'
    image: 'assets/default-event.png', // Optional image property
  };

  this.eventService.createEvent(newEvent).subscribe(event => {
    this.events.push(event);
  });
}

  modifyEvent(event: Event) {
    const updatedData = { title: `${event.title} (Updated)` };
    this.eventService.updateEvent(event.id, updatedData).subscribe(updatedEvent => {
      if (updatedEvent) {
        const index = this.events.findIndex(e => e.id === updatedEvent.id);
        if (index !== -1) {
          this.events[index] = updatedEvent;
        }
      }
    });
  }

  async openEventModal(event?: Event) {
    console.log('Opening event modal for:', event ? 'edit' : 'create', event);
    
    const modal = await this.modalController.create({
      component: EventModalComponent,
      componentProps: {
        event: event || null,
        mode: event ? 'edit' : 'create'
      },
    });

    modal.onDidDismiss().then(async (result) => {
      if (result.data) {
        console.log('Modal dismissed with data:', result.data);
        
        if (event) {
          // Editing existing event - data comes from modal's update operation
          this.loadEvents(); // Refresh the events list
          await this.showSuccessAlert('Event updated successfully!');
        } else {
          // Creating new event - data comes from modal's create operation
          this.loadEvents(); // Refresh the events list
          await this.showSuccessAlert('Event created successfully!');
        }
      } else {
        console.log('Modal dismissed without data');
      }
    });

    return await modal.present();
  }

  // Show custom delete dialog
  deleteEvent(eventId: string) {
    this.eventToDelete = eventId;
    this.showDeleteDialog = true;
  }

  // Cancel delete dialog
  cancelDelete() {
    this.showDeleteDialog = false;
    this.eventToDelete = null;
  }

  // Confirm delete
  async confirmDelete() {
    if (!this.eventToDelete) return;
    const loading = await this.loadingController.create({
      message: 'Deleting event...'
    });
    await loading.present();
    this.eventService.deleteEvent(this.eventToDelete).subscribe({
      next: async (success) => {
        await loading.dismiss();
        if (success) {
          this.loadEvents();
          await this.showSuccessAlert('Event deleted successfully!');
        } else {
          await this.showErrorAlert('Failed to delete event');
        }
        this.cancelDelete();
      },
      error: async (error) => {
        await loading.dismiss();
        console.error('Error deleting event:', error);
        await this.showErrorAlert('Error occurred while deleting event');
        this.cancelDelete();
      }
    });
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

  private getDepartmentEnum(departmentName: string): Department | null {
    switch (departmentName.toUpperCase()) {
      case 'CITE':
        return Department.CITE;
      case 'CHMT':
        return Department.CHMT;
      case 'CBAA':
        return Department.CBAA;
      case 'CLAGE':
        return Department.CLAGE;
      case 'CEDE':
        return Department.CEDE;
      case 'CNAHS':
        return Department.CNAHS;
      case 'CHED':
        return Department.CHED;
      case 'UNIVERSITY':
        return Department.UNIVERSITY;
      default:
        console.warn('Unknown department:', departmentName);
        return null;
    }
  }

  // Utility method to format events for display
  getFormattedEvent(event: Event) {
    return this.eventService.formatEventForDisplay(event);
  }
}