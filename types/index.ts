export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'package' | 'addon';
}

export interface EventDetails {
  eventStartTime: string;
  eventEndTime: string;
  eventLocation: string;
  companyName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface OrderDetails {
  id: string;
  orderDate: Date;
  eventDate: Date;
  total: number;
  status: string;
  items: OrderItem[];
  eventDetails: EventDetails;
}

export type Package = {
  id: string;
  name: string;
  description: string;
  price: number;
  keyFeatures: never[];
  image: string;
  slug: string;
  includedItems: never[];
  additionalImages: never[];
  useCaseLabels: string[];
}; 