# Restaurant Management System

A comprehensive web-based solution for managing restaurant operations, including Point of Sale (POS), Kitchen Display System (KDS), Inventory Management, and Reporting.

## Features

### 1. Point of Sale (POS)
- **Touch-friendly Interface**: Designed for tablets and touchscreens.
- **Menu Management**: Categorized menu with search functionality.
- **Modifiers**: Support for item customizations (e.g., "Extra Cheese", "No Onions") with price adjustments.
- **Order Types**: Walk-in and Table orders.
- **Payment Integration**: Cash and Card payment tracking.
- **Inventory Integration**: Automatic stock deduction upon order placement.

### 2. Kitchen Display System (KDS)
- **Real-time Updates**: Orders appear instantly in the kitchen.
- **Status Tracking**: Mark items as "Preparing", "Ready", or "Served".
- **Order Details**: View modifiers and special notes clearly.
- **History**: View completed orders.

### 3. Inventory Management
- **Ingredient Tracking**: Track stock levels for raw ingredients.
- **Recipe Management**: Link menu items to ingredients for automatic deduction.
- **Low Stock Alerts**: Visual indicators for items running low.
- **Waste Tracking**: Log wasted or spoiled ingredients.
- **Supplier Management**: Track ingredient sources.

### 4. Reporting & Analytics
- **Sales Dashboard**: Daily revenue, order counts, and average order value.
- **Profitability Analysis**: Gross profit calculation based on COGS (Cost of Goods Sold).
- **Product Performance**: Top-selling and low-selling items.
- **Date Filtering**: Custom date range reports.

### 5. User Management
- **Role-Based Access Control (RBAC)**:
    - **Admin**: Full access to all settings and logs.
    - **Manager**: Access to menu, inventory, reports, and staff management.
    - **Staff/Cashier**: Access to POS and Orders.
    - **Kitchen**: Access to KDS.
- **Activity Logging**: Track sensitive actions.

## Tech Stack
- **Backend**: Laravel 11 (PHP)
- **Frontend**: React with Inertia.js
- **Database**: SQLite (Dev) / MySQL (Prod)
- **Styling**: Tailwind CSS + Shadcn UI
- **Authentication**: Laravel Fortify + Sanctum

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant-management-system
   ```

2. **Install Dependencies**
   ```bash
   composer install
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   Configure your database settings in `.env`.

4. **Database Migration & Seeding**
   ```bash
   php artisan migrate --seed
   ```
   This will create the database structure and seed default roles and an admin user.

5. **Build Frontend**
   ```bash
   npm run build
   ```

6. **Run Development Server**
   ```bash
   npm run dev
   php artisan serve
   ```

## Default Credentials
- **Admin Email**: `admin@example.test`
- **Password**: `password`

## Testing
Run the test suite to verify functionality:
```bash
php artisan test
```
