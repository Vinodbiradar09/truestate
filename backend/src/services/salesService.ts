import pool from "../utils/db.js";
import type { SalesFilters , PaginatedResponse} from "../types/index.js";


function buildQuery(filters : SalesFilters){
    let conditions : string[] = [];
    let params : any[] = [];
    let paramIndex = 1;

    if(filters.search && filters.search.trim() !== ""){
        conditions.push(
        `(customer_name ILIKE $${paramIndex} OR phone_number ILIKE $${paramIndex})`);
        params.push(`%${filters.search.trim()}%`);
        paramIndex++;
    }


    if(filters.regions && filters.regions.length > 0){
        conditions.push(`customer_region = ANY($${paramIndex})`);
        params.push(filters.regions);
        paramIndex++;
    }

    if(filters.gender && filters.gender.length >0){
        conditions.push(`gender = ANY($${paramIndex})`);
        params.push(filters.gender);
        paramIndex++;
    }

    if(filters.ageMin !== undefined && filters.ageMin !== null){
        conditions.push(`age >= $${paramIndex}`);
        params.push(filters.ageMin);
        paramIndex++;
    }

    if(filters.ageMax !== undefined && filters.ageMax !== null){
        conditions.push(`age <= $${paramIndex}`);
        params.push(filters.ageMax);
        paramIndex++;
    }

    if(filters.categories && filters.categories.length > 0){
        conditions.push(`product_category = ANY($${paramIndex})`);
        params.push(filters.categories);
        paramIndex++;
    }

    if(filters.tags && filters.tags.length >0){
        conditions.push(`tags && $${paramIndex}`);
        params.push(filters.tags);
        paramIndex++;
    }

    if(filters.paymentMethods && filters.paymentMethods.length > 0){
        conditions.push(`payment_method = ANY($${paramIndex})`);
        params.push(filters.paymentMethods);
        paramIndex++;
    }

    if(filters.dateFrom){
        conditions.push(`date >= $${paramIndex}`);
        params.push(filters.dateFrom);
        paramIndex++;
    }

    if(filters.dateTo){
        conditions.push(`date <= $${paramIndex}`);
        params.push(filters.dateTo);
        paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : "";
    
    const sortBy = validateSortColumn(filters.sortBy || 'date');
    const sortOrder = filters.sortOrder === "asc" ? "ASC" : "DESC";
    const orderByClause = `ORDER BY ${sortBy} ${sortOrder}`;

    const limit = filters.limit || 10;
    const page = filters.page || 1;
    const offset = (page -1) * limit;
    
    params.push(limit);
    const limitIndex = paramIndex;
    paramIndex++;

    params.push(offset);
    const offsetIndex = paramIndex;

    const paginationClause = `LIMIT $${limitIndex} OFFSET $${offsetIndex}`;

    const query = `
    SELECT 
      id,
      transaction_id,
      date,
      customer_id,
      customer_name,
      phone_number,
      gender,
      age,
      customer_region,
      customer_type,
      product_id,
      product_name,
      brand,
      product_category,
      tags,
      quantity,
      price_per_unit,
      discount_percentage,
      total_amount,
      final_amount,
      payment_method,
      order_status,
      delivery_type,
      store_id,
      store_location,
      salesperson_id,
      employee_name,
      created_at
    FROM sales_transactions
    ${whereClause}
    ${orderByClause}
    ${paginationClause}
  `;

    const countQuery = `SELECT COUNT(*) FROM sales_transactions ${whereClause}`;

    return { query , countQuery , params };
}

function validateSortColumn(sortBy: string): string {
  const allowedColumns: { [key: string]: string } = {
    date: 'date',
    quantity: 'quantity',
    customer_name: 'customer_name',
  };

  return allowedColumns[sortBy] || 'date'; 
}

export async function getSales(filters : SalesFilters) : Promise<PaginatedResponse> {
    const { query , countQuery , params } = buildQuery(filters);

    try {
        const dataResult = await pool.query(query , params);
        const countResult = await pool.query(countQuery , params.slice(0 , -2));
        console.log("count" , countResult);

        const total = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(total / filters.limit);
        return {
            data : dataResult.rows,
            pagination : {
                page : filters.page,
                limit : filters.limit,
                total,
                totalPages,
            }
        }
    } catch (error) {
        console.log("error in getting the sales data" , error);
        throw error;
    }
}



export async function getFilterOptions() {
    try {
        const queries = {
            regions: 'SELECT DISTINCT customer_region FROM sales_transactions WHERE customer_region IS NOT NULL ORDER BY customer_region',
            genders: 'SELECT DISTINCT gender FROM sales_transactions WHERE gender IS NOT NULL ORDER BY gender',
            categories: 'SELECT DISTINCT product_category FROM sales_transactions WHERE product_category IS NOT NULL ORDER BY product_category',
            paymentMethods: 'SELECT DISTINCT payment_method FROM sales_transactions WHERE payment_method IS NOT NULL ORDER BY payment_method',
            tags: 'SELECT DISTINCT UNNEST(tags) as tag FROM sales_transactions ORDER BY tag',
        };

        const [ regions , genders , categories , paymentMethods , tags] = await Promise.all([
            pool.query(queries.regions),
            pool.query(queries.genders),
            pool.query(queries.categories),
            pool.query(queries.paymentMethods),
            pool.query(queries.tags),
        ]); 
        console.log("tags" , tags.rows.map((t)=> t));
        return {
            regions : regions.rows.map((r)=> r.customer_region).filter(Boolean),
            genders : genders.rows.map((r)=> r.gender).filter(Boolean),
            categories : categories.rows.map((r)=> r.product_category).filter(Boolean),
            paymentMethods : paymentMethods.rows.map((r)=> r.payment_method).filter(Boolean),
            tags : tags.rows.map((r)=> r.tag).filter(Boolean),
            ageRange: { min: 0, max: 100 },
            dateRange: {
                min: '2020-01-01',
                max: new Date().toISOString().split('T')[0],
            },
        }
    } catch (error) {
        console.error('error in getFilterOptions:', error);
        throw error;
    }
}