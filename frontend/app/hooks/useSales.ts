"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  SalesTransaction,
  SalesFilters,
  FilterOptions,
} from "@/app/types/index";
import { fetchSales, fetchFilterOptions } from "@/app/lib/api";

export function useSales() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [sales, setSales] = useState<SalesTransaction[]>([]);
  const [filterOptions, setFilterOptions] = useState<
    FilterOptions["data"] | null
  >(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseFilters = useCallback((): SalesFilters => {
    return {
      search: searchParams.get("search") || undefined,
      regions:
        searchParams.getAll("regions").length > 0
          ? searchParams.getAll("regions")
          : undefined,
      gender:
        searchParams.getAll("gender").length > 0
          ? searchParams.getAll("gender")
          : undefined,
      categories:
        searchParams.getAll("categories").length > 0
          ? searchParams.getAll("categories")
          : undefined,
      tags:
        searchParams.getAll("tags").length > 0
          ? searchParams.getAll("tags")
          : undefined,
      paymentMethods:
        searchParams.getAll("paymentMethods").length > 0
          ? searchParams.getAll("paymentMethods")
          : undefined,
      ageMin: searchParams.get("ageMin")
        ? parseInt(searchParams.get("ageMin")!)
        : undefined,
      ageMax: searchParams.get("ageMax")
        ? parseInt(searchParams.get("ageMax")!)
        : undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      sortBy:
        (searchParams.get("sortBy") as "date" | "quantity" | "customer_name") ||
        "date",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      page: parseInt(searchParams.get("page") || "1"),
      limit: 10,
    };
  }, [searchParams]);

  const updateFilters = useCallback(
    (newFilters: Partial<SalesFilters>) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!("page" in newFilters)) {
        params.set("page", "1");
      }

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === " ") {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.delete(key);
          if (value.length > 0) {
            value.forEach((v) => params.append(key, v));
          }
        } else {
          params.set(key, value.toString());
        }
      });

      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const loadSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = parseFilters();
      const response = await fetchSales(filters);
      setSales(response.data);
      setPagination(response.pagination);
    } catch (error) {
      setError(error instanceof Error ? error.message : "failed to load sales");
      console.error("error loading sales", error);
    } finally {
      setLoading(false);
    }
  }, [parseFilters]);

  const loadFilterOptions = useCallback(async () => {
    try {
      const response = await fetchFilterOptions();
      setFilterOptions(response.data);
    } catch (err) {
      console.error("error loading filter options", err);
    }
  }, []);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);


  const setSearch = (search : string)=> updateFilters({search});
  const setRegions = (regions : string[])=> updateFilters({regions});
  const setGender = (gender: string[]) => updateFilters({ gender });
  const setCategories = (categories: string[]) => updateFilters({ categories });
  const setTags = (tags: string[]) => updateFilters({ tags });
  const setPaymentMethods = (paymentMethods: string[]) => updateFilters({ paymentMethods });
  const setAgeRange = (ageMin?: number, ageMax?: number) => updateFilters({ ageMin, ageMax });
  const setDateRange = (dateFrom?: string, dateTo?: string) => updateFilters({ dateFrom, dateTo });
  const setSort = (sortBy: 'date' | 'quantity' | 'customer_name', sortOrder: 'asc' | 'desc') => 
    updateFilters({ sortBy, sortOrder });
  const setPage = (page: number) => updateFilters({ page });
  const clearFilters = () => router.push(pathname);

const currentFilters = parseFilters();

return {
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
    refresh: loadSales,
  };
}


