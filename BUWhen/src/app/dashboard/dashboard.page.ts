import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, AlertController, ActionSheetController } from '@ionic/angular';
import { AuthService, User } from '../services/auth.service';
import { EventService } from '../services/event.service';
import { Event, Department } from '../models/event.model';
import { EventModalComponent } from '../components/event-modal/event-modal.component';
import { Observable } from 'rxjs';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  currentUser: User | null = null;
  events$!: Observable<Event[]>;
  filteredEvents: Event[] = [];
  selectedSegment: string = 'all';
  selectedDepartment: Department | 'all' = 'all';
  currentView: 'list' | 'calendar' = 'list';
  
  departments = Object.values(Department);

  // Calendar configuration
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [],
    eventClick: this.handleEventClick.bind(this),
    height: 'auto',
    themeSystem: 'standard'
  };

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private router: Router,
    private modalController: ModalController,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadEvents();
  }

  loadEvents() {
    this.events$ = this.eventService.getAllEvents();
    this.events$.subscribe(events => {
      this.filterEvents(events);
      // Initialize calendar on first load
      if (this.currentView === 'calendar') {
        this.updateCalendarEvents();
      }
    });
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
    this.events$.subscribe(events => {
      this.filterEvents(events);
    });
  }

  onDepartmentFilter() {
    this.events$.subscribe(events => {
      this.filterEvents(events);
    });
  }

  async openCreateEventModal() {
    const modal = await this.modalController.create({
      component: EventModalComponent,
      componentProps: {
        mode: 'create'
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.loadEvents(); // Refresh events list
      }
    });

    return await modal.present();
  }

  async editEvent(event: Event) {
    const modal = await this.modalController.create({
      component: EventModalComponent,
      componentProps: {
        mode: 'edit',
        event: event
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.loadEvents(); // Refresh events list
      }
    });

    return await modal.present();
  }

  async deleteEvent(event: Event) {
    const alert = await this.alertController.create({
      header: 'Delete Event',
      message: `Are you sure you want to delete "${event.title}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.eventService.deleteEvent(event.id).subscribe(success => {
              if (success) {
                this.loadEvents();
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  async showEventOptions(event: Event) {
    const canManage = this.authService.canManageEvents();
    
    const buttons: any[] = [
      {
        text: 'View Details',
        icon: 'eye-outline',
        handler: () => {
          this.viewEventDetails(event);
        }
      }
    ];

    if (canManage) {
      buttons.push(
        {
          text: 'Edit',
          icon: 'create-outline',
          handler: () => {
            this.editEvent(event);
          }
        },
        {
          text: 'Delete',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.deleteEvent(event);
          }
        }
      );
    }

    buttons.push({
      text: 'Cancel',
      icon: 'close',
      role: 'cancel'
    });

    const actionSheet = await this.actionSheetController.create({
      header: event.title,
      buttons
    });

    await actionSheet.present();
  }

  async viewEventDetails(event: Event) {
    const alert = await this.alertController.create({
      header: event.title,
      message: `
        <strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}<br>
        <strong>Time:</strong> ${event.time}<br>
        <strong>Venue:</strong> ${event.venue}<br>
        <strong>Department:</strong> ${event.department}<br>
        <strong>Description:</strong> ${event.description}
      `,
      buttons: ['OK']
    });

    await alert.present();
  }

  canCreateEvents(): boolean {
    return this.authService.canManageEvents();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getEventTypeColor(type: string): string {
    return type === 'university' ? 'primary' : 'secondary';
  }

  getDepartmentColor(department: Department): string {
    const colors: { [key in Department]: string } = {
      [Department.UNIVERSITY]: 'primary',
      [Department.CITE]: 'success',
      [Department.CHMT]: 'warning',
      [Department.CBA]: 'danger',
      [Department.CAS]: 'tertiary',
      [Department.COE]: 'dark',
      [Department.NURSING]: 'medium',
      [Department.EDUCATION]: 'light'
    };
    return colors[department] || 'medium';
  }

  // View switching methods
  switchToListView() {
    this.currentView = 'list';
  }

  switchToCalendarView() {
    this.currentView = 'calendar';
    this.updateCalendarEvents();
  }

  // Calendar methods
  updateCalendarEvents() {
    const calendarEvents: EventInput[] = this.filteredEvents.map(event => ({
      id: event.id,
      title: event.title,
      start: `${event.date}T${event.time}`,
      extendedProps: {
        description: event.description,
        venue: event.venue,
        department: event.department,
        type: event.type,
        originalEvent: event
      },
      backgroundColor: this.getCalendarEventColor(event.department, event.type),
      borderColor: this.getCalendarEventColor(event.department, event.type)
    }));

    this.calendarOptions = {
      ...this.calendarOptions,
      events: calendarEvents
    };
  }

  handleEventClick(info: any) {
    const originalEvent = info.event.extendedProps.originalEvent;
    this.showEventOptions(originalEvent);
  }

  getCalendarEventColor(department: Department, type: string): string {
    if (type === 'university') {
      return '#3880ff'; // Primary blue
    }
    
    const colors: { [key in Department]: string } = {
      [Department.UNIVERSITY]: '#3880ff',
      [Department.CITE]: '#2dd36f',
      [Department.CHMT]: '#ffc409',
      [Department.CBA]: '#eb445a',
      [Department.CAS]: '#6030ff',
      [Department.COE]: '#1e2023',
      [Department.NURSING]: '#92949c',
      [Department.EDUCATION]: '#f4f5f8'
    };
    return colors[department] || '#92949c';
  }

  // Override filterEvents to update calendar when filters change
  filterEvents(events: Event[]) {
    let filtered = events;

    // Filter by segment (all, university, departmental)
    if (this.selectedSegment === 'university') {
      filtered = filtered.filter(event => event.type === 'university');
    } else if (this.selectedSegment === 'departmental') {
      filtered = filtered.filter(event => event.type === 'departmental');
    }

    // Filter by department
    if (this.selectedDepartment !== 'all') {
      filtered = filtered.filter(event => event.department === this.selectedDepartment);
    }

    this.filteredEvents = filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Update calendar if in calendar view
    if (this.currentView === 'calendar') {
      this.updateCalendarEvents();
    }
  }
}
