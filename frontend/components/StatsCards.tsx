'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon?: boolean;
}

function StatCard({ title, value, icon = true }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {icon && <Info className="h-4 w-4 text-muted-foreground" />}
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard title="Total units sold" value="10" />
      <StatCard title="Total Amount" value="₹89,000 (19 SRs)" />
      <StatCard title="Total Discount" value="₹15000 (45 SRs)" />
    </div>
  );
}