export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  department: Department;
  type: 'university' | 'departmental';
  createdAt: Date;
  updatedAt: Date;
}

export enum Department {
  CITE = 'CITE',
  CHMT = 'CHMT',
  CBA = 'CBA',
  CAS = 'CAS',
  COE = 'COE',
  NURSING = 'Nursing',
  EDUCATION = 'Education',
  UNIVERSITY = 'University'
}

export interface CreateEventDto {
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  department: Department;
  type: 'university' | 'departmental';
}
