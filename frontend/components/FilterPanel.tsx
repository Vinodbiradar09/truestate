'use client';
import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface FilterPanelProps {
  filterOptions: {
    regions: string[];
    genders: string[];
    categories: string[];
    paymentMethods: string[];
    tags: string[];
    ageRange: { min: number; max: number };
    dateRange: { min: string; max: string };
  } | null;
  currentFilters: {
    regions?: string[];
    gender?: string[];
    categories?: string[];
    tags?: string[];
    paymentMethods?: string[];
    ageMin?: number;
    ageMax?: number;
    dateFrom?: string;
    dateTo?: string;
  };
  onRegionsChange: (regions: string[]) => void;
  onGenderChange: (gender: string[]) => void;
  onCategoriesChange: (categories: string[]) => void;
  onTagsChange: (tags: string[]) => void;
  onPaymentMethodsChange: (methods: string[]) => void;
  onAgeRangeChange: (min?: number, max?: number) => void;
  onDateRangeChange: (from?: string, to?: string) => void;
  onClearAll: () => void;
}

export default function FilterPanel({
  filterOptions,
  currentFilters,
  onRegionsChange,
  onGenderChange,
  onCategoriesChange,
  onTagsChange,
  onPaymentMethodsChange,
  onAgeRangeChange,
  onDateRangeChange,
  onClearAll,
}: FilterPanelProps) {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    currentFilters.dateFrom ? new Date(currentFilters.dateFrom) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    currentFilters.dateTo ? new Date(currentFilters.dateTo) : undefined
  );

  const hasActiveFilters =
    (currentFilters.regions?.length ?? 0) > 0 ||
    (currentFilters.gender?.length ?? 0) > 0 ||
    (currentFilters.categories?.length ?? 0) > 0 ||
    (currentFilters.tags?.length ?? 0) > 0 ||
    (currentFilters.paymentMethods?.length ?? 0) > 0 ||
    currentFilters.ageMin !== undefined ||
    currentFilters.ageMax !== undefined ||
    currentFilters.dateFrom !== undefined ||
    currentFilters.dateTo !== undefined;

  const MultiSelectDropdown = ({
    label,
    options,
    selected,
    onChange,
  }: {
    label: string;
    options: string[];
    selected: string[];
    onChange: (values: string[]) => void;
  }) => {
    const [open, setOpen] = useState(false);

    const toggleOption = (option: string) => {
      if (selected.includes(option)) {
        onChange(selected.filter((item) => item !== option));
      } else {
        onChange([...selected, option]);
      }
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[180px] justify-between"
          >
            <span className="truncate">
              {selected.length > 0 ? `${label} (${selected.length})` : label}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <div className="max-h-[300px] overflow-y-auto p-2">
            {options.map((option) => (
              <div
                key={option}
                className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                onClick={() => toggleOption(option)}
              >
                <Checkbox
                  checked={selected.includes(option)}
                  onCheckedChange={() => toggleOption(option)}
                />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
          {selected.length > 0 && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange([])}
                className="w-full"
              >
                Clear
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  };

  if (!filterOptions) {
    return <div className="text-sm text-muted-foreground">Loading filters...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <MultiSelectDropdown
          label="Customer Region"
          options={filterOptions.regions}
          selected={currentFilters.regions || []}
          onChange={onRegionsChange}
        />

        <MultiSelectDropdown
          label="Gender"
          options={filterOptions.genders}
          selected={currentFilters.gender || []}
          onChange={onGenderChange}
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-between">
              <span className="truncate">
                {currentFilters.ageMin || currentFilters.ageMax
                  ? `Age: ${currentFilters.ageMin || 0}-${currentFilters.ageMax || 100}`
                  : 'Age Range'}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px]">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Age</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={currentFilters.ageMin ?? ''}
                  onChange={(e) =>
                    onAgeRangeChange(
                      e.target.value ? parseInt(e.target.value) : undefined,
                      currentFilters.ageMax
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Age</label>
                <Input
                  type="number"
                  placeholder="100"
                  value={currentFilters.ageMax ?? ''}
                  onChange={(e) =>
                    onAgeRangeChange(
                      currentFilters.ageMin,
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAgeRangeChange(undefined, undefined)}
                className="w-full"
              >
                Clear
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <MultiSelectDropdown
          label="Product Category"
          options={filterOptions.categories}
          selected={currentFilters.categories || []}
          onChange={onCategoriesChange}
        />
        <MultiSelectDropdown
          label="Tags"
          options={filterOptions.tags}
          selected={currentFilters.tags || []}
          onChange={onTagsChange}
        />
        <MultiSelectDropdown
          label="Payment Method"
          options={filterOptions.paymentMethods}
          selected={currentFilters.paymentMethods || []}
          onChange={onPaymentMethodsChange}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-between">
              <span className="truncate">
                {currentFilters.dateFrom || currentFilters.dateTo
                  ? `Date: ${currentFilters.dateFrom ? format(new Date(currentFilters.dateFrom), 'PP') : '...'} - ${currentFilters.dateTo ? format(new Date(currentFilters.dateTo), 'PP') : '...'}`
                  : 'Date'}
              </span>
              <CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">From</label>
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={(date) => {
                    setDateFrom(date);
                    onDateRangeChange(
                      date ? format(date, 'yyyy-MM-dd') : undefined,
                      currentFilters.dateTo
                    );
                  }}
                  initialFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={(date) => {
                    setDateTo(date);
                    onDateRangeChange(
                      currentFilters.dateFrom,
                      date ? format(date, 'yyyy-MM-dd') : undefined
                    );
                  }}
                  initialFocus
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateFrom(undefined);
                  setDateTo(undefined);
                  onDateRangeChange(undefined, undefined);
                }}
                className="w-full"
              >
                Clear
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {currentFilters.regions?.map((region) => (
            <Badge key={region} variant="secondary">
              {region}
              <button
                onClick={() =>
                  onRegionsChange(currentFilters.regions!.filter((r) => r !== region))
                }
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {currentFilters.gender?.map((g) => (
            <Badge key={g} variant="secondary">
              {g}
              <button
                onClick={() =>
                  onGenderChange(currentFilters.gender!.filter((item) => item !== g))
                }
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {currentFilters.categories?.map((cat) => (
            <Badge key={cat} variant="secondary">
              {cat}
              <button
                onClick={() =>
                  onCategoriesChange(currentFilters.categories!.filter((c) => c !== cat))
                }
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {currentFilters.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
              <button
                onClick={() =>
                  onTagsChange(currentFilters.tags!.filter((t) => t !== tag))
                }
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {currentFilters.paymentMethods?.map((method) => (
            <Badge key={method} variant="secondary">
              {method}
              <button
                onClick={() =>
                  onPaymentMethodsChange(
                    currentFilters.paymentMethods!.filter((m) => m !== method)
                  )
                }
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
