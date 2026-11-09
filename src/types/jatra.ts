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

export interface ServiceRequest {
  id: string;
  serviceType: 'WORKSHOP' | 'DOORSTEP';
  scheduledDate: string;
  issueDescription: string;
  vehicleId: string;
  centerId: string;
  mechanicId?: string;
  customerId?: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  vehicle?: Vehicle;
  customer?: User;
  mechanic?: User;
  payment?: Payment;
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

