export interface User {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  role: 'citizen' | 'agent' | 'admin' | 'super_admin';
  commune?: Commune;
  is_phone_verified: boolean;
  avatar_url?: string;
}

export interface Commune {
  id: string;
  name: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

export interface Structure {
  id: string;
  name: string;
  type: string;
  categories: string[];
}

export interface Report {
  id: string;
  category: string;
  quartier: string;
  description?: string;
  photo_url: string;
  latitude?: number;
  longitude?: number;
  status: 'pending' | 'received' | 'in_progress' | 'resolved' | 'rejected';
  commune?: Commune;
  structure?: Structure;
  ticket?: Ticket;
  created_at: string;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  status: 'received' | 'in_progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status_history: StatusHistory[];
  report?: Report;
  messages?: TicketMessage[];
  resolved_at?: string;
  created_at: string;
}

export interface StatusHistory {
  status: string;
  date: string;
  note?: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'citizen' | 'agent';
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  data: Record<string, string>;
  is_read: boolean;
  created_at: string;
}
