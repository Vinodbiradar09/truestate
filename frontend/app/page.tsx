'use client';
import { useSales } from '@/app/hooks/useSales';
import SearchBar from '@/components/SearchBar';
import StatsCards from '@/components/StatsCards';
import FilterPanel from '@/components/FilterPanel';
import SortDropdown from '@/components/SortDropdown';
import SalesTable from '@/components/SalesTable';
import Pagination from '@/components/Pagination';

export default function Home() {
  const {
    sales,
    filterOptions,
    pagination,
    loading,
    error,
    currentFilters,
    setSearch,
    setRegions,
    setGender,
    setCategories,
    setTags,
    setPaymentMethods,
    setAgeRange,
    setDateRange,
    setSort,
    setPage,
    clearFilters,
  } = useSales();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Sales Management System</h1>
            <SearchBar
              value={currentFilters.search}
              onSearch={setSearch}
              placeholder="Name, Phone no."
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <StatsCards />

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <FilterPanel
                filterOptions={filterOptions}
                currentFilters={currentFilters}
                onRegionsChange={setRegions}
                onGenderChange={setGender}
                onCategoriesChange={setCategories}
                onTagsChange={setTags}
                onPaymentMethodsChange={setPaymentMethods}
                onAgeRangeChange={setAgeRange}
                onDateRangeChange={setDateRange}
                onClearAll={clearFilters}
              />
            </div>
            <SortDropdown
              sortBy={currentFilters.sortBy!}
              sortOrder={currentFilters.sortOrder!}
              onSortChange={setSort}
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <SalesTable data={sales} loading={loading} />
          {!loading && sales.length > 0 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalRecords={pagination.total}
              recordsPerPage={pagination.limit}
              onPageChange={setPage}
            />
          )}
        </div>
      </main>
      <footer className="border-t mt-8">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
         
          </p>
        </div>
      </footer>
    </div>
  );
}