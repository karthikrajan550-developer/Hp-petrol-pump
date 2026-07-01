# Nandha Agencies - HP — Daily Fuel Sales Tracker

A web application to track daily Petrol, Diesel, and Power Petrol sales at a fuel
station using opening/closing meter readings. Built as a **Spring Boot (Java)**
REST backend and a separate **Angular** frontend.

## What it does

- Tracks **11 pumps**: Petrol-1..5, Diesel-1..5, and Power-1.
- **Price per litre** per fuel type — set once, edit anytime, with price history
  so past days keep their original price.
- **Daily Entry**: opening reading auto-fills from the previous day's closing;
  you enter only the closing. Calculates litres sold and amount, with per-fuel
  subtotals and a grand total (INR).
- **Reports**: totals for any past date plus a history list.
- **Monthly Data**: a month's totals with expandable daily rows that show the
  full pump-by-pump breakdown.

## Architecture

- **Backend** — Spring Boot REST API on port 8080.
- **Frontend** — Angular single-page app on port 4200, calls the API.
- **MySQL** database (default) — data is stored permanently and can be
  re-derived any time. An H2 quick-test mode is available with no install.

```
petrolbunk/
├── backend/     Spring Boot REST API (builds nandha-agencies-hp.jar)
├── frontend/    Angular single-page app
└── README.md
```

## Running the app (two terminals)

```bash
# Terminal 1 — backend API on http://localhost:8080
cd backend && mvn spring-boot:run

# Terminal 2 — Angular frontend on http://localhost:4200
cd frontend && npm install && npm start
```

Then open http://localhost:4200. The frontend talks to the backend at
http://localhost:8080.

## Database setup (MySQL — default)

Data is stored in MySQL so it persists permanently and can be re-derived at any
time. One-time setup:

1. Install MySQL and start it.
2. Create the database (the app can also auto-create it):
   ```sql
   CREATE DATABASE nandha_agencies;
   ```
3. Set your credentials in `backend/src/main/resources/application.properties`
   (defaults are user `root`, password `root`), or override them with
   environment variables `DB_URL`, `DB_USER`, `DB_PASSWORD`.

Tables are created automatically on first run. Your data survives restarts and
rebuilds. To back up, use a normal MySQL dump; to reset, drop and recreate the
`nandha_agencies` database.

### Quick-test mode without MySQL (H2)

To try the app instantly without installing MySQL, run with the `h2` profile:
```bash
cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=h2
```
This stores data in a local `data/` folder (delete it to reset). Note: switching
between H2 and MySQL uses separate databases, so data does not carry over between
the two modes.
