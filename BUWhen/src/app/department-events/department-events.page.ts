import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../services/event.service';
import { Event, Department } from '../models/event.model';
import { ModalController } from '@ionic/angular';
import { EventModalComponent } from '../components/event-modal/event-modal.component'; 
@Component({
  selector: 'app-department-events',
  templateUrl: './department-events.page.html',
  styleUrls: ['./department-events.page.scss'],
  standalone: false,
})
export class DepartmentEventsPage implements OnInit {
  departmentName: string = '';
  events: Event[] = [];

  constructor(private route: ActivatedRoute, private eventService: EventService,   private modalController: ModalController) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.departmentName = params['department'] || 'Unknown Department';
      this.loadEvents();
    });
  }

  loadEvents() {
    const department = this.getDepartmentEnum(this.departmentName);
    if (department) {
      this.eventService.getEventsByDepartment(department).subscribe(events => {
        this.events = events;
      });
    } else {
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

async openEventModal(event?: any) {
  const modal = await this.modalController.create({
    component: EventModalComponent,
    componentProps: {
      event: event || null, // Pass event data or null for a new event
    },
  });


  modal.onDidDismiss().then((result) => {
    if (result.data) {
      if (event) {
        this.modifyEvent(result.data); // Update the event
      } else {
        this.addEvent(); // Add a new event
      }
    }
  });

  return await modal.present();
}

  deleteEvent(eventId: string) {
    this.eventService.deleteEvent(eventId).subscribe(success => {
      if (success) {
        this.events = this.events.filter(event => event.id !== eventId);
      }
    });
  }

  private getDepartmentEnum(departmentName: string): Department | null {
    switch (departmentName.toUpperCase()) {
      case 'CITE':
        return Department.CITE;
      case 'CHMT':
        return Department.CHMT;
      case 'CBA':
        return Department.CBA;
      case 'CAS':
        return Department.CAS;
      case 'NURSING':
        return Department.NURSING;
      default:
        return null;
    }
  }
}