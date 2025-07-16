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
  searchTerm: string = '';
  currentView: 'list' | 'calendar' = 'list';
  departments = Object.values(Department);

  showEventDetails: boolean = false;
  selectedEvent: Event | null = null;

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
bulletinImages: string[] = [
  'assets/buevent1.jpg',
   'assets/buevent2.jpg',
  'assets/buevent3.jpg',
];
currentBulletinIndex: number = 0;

nextBulletinImage() {
  this.currentBulletinIndex = (this.currentBulletinIndex + 1) % this.bulletinImages.length;
}
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
    this.applyFilters();
  }

  onDepartmentChange(event: any) {
    this.selectedDepartment = event.detail.value;
    this.applyFilters();
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value;
    this.applyFilters();
  }

  applyFilters() {
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
        this.loadEvents(); 
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
        this.loadEvents(); 
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
          this.openEventDetails(event);
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

  openEventDetails(event: Event) {
    this.selectedEvent = event;
    this.showEventDetails = true;
  }

  closeEventDetails() {
    this.showEventDetails = false;
    this.selectedEvent = null;
  }

  modifyEvent(event: Event | null) {
    if (event) {
      this.editEvent(event);
      this.closeEventDetails();
    }
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
      [Department.CBAA]: 'danger',
      [Department.CLAGE]: 'tertiary',
      [Department.CEDE]: 'dark',
      [Department.CNAHS]: 'medium',
      [Department.CHED]: 'light'
    };
    return colors[department] || 'medium';
  }

  switchToListView() {
    this.currentView = 'list';
  }

  switchToCalendarView() {
    this.currentView = 'calendar';
    this.updateCalendarEvents();
  }

 
  handleEventClick(info: any) {
    const originalEvent = info.event.extendedProps.originalEvent;
    this.showEventOptions(originalEvent);
  }

  getCalendarEventColor(department: Department, type: string): string {
    if (type === 'university') {
      return '#3880ff';
    }
    
    const colors: { [key in Department]: string } = {
      [Department.UNIVERSITY]: '#3880ff',
      [Department.CITE]: '#2dd36f',
      [Department.CHMT]: '#ffc409',
      [Department.CBAA]: '#eb445a',
      [Department.CLAGE]: '#6030ff',
      [Department.CEDE]: '#1e2023',
      [Department.CNAHS]: '#92949c',
      [Department.CHED]: '#f4f5f8'
    };
    return colors[department] || '#92949c';
  }

  filterEvents(events: Event[]) {
    let filtered = events;

    if (this.selectedSegment === 'university') {
      filtered = filtered.filter(event => event.type === 'university');
    } else if (this.selectedSegment === 'departmental') {
      filtered = filtered.filter(event => event.type === 'departmental');
    }

    if (this.selectedDepartment !== 'all') {
      filtered = filtered.filter(event => event.department === this.selectedDepartment);
    }

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.trim().toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(term) ||
        event.venue.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term)
      );
    }

    this.filteredEvents = filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (this.currentView === 'calendar') {
      this.updateCalendarEvents();
    }
  }

  formatTime(time: string): string {
    if (!time) return '00:00:00';
    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time;
    if (/^\d{2}:\d{2}$/.test(time)) return time + ':00';
    return '00:00:00';
  }

  updateCalendarEvents() {
    const calendarEvents: EventInput[] = this.filteredEvents.map(event => ({
      id: event.id,
      title: event.title,
      start: `${event.date}T${this.formatTime(event.time)}`,
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
}
