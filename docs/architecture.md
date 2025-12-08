A sales management system built for demonstrating search , filtering , sorting , and pagination handles all the functional requirement. the application handles the large dataset transactions with filtering debounced search and efficient database queries features a minimal ui built with next.js and shadcn ui and backend with express and postgresql database used the raw queries with pg driver 

## Tech Stack

## backend 
-- Runtime:node.js with typescript
-- Framework: express.js
-- Database: postgresql (docker for development) neon postgresql for prod
-- Orm/Query: raw sql with pg driver
-- Api:client

## frontend
--Framework: next.js (app router)
--Lang: typescript
--UI Library : shadcn/ui (Radix ui + tailwind css)
--HTTP client: axios
--Utils : usehooks-ts (debouncing)

## devops
-- containerization: docker (postgresql)
-- deployment: render(backend) , vercel(frontend)

## Search Implementation Summary
the search functionality implements a debounced, case-insensitive search across customer names and phone numbers

debouncing :- i have used useDebounceCallback from the usehooks-ts with 300ms to 500ms delay to prevent excessive api calls while typing 
database query :- implemented the postgresql `ILIKE` operator for case-insensitive pattern matching , using the raw queries was very hard for me becoz i loose the types and manual writing queries with exact syntax is hard for me becoz i used to depend more on the orm's
Multi-field Search:- single search input queries both `customer_name` and `phone_number` fields using SQL `OR` condition
State Management:- search query synced with URL parameters, enabling shareable links and browser navigation
User Experience:- input updates instantly in ui while API calls are debounced, with a clear button for quick reset

**Technical Details:**
```sql
WHERE (customer_name ILIKE '%search_term%' OR phone_number ILIKE '%search_term%')
```

## Filter Implementation Summary
The system supports multi-select and range-based filtering with proper state management

Multi-select filters:-Customer Region, Gender, Product Category, Tags, Payment Method
  - implemented using postgresql `ANY()` operator for array matching
  - checkbox-based ui with active filter badges
  - sql: `WHERE column = ANY($1)` where $1 is an array of selected values

Range Filters:-
  - age range: Min/Max inputs with debounced updates (500ms) to allow multi-digit entry
  - date range: Calendar picker using shadcn/ui Calendar component with from/to date selection
  - sql: `WHERE age >= $1 AND age <= $2` and `WHERE date >= $1 AND date <= $2`

Filter Combination:-all filters use `AND` logic between different filter types and `OR` logic within the same filter type
  - state persistence: all active filters stored in URL query parameters
  - clear Functionality:** Individual filter removal via badge close button and "Clear All" option

Technical Implementation:-
- dynamic sql query building with parameterized queries to prevent SQL injection
- filter options fetched from database `DISTINCT` queries
- active filters displayed as removable badges below filter controls

## Sorting Implementation Summary

Implemented server-side sorting with three sort options, each supporting ascending and descending order:

- Sort Options:
  1. date (newest first / oldest first) - Default: Newest First
  2. quantity (high to low / low to high)
  3. customer name (A-Z / Z-A)

- Implementation:
  - column whitelist validation to prevent SQL injection
  - sql: `ORDER BY {validated_column} {ASC|DESC}`
  - sort state preserved across filter and search changes
  - integrated into URL parameters for shareability

- User Interface:
  - single dropdown with combined sort type and order
  - display format: "Sort by: Date (Newest First)"
  - state synced with URL query parameter

## Pagination Implementation Summary

Implements **server-side pagination** with 10 items per page:

- Pagination Strategy:
  - postgresql `LIMIT` and `OFFSET` for efficient data retrieval
  - only fetches requested page data (10 records per request)
  - total count query executed separately for page calculation

- Features:
  - previous/next navigation buttons
  - current page indicator (e.g., "1 / 100")
  - record count display (e.g., "Showing 1 to 10 of 50,000 results")
  - disabled state for first/last page boundaries

