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

export interface IWorkshopServicePackage {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDuration: number;
  category?: string;
  iconName?: string;
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
  customServices?: IWorkshopServicePackage[];
  images?: string[];
  adminId?: string;
  admin?: User;
  mechanics?: User[];
  rentalFleet?: Vehicle[];
  totalMechanicsCount?: number;
  freeSlotsCount?: number;
  nextFreeSlot?: string | null;
  availableSlots?: string[];
  isBookable?: boolean;
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
  center?: AutomotiveCenter;
  owner?: User;
}

export interface RentalBooking {
  id: string;
  vehicleId: string;
  customerId?: string;
  pickupDate: string;
  returnDate: string;
  totalAmount: number;
  dailyPriceSnapshot?: number;
  cancellationFee?: number;
  refundAmount?: number;
  cancelledAt?: string;
  cancellationReason?: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  vehicle?: Vehicle;
  customer?: User;
  payment?: Payment;
  cancellationRecord?: CancellationRecord;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  reason: 'REFUND' | 'PAYMENT' | 'DEPOSIT';
  description: string;
  cancellationFee?: number;
  refundAmount?: number;
  referenceId?: string;
  rentalBookingId?: string;
  rentalBooking?: {
    id: string;
    vehicle?: { make: string; model: string; year: number; licensePlate: string };
  };
  serviceRequestId?: string;
  serviceRequest?: {
    id: string;
    serviceName?: string;
    serviceType?: string;
    scheduledDate?: string;
  };
  createdAt: string;
}

export interface CancellationRecord {
  id: string;
  userId: string;
  rentalBookingId?: string;
  serviceRequestId?: string;
  originalAmount: number;
  feePercentage: number;
  cancellationFee: number;
  refundAmount: number;
  refundedToWallet: boolean;
  reason?: string;
  cancelledAt: string;
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
  cancellationFee?: number;
  refundAmount?: number;
  cancelledAt?: string;
  cancellationReason?: string;
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
    phone?: string;
    image?: string;
    role: string;
  };
  center?: {
    id: string;
    adminId?: string;
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
    customer?: {
      id: string;
      name: string;
      fullName?: string;
      email: string;
      phone?: string;
      image?: string;
      role: string;
    };
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
    serviceName?: string;
    scheduledDate: string;
    status: string;
    issueDescription?: string;
    customer?: {
      id: string;
      name: string;
      fullName?: string;
      email: string;
      phone?: string;
      image?: string;
      role: string;
    };
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

export interface WishlistVehicleItem {
  wishlistId: string;
  addedAt: string;
  vehicle: Vehicle;
}

export interface WishlistCenterItem {
  wishlistId: string;
  addedAt: string;
  center: AutomotiveCenter;
}

export interface WishlistData {
  total: number;
  vehicles: WishlistVehicleItem[];
  centers: WishlistCenterItem[];
}

export interface WishlistIds {
  vehicleIds: string[];
  centerIds: string[];
}

