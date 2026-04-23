# Leave Management System

A full-stack modern Leave Management System with React + FullCalendar in the frontend and a Laravel 11 API in the backend.

## Prerequisites

-   Docker (and Docker Compose) OR
-   PHP 8.2+ & Composer installed locally
-   Node.js & npm installed locally
-   MySQL Server (if not using Docker)

---

## 🚀 Easy Setup (with Docker Compose & Sail)

Since Laravel includes Sail, you can run the entire backend + MySQL via Docker. We have set up the `.env` to expect a `leave_management` database.

### 1. Backend Setup

```bash
cd backend

# If using sail (requires Docker desktop):
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate
./vendor/bin/sail artisan serve
```
*(If you do not have local PHP to install Sail dependencies, we already initiated it with docker volume up top).*

If running locally with XAMPP / local MySQL:
```bash
cd backend
php artisan migrate
php artisan serve
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Features

-   **User Registration / Login**: Handled via Laravel Sanctum JWT/Cookies. Secure session approach.
-   **Role-Based Dashboards**: Users see their calendar. Admins see the calendar PLUS a list of pending requests to Approve / Reject.
-   **Validation**: Dates cannot end before they start, fields are required, and the frontend gracefully prevents duplicates/overlaps thanks to Laravel backend checks.
-   **Color-Coded FullCalendar**:
    -   🟢 **Green**: Approved Leave
    -   🟡 **Yellow**: Pending Leave
    -   🔴 **Red**: Rejected Leave
-   **Vite React**: Lightning fast development server.

## Architecture & Code Highlights

-   **Clean separation of concerns**.
-   **Axios Interceptors**: Gracefully drops sessions if `401 Unauthorized`.
-   **CORS**: Preconfigured in `.env` to allow `localhost:5173`.
-   **Tailwind/Clean CSS**: App uses a highly simplified UI built around basic modern CSS attributes.

## Usage

1. Open `http://localhost:5173`.
2. Register an account with `admin` role and another with `user` role.
3. Test leave creation as a user.
4. Test leave approval as an admin.

## LIVE DEMO :

    https://leave-management-system-wine.vercel.app/