- State Management:
  - page number stored in URL query parameter
  - all filters, search, and sort preserved across page changes
  - browser back/forward navigation supported

- Performance:
  - dual query approach: one for data (`SELECT * ... LIMIT 10 OFFSET 0`), one for count (`SELECT COUNT(*)`)
  - indexed columns ensure fast query execution even with large datasets

**SQL Implementation:**
```sql
SELECT * FROM sales_transactions 
WHERE ... 
ORDER BY ... 
LIMIT 10 OFFSET 0;
SELECT COUNT(*) FROM sales_transactions WHERE ...;
```

## Okay for seeding the data from csv i have papaparse and if you are seeding using the container you can seed up to 1 lakh but during the prod or if u are using the neon make sure to seed 50k to 70k max 
## for my neon db i have seeded successfully 50k records 
## Setup Instructions
1.running with docker (recommended)
- ensure docker desktop is installed
- run these cmds in ur terminals
   - docker --version

2.clone repo 
git clone https://github.com/Vinodbiradar09/truestate 
cd truestate

3.backend environment variables
- inside backend/.env
DATABASE_URL=postgresql://truestate:truestate@truestate_db:5432/truestatedb
PORT=4004
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
** note :- here truestate_db is the service name which will run which you do docker-compose up

4.frontend env variables
- inside frontend/.env or .env.local
NEXT_PUBLIC_API_URL=http://localhost:4004

5.start everything in one command
 - docker compose up --build -d 
 -d ensure to run in the detach mode 

services running:
backend → http://localhost:4004

frontend → http://localhost:3000

postgresql (container) → internal only

6.Seed Database Inside Docker
docker exec -it truestate_backend npm run seed
or you can run in backend folder also npm run seed data to seed data right now i have not given you the dataset becoz it is huge make sure to put the csv data in /data/sales_50k.csv and run the seed command

7.common Docker Commands
# Start all services
docker compose up -d
# Stop all services
docker compose down
# Reset database completely
docker compose down -v
docker compose up -d
docker exec -it truestate_backend npm run seed
# Logs
docker compose logs -f

8.production Build

Backend

cd backend
npm run build
npm start

Frontend

cd frontend
npm run build
npm start


1.manual setup (Without Docker)
Prerequisites

Node.js 18+ and npm

PostgreSQL installed locally

Git

A. Clone Repository
git clone https://github.com/Vinodbiradar09/truestate 
cd truestate

B. backend setup 
1. go to backend folder
cd backend

2. install dependencies
npm install

3. Create .env
cat > .env << EOF
DATABASE_URL=postgresql://truestate:truestate@localhost:5432/truestatedb
PORT=4004
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF

4.ensure postgresql is running

Create DB manually if needed:

psql -U postgres -c "CREATE DATABASE truestatedb;"
psql -U postgres -c "CREATE USER truestate WITH PASSWORD 'truestate';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE truestatedb TO truestate;"

5.seed 50,000 records
npm run seed

6.start backend server
npm run dev

Backend runs at:

http://localhost:4004

C. frontend setup 
1. navigate to frontend
cd ../frontend

2. install dependencies
npm install

3. create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:4004
EOF

4. start next.js dev server
npm run dev


frontend runs at:

http://localhost:3000

D. manual verification
1. backend health check
curl http://localhost:4004


expected:

{"success":true,"message":"Sales management api is running"}

2. verify database
psql -U truestate -d truestatedb -c "SELECT COUNT(*) FROM sales_transactions;"

Expected:
10000

3.frontend
Open:
http://localhost:3000


folder structure 
```
truestate/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic
│   │   ├── routes/           # API routes
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Database & utilities
│   └── data/                 # CSV data file
│
├── frontend/
│   │   ├── app/              # Next.js pages
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities & API
│   │   └── types/            # TypeScript types
│
└── docker-compose.yml        # PostgreSQL setup
```
## whenever we are seeding from 1lakh csv data to postgresql or neon our node.js memory run out happens make sure to either increase the memory or seed up to 50k to 70k




