# FitStore Core

Customer-facing API for the FitStore e-commerce platform. Built with Node.js/Express and Prisma, reading from the same PostgreSQL database managed by the [Fitstore-engine](https://github.com/Abhi071998/Fitstore-engine) admin backend.

## Installation

1. Clone the repo and install dependencies:
   ```
   git clone https://github.com/Abhi071998/FitStore-core.git
   cd FitStore-core
   npm install
   ```
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to the same Postgres instance used by Fitstore-engine (`tshirt_store`):
   ```
   cp .env.example .env
   ```
3. Pull the existing schema and generate the Prisma client:
   ```
   npm run db:pull
   npm run db:generate
   ```
4. Start the dev server:
   ```
   npm start
   ```
   Verify it's up at `http://localhost:4000/api/health`.
