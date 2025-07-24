import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Event, CreateEventDto, Department } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  public events$ = this.eventsSubject.asObservable();

  private readonly STORAGE_KEY = 'events';
  private mockEvents: Event[] = [
    { id: '1', title: 'Seminar-workshop on the Use of Canvas for Freshmen and Transferees', description: 'Seminar-workshop on the Use of Canvas for Freshmen and Transferees', date: '2025-08-05', time: '08:00 AM', venue: 'ITB 302', department: Department.CITE, type: 'departmental', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', title: 'OJT Orientation and Meeting with Parents / OJT Send off Program', description: 'OJT Orientation and Meeting with Parents / OJT Send off Program', date: '2025-08-09', time: '08:00 AM', venue: 'Smart Lab', department: Department.CITE, type: 'departmental', createdAt: new Date(), updatedAt: new Date() },
    { id: '3', title: 'CITE Orientation Program for Freshmen and Transferees and Bouquet Ceremony for SITE Officers SY 2025 - 2026', description: 'CITE Orientation Program for Freshmen and Transferees and Bouquet Ceremony for SITE Officers SY 2025 - 2026', date: '2025-08-12', time: '08:00 AM', venue: 'ITB 304', department: Department.CITE, type: 'departmental', createdAt: new Date(), updatedAt: new Date() },
    { id: '4', title: 'Seminar on the Responsible Use of AI in Information Technology and Computing Education', description: 'Seminar on the Responsible Use of AI in Information Technology and Computing Education', date: '2025-08-20', time: '08:00 AM', venue: 'TBA', department: Department.CITE, type: 'departmental', createdAt: new Date(), updatedAt: new Date() },
    { id: '5', title: 'Selection of Best Thesis and Capstone Project SY 2024 – 2025 Paper and Poster Presentation', description: 'Selection of Best Thesis and Capstone Project SY 2024 – 2025 Paper and Poster Presentation', date: '2025-08-30', time: '08:00 AM', venue: 'Smart Lab', department: Department.CITE, type: 'departmental', createdAt: new Date(), updatedAt: new Date() },
    { id: '6', title: 'Research Seminar-Workshop for Third Year CITE Students', description: 'Research Seminar-Workshop for Third Year CITE Students', date: '2025-09-05', time: '08:00 AM', venue: 'ITB 303', department: Department.CITE, type: 'departmental', createdAt: new Date(), updatedAt: new Date() },
    { id: '7', title: 'CITE Faculty, Accreditation and Accrediting Linkages Meeting for Level IV PAASCU, Accreditation of ACSF and ISIT Paper', description: 'CITE Faculty, Accreditation and Accrediting Linkages Meeting for Level IV PAASCU, Accreditation of ACSF and ISIT Paper', date: '2025-09-11', time: '08:00 AM', venue: 'CITE-Office', department: Department.CITE, type: 'departmental', createdAt: new Date(), updatedAt: new Date() },
    { id: '8', title: 'Lecture Series 1', description: 'Lecture Series 1', date: '2025-09-13', time: '08:00 AM', venue: 'ITB 201', department: Department.CITE, type: 'departmental', createdAt: new Date(), updatedAt: new Date() },
    { id: '9', title: 'Emerging Trends in Animation and Game Development', description: 'Emerging Trends in Animation and Game Development', date: '2025-09-18', time: '08:00 AM', venue: 'TBA', department: Department.CITE, type: 'departmental', createdAt: new Date(), updatedAt: new Date() },
    { id: '10', title: 'Team Building and Program Planning SITE', description: 'Team Building and Program Planning SITE', date: '2025-09-18', time: '08:00 AM', venue: 'TBA', department: Department.CITE, type: 'departmental', createdAt: new Date(), updatedAt: new Date() },
    { id: '11', title: 'CITE General Assembly and Data Privacy Awareness Seminar', description: 'CITE General Assembly and Data Privacy Awareness Seminar', date: '2025-09-27', time: '08:00 AM', venue: 'Gym', department: Department.CITE, type: 'departmental', createdAt: new Date(), updatedAt: new Date() },
    { id: '12', title: 'CITE Educational Industry Visit', description: 'CITE Educational Industry Visit', date: '2025-10-23', time: '08:00 AM', venue: 'TBA', department: Department.CITE, type: 'departmental', createdAt: new Date(), updatedAt: new Date() },
    { id: '13', title: 'GEd 10 Course MOS Certification', description: 'GEd 10 Course MOS Certification', date: '2025-10-23', time: '08:00 AM', venue: 'Comp Lab', department: Department.CITE, type: 'departmental', createdAt: new Date(), updatedAt: new Date() },
    { id: '14', title: 'GEd 10 Course MOS Certification', description: 'GEd 10 Course MOS Certification', date: '2025-10-24', time: '08:00 AM', venue: 'Comp Lab', department: Department.CITE, type: 'departmental', createdAt: new Date(), updatedAt: new Date() },
    { id: '15', title: 'GEd 10 Course MOS Certification', description: 'GEd 10 Course MOS Certification', date: '2025-10-28', time: '08:00 AM', venue: 'Comp Lab', department: Department.CITE, type: 'departmental', createdAt: new Date(), updatedAt: new Date() },
    { id: '16', title: 'GEd 10 Course MOS Certification', description: 'GEd 10 Course MOS Certification', date: '2025-10-29', time: '08:00 AM', venue: 'Comp Lab', department: Department.CITE, type: 'departmental', createdAt: new Date(), updatedAt: new Date() },
    { id: '17', title: 'Capstone Project and Computing Thesis Title Defense', description: 'Capstone Project and Computing Thesis Title Defense', date: '2025-10-27', time: '08:00 AM', venue: 'ITB 304', department: Department.CITE, type: 'departmental', createdAt: new Date(), updatedAt: new Date() },
    { id: '18', title: 'CITE Faculty Meeting', description: 'CITE Faculty Meeting', date: '2025-10-23', time: '08:00 AM', venue: 'TBA', department: Department.CITE, type: 'departmental', createdAt: new Date(), updatedAt: new Date() }
  ];

  constructor(private storageService: StorageService) {
    this.storageService.remove(this.STORAGE_KEY);
    const stored = this.storageService.get<Event[]>(this.STORAGE_KEY);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      this.eventsSubject.next(stored);
    } else {
      this.eventsSubject.next(this.mockEvents);
      this.saveToStorage(this.mockEvents);
    }
    this.events$.subscribe(events => {
      this.saveToStorage(events);
    });
  }

  private saveToStorage(events: Event[]) {
    this.storageService.set(this.STORAGE_KEY, events);
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
    console.log('Creating event with data from modal:', eventData);
    
    const validatedData = this.validateEventData(eventData);
    
    const newEvent: Event = {
      id: this.generateId(),
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentEvents = this.eventsSubject.value;
    const updatedEvents = [...currentEvents, newEvent];
    this.eventsSubject.next(updatedEvents);
    this.saveToStorage(updatedEvents);

    console.log('Event created successfully:', newEvent);

    return new BehaviorSubject(newEvent).asObservable();
  }

  updateEvent(id: string, eventData: Partial<CreateEventDto>): Observable<Event | null> {
    console.log('Updating event with data from modal:', { id, eventData });
    
    const currentEvents = this.eventsSubject.value;
    const eventIndex = currentEvents.findIndex(event => event.id === id);

    if (eventIndex === -1) {
      console.warn('Event not found for update:', id);
      return new BehaviorSubject(null).asObservable();
    }

    const validatedData = eventData.title && eventData.description && eventData.date && eventData.time && eventData.venue && eventData.department && eventData.type
      ? this.validateEventData(eventData as CreateEventDto)
      : eventData;

    const updatedEvent: Event = {
      ...currentEvents[eventIndex],
      ...validatedData,
      updatedAt: new Date()
    };

    const updatedEvents = [...currentEvents];
    updatedEvents[eventIndex] = updatedEvent;
    this.eventsSubject.next(updatedEvents);
    this.saveToStorage(updatedEvents);

    console.log('Event updated successfully:', updatedEvent);

    return new BehaviorSubject(updatedEvent).asObservable();
  }

  deleteEvent(id: string): Observable<boolean> {
    console.log('Deleting event:', id);
    
    const currentEvents = this.eventsSubject.value;
    const filteredEvents = currentEvents.filter(event => event.id !== id);
    
    if (filteredEvents.length === currentEvents.length) {
      console.warn('Event not found for deletion:', id);
      return new BehaviorSubject(false).asObservable();
    }

    this.eventsSubject.next(filteredEvents);
    this.saveToStorage(filteredEvents);
    console.log('Event deleted successfully:', id);
    
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

  getCurrentEventsArray(): Event[] {
    return this.eventsSubject.value;
  }

  // Method to get events count
  getEventsCount(): number {
    return this.eventsSubject.value.length;
  }

  // Method to format event data for display
  formatEventForDisplay(event: Event): any {
    return {
      ...event,
      formattedDate: this.formatDate(event.date),
      formattedTime: event.time, 
      formattedDateTime: `${this.formatDate(event.date)} at ${event.time}`
    };
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString + 'T00:00:00'); 
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Error formatting date:', dateString);
      return dateString;
    }
  }

  private validateEventData(eventData: CreateEventDto): CreateEventDto {
    const validated = { ...eventData };

    if (validated.time) {
      const timePattern = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s*(AM|PM)$/i;
      if (!timePattern.test(validated.time.trim())) {
        console.warn('Invalid time format received from modal:', validated.time);
        throw new Error('Invalid time format');
      } else {
        const timeParts = validated.time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (timeParts) {
          const hours = timeParts[1].padStart(2, '0');
          const minutes = timeParts[2];
          const ampm = timeParts[3].toUpperCase();
          validated.time = `${hours}:${minutes} ${ampm}`;
        }
      }
    }

    if (validated.date) {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(validated.date)) {
        console.warn('Invalid date format received from modal:', validated.date);
        throw new Error('Invalid date format');
      }
    }

    validated.title = validated.title?.trim() || '';
    validated.description = validated.description?.trim() || '';
    validated.venue = validated.venue?.trim() || '';

    return validated;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
