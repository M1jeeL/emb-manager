import type { Customer, Garment, Logo } from "../../../types";

export interface NewCustomerForm {
  name: string;
  email: string;
  phone: string;
  taxId: string;
  companyName: string;
  address: string;
  city: string;
  notes: string;
}

export interface NewGarmentForm {
  name: string;
  description: string;
}

export interface NewLogoForm {
  name: string;
  currentPrice: string;
  description: string;
}

export interface OrderBuilderLogo {
  id: string;
  logo: Logo | null;
  isNew: boolean;

  name: string;
  currentPrice: string;
  quantity: number;
  notes: string;
  description: string | null;
}

export interface OrderBuilderItem {
  id: string;

  garment: Garment | null;
  isNewGarment: boolean;

  garmentName: string;
  garmentDescription: string;

  quantity: number;

  description: string;
  notes: string;

  logos: OrderBuilderLogo[];
}

export interface OrderBuilderState {
  customer: Customer | null;
  isNewCustomer: boolean;

  newCustomer: NewCustomerForm;

  status: "QUOTE" | "PENDING";

  promisedAt: string;
  discount: string;
  notes: string;

  items: OrderBuilderItem[];
}
