import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-department-events',
  templateUrl: './department-events.page.html',
  styleUrls: ['./department-events.page.scss'],
})
export class DepartmentEventsPage implements OnInit {
  departmentName: string = 'CITE'; // Example department name
  events: Array<{ id: number; title: string; date: string; time: string; venue: string; image?: string }> = [
    { id: 1, title: 'Event Title 1', date: 'July 10, 2025', time: '10:00 AM', venue: 'Venue 1' },
    { id: 2, title: 'Event Title 2', date: 'July 11, 2025', time: '2:00 PM', venue: 'Venue 2' },
    { id: 3, title: 'Event Title 3', date: 'July 12, 2025', time: '4:00 PM', venue: 'Venue 3' },
  ];

  constructor() {}

  ngOnInit() {}

  addEvent() {
    console.log('Add Event clicked');
  }

  modifyEvent(event: any) {
    console.log('Modify Event clicked', event);
  }

  deleteEvent(eventId: number) {
    console.log('Delete Event clicked', eventId);
  }
}