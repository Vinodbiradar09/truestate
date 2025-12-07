'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SortDropdownProps {
  sortBy: 'date' | 'quantity' | 'customer_name';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'date' | 'quantity' | 'customer_name', sortOrder: 'asc' | 'desc') => void;
}

export default function SortDropdown({ sortBy, sortOrder, onSortChange }: SortDropdownProps) {
  const currentValue = `${sortBy}-${sortOrder}`;

  const handleChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-') as [
      'date' | 'quantity' | 'customer_name',
      'asc' | 'desc'
    ];
    onSortChange(newSortBy, newSortOrder);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
      <Select value={currentValue} onValueChange={handleChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date-desc">Date (Newest First)</SelectItem>
          <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
          <SelectItem value="quantity-desc">Quantity (High to Low)</SelectItem>
          <SelectItem value="quantity-asc">Quantity (Low to High)</SelectItem>
          <SelectItem value="customer_name-asc">Customer Name (A-Z)</SelectItem>
          <SelectItem value="customer_name-desc">Customer Name (Z-A)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

