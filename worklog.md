---
Task ID: 1
Agent: Main Agent
Task: Fix pages missing headers + add demo data for BusyBeds

Work Log:
- Investigated all 17 page routes and found /coupons, /bookings, /subscription had NO navigation/header
- Root cause: Navbar hides on these routes but they didn't have dashboard layout with sidebar
- Created shared DashboardShell component (src/components/dashboard-shell.tsx)
- Added layout.tsx for /coupons, /bookings, /subscription using DashboardShell
- Simplified dashboard/layout.tsx to use shared DashboardShell
- Hidden Navbar on /login and /register pages (they have their own branding)
- Enhanced seed.ts with 8 hotels across East Africa (Tanzania, Kenya, Uganda)
- Added 4 guest users (STANDARD, PREMIUM, STARTER, no subscription)
- Added 8 hotel staff accounts (one per hotel)
- Added coupons in all statuses: AVAILABLE, RESERVED, CONFIRMED, REDEEMED, CANCELLED, EXPIRED, NO_SHOW
- Added commission records and notifications
- Fixed next.config.ts to support BUILD_DIR env var for zero-downtime staging builds
- Fixed deploy.sh to use BUILD_DIR env var instead of --config flag
- Fixed seed.ts to handle existing subscriptions (findFirst + create instead of upsert with custom IDs)
- Cleaned up duplicate hotels from old seed data
- Deployed to live site successfully
- Ran seed on live database successfully

Stage Summary:
- All pages now have proper headers/navigation (sidebar on desktop, mobile header + bottom nav)
- 8 demo hotels across 3 East African countries
- 13 demo users (1 admin, 4 guests, 8 hotel staff)
- 42 coupons in varied statuses for realistic testing
- Live site: https://busybeds.com - all working
