export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN' | 'MECHANIC';
}

export interface AutomotiveCenter {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  rating?: number;
  isApproved?: boolean;
  servicesOffered?: string[];
  images?: string[];
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
}

export interface RentalBooking {
  id: string;
  vehicleId: string;
  pickupDate: string;
  returnDate: string;
  totalAmount: number;
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
}

export interface ServiceRequest {
  id: string;
  serviceType: 'WORKSHOP' | 'MOBILE';
  scheduledDate: string;
  issueDescription: string;
  vehicleId: string;
  centerId: string;
  mechanicId?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface Emergency {
  id: string;
  latitude: number;
  longitude: number;
  issueDescription: string;
  centerId: string;
  status: 'PENDING' | 'RESOLVED';
}
