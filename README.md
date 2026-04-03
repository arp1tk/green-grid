# Video Walkthrough
(https://drive.google.com/file/d/1avBWLlyQUvt9TYI3edX6yFcPctGzs48M/view?usp=sharing)

## Problem Definition
In the Green-Grid scenario, teams need a reliable way to manage shared farm equipment, prevent double-bookings, and understand asset availability at a glance.

This project solves that by providing:
- Centralized equipment inventory with status tracking (available, in use, maintenance)
- Booking with overlap prevention so conflicting reservations are blocked
- Search and filters for fast discovery
- Equipment detail pages with booking history/timeline for advance planning

## Setup & Deployment
### 1. Prerequisites
- Node.js 18+
- npm
- MongoDB instance (local or cloud)

### 2. Clone and install
```bash
git clone <your-repo-url>
cd green
npm install
```

### 3. Environment variables
Create a `.env.local` file in the project root:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
```

### 4. Run locally
```bash
npm run dev
```
Open http://localhost:3000.

### 5. Database migrations / schema setup
This project uses Mongoose schema-driven models.
- No separate migration tool is currently configured.
- Collections and indexes are created from model definitions when the app runs and data is written.

### 6. Production deployment
```bash
npm run build
npm run start
```
You can also deploy to Vercel; make sure `MONGODB_URI` is set in deployment environment variables.

## Technical Architecture
### High-level design
- Frontend: Next.js App Router pages and client components for dashboard, filtering, and booking UX
- API layer: Route handlers in `app/api` for equipment and booking operations
- Data layer: MongoDB + Mongoose models (`Equipment`, `Booking`)

### Data modeling
- `Equipment`: name, category, description, location, status, optional specs map, timestamps
- `Booking`: equipment reference, userName, startDate, endDate, status, timestamps
- Indexes support query speed for search/filter and booking date range checks

### Business logic vs presentation
- Presentation layer: UI components render forms, cards, and timelines
- Business logic layer: API routes enforce booking rules (validation, overlap detection, status updates)

This separation keeps the UI simple and ensures rules are enforced server-side regardless of client behavior.

## Critical Reflection
One significant decision that remains a point of uncertainty is launching the booking flow without user authentication.

Trade-offs:
- Pro: Faster delivery and simpler onboarding for demo and early validation
- Con: No user identity guarantees, weaker booking accountability, and no role-based access control

Given more time/resources, I would add authentication and authorization (for example, admin and operator roles), attach bookings to authenticated users, and enforce access rules in API routes so only permitted users can create or manage bookings.
