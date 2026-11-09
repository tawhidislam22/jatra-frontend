export interface User {
  id: string;
  email: string;
  fullName: string;
  name?: string;
  phone: string;
  role: 'CUSTOMER' | 'OWNER' | 'ADMIN' | 'MECHANIC';
  status?: string;
  image?: string;
  managedCenter?: AutomotiveCenter;
  managedCenters?: AutomotiveCenter[];
  employedAtCenterId?: string;
  employedAtCenter?: AutomotiveCenter;
}

export interface AutomotiveCenter {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  description?: string;
  rating?: number;
  isApproved?: boolean;
  servicesOffered?: string[];
  images?: string[];
  adminId?: string;
  admin?: User;
  mechanics?: User[];
  rentalFleet?: Vehicle[];
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  type: 'CUSTOMER_OWNED' | 'RENTAL_FLEET';
  pricePerDay?: number;
  isAvailable?: boolean;
  features?: string[];
  images?: string[];
  centerId?: string;
  ownerId?: string;
}

export interface RentalBooking {
  id: string;
  vehicleId: string;
  customerId?: string;
  pickupDate: string;
  returnDate: string;
  totalAmount: number;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  vehicle?: Vehicle;
  customer?: User;
  payment?: Payment;
}

export interface ServiceAssignmentHistory {
  id: string;
  serviceRequestId: string;
  mechanicId: string;
  assignedById: string;
  status: string;
  notes?: string;
  assignedAt: string;
  mechanic?: User;
  assignedBy?: User;
}

export interface ServiceRequest {
  id: string;
  serviceType: 'WORKSHOP' | 'DOORSTEP';
  serviceName?: string;
  scheduledDate: string;
  issueDescription?: string;
  problemImages?: string[];
  completionImages?: string[];
  reworkNotes?: string;
  estimatedDuration?: number;
  totalAmount?: number;
  approvedAt?: string;
  vehicleId: string;
  centerId: string;
  mechanicId?: string;
  customerId?: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED_PENDING_REVIEW' | 'DONE' | 'COMPLETED' | 'REASSIGNMENT_REQUIRED' | 'CANCELLED';
  vehicle?: Vehicle;
  customer?: User;
  center?: AutomotiveCenter;
  mechanic?: User;
  payment?: Payment;
  review?: Review;
  assignmentHistory?: ServiceAssignmentHistory[];
}

export interface Payment {
  id: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  transactionId?: string;
  paidAt?: string;
  userId?: string;
  rentalBookingId?: string;
  serviceRequestId?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt?: string;
  customer?: User;
  centerId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string | null;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    fullName?: string;
    image?: string;
    role?: string;
  };
}

export interface Conversation {
  id: string;
  otherParticipant: {
    id: string;
    name: string;
    fullName?: string;
    email: string;
    image?: string;
    role: string;
  };
  center?: {
    id: string;
    name: string;
    address: string;
    phone?: string;
    images?: string[];
  };
  rentalBooking?: {
    id: string;
    pickupDate: string;
    returnDate: string;
    totalAmount: number;
    status: string;
    vehicle?: {
      id: string;
      make: string;
      model: string;
      year?: number;
      images?: string[];
    };
  };
  serviceRequest?: {
    id: string;
    serviceType: string;
    scheduledDate: string;
    status: string;
    issueDescription?: string;
    vehicle?: {
      id: string;
      make: string;
      model: string;
      year?: number;
    };
  };
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
}

