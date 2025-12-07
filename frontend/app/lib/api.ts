import axios from "axios";
import { SalesFilters, PaginatedResponse, FilterOptions } from '@/app/types/index';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://truestate-cm5m.vercel.app';

// const API_BASE_URL ='http://localhost:4004';
const apiClient = axios.create({
    baseURL : API_BASE_URL,
    headers : {
        "Content-Type" : "application/json",
    },
    timeout : 10000,
});


export async function fetchSales(filters : SalesFilters) : Promise<PaginatedResponse> {
    try {
        const params: Record<string, any> = {};
        if(filters.search) params.search = filters.search;
        if (filters.regions?.length) params.regions = filters.regions;
        if (filters.gender?.length) params.gender = filters.gender;
        if (filters.categories?.length) params.categories = filters.categories;
        if (filters.tags?.length) params.tags = filters.tags;
        if (filters.paymentMethods?.length) params.paymentMethods = filters.paymentMethods;
        if (filters.ageMin !== undefined) params.ageMin = filters.ageMin;
        if (filters.ageMax !== undefined) params.ageMax = filters.ageMax;
        if (filters.dateFrom) params.dateFrom = filters.dateFrom;
        if (filters.dateTo) params.dateTo = filters.dateTo;
        if(filters.sortBy) params.sortBy = filters.sortBy;
        if(filters.sortOrder) params.sortOrder = filters.sortOrder;

        params.page= filters.page;
        params.limit = filters.limit;

        const response = await apiClient.get<PaginatedResponse>('/api/sales' , {
            params,
            paramsSerializer : {
                indexes : null, //This makes arrays serialize as: regions=East&regions=West
            }
        })
        return response.data;
    } catch (error) {
        console.log("error in fetching the sales data");
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || 'Failed to fetch sales data');
        }
        throw error;
    }
}   


export async function fetchFilterOptions() : Promise<FilterOptions> {
    try {
        const response = await apiClient.get<FilterOptions>('/api/sales/filters');
        return response.data;
    } catch (error) {
        console.log("error in the fetch filter options" , error);
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error || 'Failed to fetch filter options');
        }
        throw error;
    }
}


export default apiClient;