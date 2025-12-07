import type { Request , Response } from "express";
import { getSales , getFilterOptions } from "../services/salesService.js";
import type{ SalesFilters } from "../types/index.js";

export async function getSalesController(req : Request , res : Response) {
    try {
        const { search , regions , gender , ageMin , ageMax , categories , tags , paymentMethods , dateFrom , dateTo , sortBy , sortOrder , page , limit } = req.query;
        // @ts-ignore
        const filters : SalesFilters = {
            search : search ?String(search) : undefined,
            regions : regions ? parseArrayParam(regions) : undefined,
            gender : gender ? parseArrayParam(gender) : undefined,
            categories : categories ? parseArrayParam(categories) : undefined,
            tags : tags ? parseArrayParam(tags) : undefined,
            paymentMethods : paymentMethods ? parseArrayParam(paymentMethods) : undefined,
            ageMin : ageMin ? parseInt(String(ageMin)) : undefined,
            ageMax: ageMax ? parseInt(String(ageMax)) : undefined,
            dateFrom: dateFrom ? String(dateFrom) : undefined,
            dateTo: dateTo ? String(dateTo) : undefined,
            sortBy: sortBy ? String(sortBy) as 'date' | 'quantity' | 'customer_name' : 'date',
            sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
            page : page ? parseInt(String(page)) : 1,
            limit : limit ? parseInt(String(limit)) : 10,
        }

        if (filters.page < 1) {
        filters.page = 1;
        }

        if (filters.limit < 1) {
        filters.limit = 10;
        }
        if (filters.limit > 100) {
        filters.limit = 100;
        }

        if (filters.ageMin !== undefined && filters.ageMin < 0) {
            filters.ageMin = 0;
        }
        if (filters.ageMax !== undefined && filters.ageMax > 150) {
            filters.ageMax = 150;
        }

        if (
            filters.ageMin !== undefined &&
            filters.ageMax !== undefined &&
            filters.ageMin > filters.ageMax
        ) {
            [filters.ageMin, filters.ageMax] = [filters.ageMax, filters.ageMin];
        }

        if (filters.dateFrom && !isValidDate(filters.dateFrom)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid dateFrom format. Use YYYY-MM-DD',
            });
        }

        if (filters.dateTo && !isValidDate(filters.dateTo)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid dateTo format. Use YYYY-MM-DD',
            });
        }

        const result = await getSales(filters);
        if(!result){
            return res.status(400).json({
                success : false,
                message : "error in get sales",
            })
        }
        res.status(200).json({
            success : true,
            ...result,
        })
    } catch (error) {
        console.log("error in getSalesController" , error);
        res.status(500).json({
            success: false,
            message: 'internal server error',
        });
    }
}

export async function getFilterOptionsController(req: Request, res: Response) {
  try {
    const options = await getFilterOptions();

    res.status(200).json({
      success: true,
      data: options,
    });
  } catch (error) {
    console.error('Error in getFilterOptionsController:', error);
    res.status(500).json({
      success: false,
      message: 'internal server error',
    });
  }
}


function parseArrayParam(param: any): string[] {
  if (Array.isArray(param)) {
    return param.map(String);
  } else if (typeof param === 'string') {
    return param.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}