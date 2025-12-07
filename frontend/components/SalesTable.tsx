'use client';

import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SalesTransaction } from '@/app/types/index';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SalesTableProps {
  data: SalesTransaction[];
  loading?: boolean;
}

export default function SalesTable({ data, loading = false }: SalesTableProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No transactions found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Transaction ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer ID</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead className="text-right">Age</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Customer Type</TableHead>
            <TableHead>Product ID</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Price/Unit</TableHead>
            <TableHead className="text-right">Discount %</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
            <TableHead className="text-right">Final Amount</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Order Status</TableHead>
            <TableHead>Delivery Type</TableHead>
            <TableHead>Store ID</TableHead>
            <TableHead>Store Location</TableHead>
            <TableHead>Salesperson ID</TableHead>
            <TableHead>Employee Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                {transaction.transaction_id}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {transaction.date
                  ? format(new Date(transaction.date), 'yyyy-MM-dd')
                  : '-'}
              </TableCell>
              <TableCell>{transaction.customer_id}</TableCell>
              <TableCell className="whitespace-nowrap">
                {transaction.customer_name}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span>{transaction.phone_number}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(transaction.phone_number)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>{transaction.gender}</TableCell>
              <TableCell className="text-right">{transaction.age}</TableCell>
              <TableCell>{transaction.customer_region}</TableCell>
              <TableCell>{transaction.customer_type}</TableCell>
              <TableCell>{transaction.product_id}</TableCell>
              <TableCell className="min-w-[150px]">
                {transaction.product_name}
              </TableCell>
              <TableCell>{transaction.brand}</TableCell>
              <TableCell>
                <Badge variant="outline">{transaction.product_category}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {transaction.tags?.map((tag : any, idx : any) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right">{transaction.quantity}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(transaction.price_per_unit)}
              </TableCell>
              <TableCell className="text-right">
                {transaction.discount_percentage}%
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(transaction.total_amount)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(transaction.final_amount)}
              </TableCell>
              <TableCell>{transaction.payment_method}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    transaction.order_status === 'Completed'
                      ? 'default'
                      : transaction.order_status === 'Cancelled'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {transaction.order_status}
                </Badge>
              </TableCell>
              <TableCell>{transaction.delivery_type}</TableCell>
              <TableCell>{transaction.store_id}</TableCell>
              <TableCell className="whitespace-nowrap">
                {transaction.store_location}
              </TableCell>
              <TableCell>{transaction.salesperson_id}</TableCell>
              <TableCell className="whitespace-nowrap">
                {transaction.employee_name}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}