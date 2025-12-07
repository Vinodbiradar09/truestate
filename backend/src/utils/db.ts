import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
    connectionString : process.env.DATABASE_URL,
});

pool.on("connect" , ()=>{
    console.log("connected to postgres database");
});

pool.on("error" , ()=>{
    console.log("error in connecting the postgres database");
    process.exit(-1);
});

export default pool;