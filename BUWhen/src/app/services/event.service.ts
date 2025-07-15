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
    {
      id: '1',
      title: 'University Foundation Day',
      description: 'Celebrating the founding of Baliuag University',
      date: '2025-08-15',
      time: '08:00 AM',
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
      time: '09:00 AM',
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
      time: '07:30 AM',
      venue: 'Nursing Building',
      department: Department.CNAHS,
      type: 'departmental',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      title: 'Business Summit 2025',
      description: 'Annual business summit with industry leaders',
      date: '2025-11-05',
      time: '01:00 PM',
      venue: 'CBA Conference Hall',
      department: Department.CBAA,
      type: 'departmental',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  constructor(private storageService: StorageService) {
    // Load from local storage if available, else use mockEvents
    const stored = this.storageService.get<Event[]>(this.STORAGE_KEY);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      this.eventsSubject.next(stored);
    } else {
      this.eventsSubject.next(this.mockEvents);
      this.saveToStorage(this.mockEvents);
    }
    // Subscribe to changes and persist
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
    // Log the incoming data from the modal
    console.log('Creating event with data from modal:', eventData);
    
    // Validate the data format
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
    // Log the incoming update data from the modal
    console.log('Updating event with data from modal:', { id, eventData });
    
    const currentEvents = this.eventsSubject.value;
    const eventIndex = currentEvents.findIndex(event => event.id === id);

    if (eventIndex === -1) {
      console.warn('Event not found for update:', id);
      return new BehaviorSubject(null).asObservable();
    }

    // Validate data if it's a complete update
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

  // Method to get all events for debugging
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
      formattedTime: event.time, // Already in display format from modal
      formattedDateTime: `${this.formatDate(event.date)} at ${event.time}`
    };
  }

  // Helper method to format date
  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
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

  // Validate event data from modal component
  private validateEventData(eventData: CreateEventDto): CreateEventDto {
    const validated = { ...eventData };

    // Validate time format (should be HH:MM AM/PM from modal)
    if (validated.time) {
      const timePattern = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s*(AM|PM)$/i;
      if (!timePattern.test(validated.time.trim())) {
        console.warn('Invalid time format received from modal:', validated.time);
        validated.time = '12:00 PM'; // Fallback
      } else {
        // Normalize the format
        const timeParts = validated.time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (timeParts) {
          const hours = timeParts[1].padStart(2, '0');
          const minutes = timeParts[2];
          const ampm = timeParts[3].toUpperCase();
          validated.time = `${hours}:${minutes} ${ampm}`;
        }
      }
    }

    // Validate date format
    if (validated.date) {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(validated.date)) {
        console.warn('Invalid date format received from modal:', validated.date);
        validated.date = new Date().toISOString().split('T')[0]; // Today as fallback
      }
    }

    // Trim string fields
    validated.title = validated.title?.trim() || '';
    validated.description = validated.description?.trim() || '';
    validated.venue = validated.venue?.trim() || '';

    return validated;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
