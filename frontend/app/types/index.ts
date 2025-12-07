export interface SalesTransaction {
  id: number;
  transaction_id: string;
  date: string;
  customer_id: string;
  customer_name: string;
  phone_number: string;
  gender: string;
  age: number;
  customer_region: string;
  customer_type: string;
  product_id: string;
  product_name: string;
  brand: string;
  product_category: string;
  tags: string[];
  quantity: number;
  price_per_unit: number;
  discount_percentage: number;
  total_amount: number;
  final_amount: number;
  payment_method: string;
  order_status: string;
  delivery_type: string;
  store_id: string;
  store_location: string;
  salesperson_id: string;
  employee_name: string;
  created_at?: string;
}

export interface SalesFilters {
  search?: string;
  regions?: string[];
  gender?: string[];
  ageMin?: number;
  ageMax?: number;
  categories?: string[];
  tags?: string[];
  paymentMethods?: string[];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'date' | 'quantity' | 'customer_name';
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface PaginatedResponse {
  success: boolean;
  data: SalesTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilterOptions {
  success: boolean;
  data: {
    regions: string[];
    genders: string[];
    categories: string[];
    paymentMethods: string[];
    tags: string[];
    ageRange: { min: number; max: number };
    dateRange: { min: string; max: string };
  };
}

