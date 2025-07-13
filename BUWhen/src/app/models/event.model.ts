export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  department: Department;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string; 
}

export enum Department {
  CITE = 'CITE',
  CHMT = 'CHMT',
  CBAA = 'CBAA',
  CLAGE = 'CLAGE',
  CEDE = 'CEDE',
  CNAHS = ' CNAHS',
  CHED = 'CHED',
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
