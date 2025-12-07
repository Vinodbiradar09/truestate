import pool from "./db.js";
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CSVRow {
  'Transaction ID': string;
  'Date': string;
  'Customer ID': string;
  'Customer Name': string;
  'Phone Number': string;
  'Gender': string;
  'Age': string;
  'Customer Region': string;
  'Customer Type': string;
  'Product ID': string;
  'Product Name': string;
  'Brand': string;
  'Product Category': string;
  'Tags': string;
  'Quantity': string;
  'Price per Unit': string;
  'Discount Percentage': string;
  'Total Amount': string;
  'Final Amount': string;
  'Payment Method': string;
  'Order Status': string;
  'Delivery Type': string;
  'Store ID': string;
  'Store Location': string;
  'Salesperson ID': string;
  'Employee Name': string;
}

async function createTable() {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS sales_transactions (
      id SERIAL PRIMARY KEY,
      transaction_id VARCHAR(50),
      date DATE,
      customer_id VARCHAR(50),
      customer_name VARCHAR(255),
      phone_number VARCHAR(20),
      gender VARCHAR(20),
      age INTEGER,
      customer_region VARCHAR(100),
      customer_type VARCHAR(50),
      product_id VARCHAR(50),
      product_name VARCHAR(255),
      brand VARCHAR(100),
      product_category VARCHAR(100),
      tags TEXT[],
      quantity INTEGER,
      price_per_unit DECIMAL(10,2),
      discount_percentage DECIMAL(5,2),
      total_amount DECIMAL(10,2),
      final_amount DECIMAL(10,2),
      payment_method VARCHAR(50),
      order_status VARCHAR(50),
      delivery_type VARCHAR(50),
      store_id VARCHAR(50),
      store_location VARCHAR(255),
      salesperson_id VARCHAR(50),
      employee_name VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await pool.query(createTableQuery);
  console.log("table created successfully");
}

async function createIndexes() {
    const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_customer_name ON sales_transactions(customer_name)',
    'CREATE INDEX IF NOT EXISTS idx_phone_number ON sales_transactions(phone_number)',
    'CREATE INDEX IF NOT EXISTS idx_customer_region ON sales_transactions(customer_region)',
    'CREATE INDEX IF NOT EXISTS idx_gender ON sales_transactions(gender)',
    'CREATE INDEX IF NOT EXISTS idx_age ON sales_transactions(age)',
    'CREATE INDEX IF NOT EXISTS idx_product_category ON sales_transactions(product_category)',
    'CREATE INDEX IF NOT EXISTS idx_payment_method ON sales_transactions(payment_method)',
    'CREATE INDEX IF NOT EXISTS idx_date ON sales_transactions(date)',
    'CREATE INDEX IF NOT EXISTS idx_tags ON sales_transactions USING GIN(tags)',
  ];

  for(const indexQuery of indexes){
    await pool.query(indexQuery);
  }
  console.log("indexes created successfully");
}

function parseDate( dateStr : string) : string | null{
    if(!dateStr || dateStr === '########') {
        console.log("date format gadbad");
        return null;
    }

    try {
        const date = new Date(dateStr);
        if(!isNaN(date.getTime())){
            return date.toISOString().split("T")[0]!;
        }
        return null;
    } catch (error) {
        console.log("error in parseDate" , error);
        return null;
    }
}

function parseTags(tagsStr : string) : string[]{
    if(!tagsStr) return [];
    return tagsStr.split(',').map(tag => tag.trim()).filter(Boolean);
}

async function insertData() {

    const csvPath = path.join(__dirname, '../../data/sales_10k.csv');
    const csvFile = fs.readFileSync(csvPath , "utf-8");

    console.log("parsing csv file");

    const parsed = Papa.parse<CSVRow>(csvFile , {
        header : true,
        skipEmptyLines : true,
    });

    const rowsToInsert = parsed.data.slice(0 , 10000);
    console.log(`found ${parsed.data.length} rows inserting first ${rowsToInsert.length} rows`);

    const batchSize = 500;

    let insertedCount = 0;

    for(let i = 0 ; i < rowsToInsert.length ; i += batchSize){
        const batch = rowsToInsert.slice(i , i+batchSize);

        const values: any[] = [];
        const placeholders:string[] = [];
        let paramIndex = 1;

        batch.forEach((row , idx)=>{
            const tags = parseTags(row["Tags"]);
            const date = parseDate(row["Date"]);

           placeholders.push(
            `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6}, $${paramIndex + 7}, $${paramIndex + 8}, $${paramIndex + 9}, $${paramIndex + 10}, $${paramIndex + 11}, $${paramIndex + 12}, $${paramIndex + 13}, $${paramIndex + 14}, $${paramIndex + 15}, $${paramIndex + 16}, $${paramIndex + 17}, $${paramIndex + 18}, $${paramIndex + 19}, $${paramIndex + 20}, $${paramIndex + 21}, $${paramIndex + 22}, $${paramIndex + 23}, $${paramIndex + 24}, $${paramIndex + 25})`
        );

            values.push(
                row['Transaction ID'] || null,
                date,
                row['Customer ID'] || null,
                row['Customer Name'] || null,
                row['Phone Number'] || null,
                row['Gender'] || null,
                parseInt(row['Age']) || null,
                row['Customer Region'] || null,
                row['Customer Type'] || null,
                row['Product ID'] || null,
                row['Product Name'] || null,
                row['Brand'] || null,
                row['Product Category'] || null,
                tags,
                parseInt(row['Quantity']) || null,
                parseFloat(row['Price per Unit']) || null,
                parseFloat(row['Discount Percentage']) || null,
                parseFloat(row['Total Amount']) || null,
                parseFloat(row['Final Amount']) || null,
                row['Payment Method'] || null,
                row['Order Status'] || null,
                row['Delivery Type'] || null,
                row['Store ID'] || null,
                row['Store Location'] || null,
                row['Salesperson ID'] || null,
                row['Employee Name'] || null
            );

            paramIndex += 26;
        });

         const insertQuery = `
            INSERT INTO sales_transactions (
            transaction_id, date, customer_id, customer_name, phone_number,
            gender, age, customer_region, customer_type, product_id,
            product_name, brand, product_category, tags, quantity,
            price_per_unit, discount_percentage, total_amount, final_amount,
            payment_method, order_status, delivery_type, store_id,
            store_location, salesperson_id, employee_name
            ) VALUES ${placeholders.join(', ')}
        `;

        await pool.query(insertQuery , values);
        insertedCount += batch.length;
        console.log(`inserted ${insertedCount}/${rowsToInsert.length} rows`);
    }
    console.log(`successfully inserted ${insertedCount} rows`);
}

async function seed() {
    try {
        console.log("database seeding started");
        await createTable();
        await createIndexes();
        const result = await pool.query("SELECT COUNT(*) FROM sales_transactions");
        const count = parseInt(result.rows[0].count);
        if(count > 0){
            console.log(`database already has ${count} rows. Skipping seed.`);
            console.log("to re-seed, first run: DROP TABLE sales_transactions CASCADE; in your docker container");
            process.exit(0);
        }
        await insertData();
        console.log("database seeded successfully");
        process.exit(0);
    } catch (error) {
        console.log("error in seeding database" , error);
        process.exit(1);
    }
}

seed();