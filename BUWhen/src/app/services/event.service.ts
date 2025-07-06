import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Event, CreateEventDto, Department } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  public events$ = this.eventsSubject.asObservable();

  private mockEvents: Event[] = [
    {
      id: '1',
      title: 'University Foundation Day',
      description: 'Celebrating the founding of Baliuag University',
      date: '2025-08-15',
      time: '08:00',
      venue: 'University Gymnasium',
      department: Department.UNIVERSITY,
      type: 'university',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: 'CITE Programming Contest',
      description: 'Annual programming competition for CITE students',
      date: '2025-09-20',
      time: '09:00',
      venue: 'CITE Computer Laboratory',
      department: Department.CITE,
      type: 'departmental',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      title: 'Nursing Week Celebration',
      description: 'Week-long celebration for nursing students and faculty',
      date: '2025-10-12',
      time: '07:30',
      venue: 'Nursing Building',
      department: Department.NURSING,
      type: 'departmental',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      title: 'Business Summit 2025',
      description: 'Annual business summit with industry leaders',
      date: '2025-11-05',
      time: '13:00',
      venue: 'CBA Conference Hall',
      department: Department.CBA,
      type: 'departmental',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor() {
    this.eventsSubject.next(this.mockEvents);
  }

  getAllEvents(): Observable<Event[]> {
    return this.events$;
  }

  getEventsByDepartment(department: Department): Observable<Event[]> {
    const filteredEvents = this.eventsSubject.value.filter(
      event => event.department === department
    );
    return new BehaviorSubject(filteredEvents).asObservable();
  }

  getEventById(id: string): Event | undefined {
    return this.eventsSubject.value.find(event => event.id === id);
  }

  createEvent(eventData: CreateEventDto): Observable<Event> {
    const newEvent: Event = {
      id: this.generateId(),
      ...eventData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentEvents = this.eventsSubject.value;
    const updatedEvents = [...currentEvents, newEvent];
    this.eventsSubject.next(updatedEvents);

    return new BehaviorSubject(newEvent).asObservable();
  }

  updateEvent(id: string, eventData: Partial<CreateEventDto>): Observable<Event | null> {
    const currentEvents = this.eventsSubject.value;
    const eventIndex = currentEvents.findIndex(event => event.id === id);

    if (eventIndex === -1) {
      return new BehaviorSubject(null).asObservable();
    }

    const updatedEvent: Event = {
      ...currentEvents[eventIndex],
      ...eventData,
      updatedAt: new Date()
    };

    const updatedEvents = [...currentEvents];
    updatedEvents[eventIndex] = updatedEvent;
    this.eventsSubject.next(updatedEvents);

    return new BehaviorSubject(updatedEvent).asObservable();
  }

  deleteEvent(id: string): Observable<boolean> {
    const currentEvents = this.eventsSubject.value;
    const filteredEvents = currentEvents.filter(event => event.id !== id);
    
    if (filteredEvents.length === currentEvents.length) {
      return new BehaviorSubject(false).asObservable();
    }

    this.eventsSubject.next(filteredEvents);
    return new BehaviorSubject(true).asObservable();
  }

  getUniversityEvents(): Observable<Event[]> {
    const universityEvents = this.eventsSubject.value.filter(
      event => event.type === 'university'
    );
    return new BehaviorSubject(universityEvents).asObservable();
  }

  getDepartmentalEvents(): Observable<Event[]> {
    const departmentalEvents = this.eventsSubject.value.filter(
      event => event.type === 'departmental'
    );
    return new BehaviorSubject(departmentalEvents).asObservable();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
