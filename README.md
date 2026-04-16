-----

# 📦 Green Mart | Multi-Vendor E-Commerce & Delivery System

## 🚀 Live Demo & Credentials

**Live Link:** [https://multivendor-phi.vercel.app/](https://multivendor-phi.vercel.app/)

To explore the role-based dashboards and system governance, use the following pre-configured test accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `irfanshazd814@gmail.com` | `irfanshazd814@gmail.com` |
| **Admin** | `driveintocode@gmail.com` | `driveintocode@gmail.com` |
| **Vendor** | `ishazid57@gmail.com` | `ishazid57@gmail.com` |
| **Delivery Man** | `jossjossjosss62@gmail.com` | `jossjossjosss62@gmail.com` |

-----

## 📝 Project Overview

**Green Mart** is a production-grade, full-stack ecosystem engineered for high-volume local commerce. This platform features a sophisticated **multi-tenant architecture**, bridging the gap between Vendors, Customers, and Delivery Partners through a unified, high-performance interface.

-----

## ✨ Core System Features

### 🔐 5-Tier User Governance

  * **Super Admin:** Global platform governance, advanced user authorization, and system analytics.
  * **Admin:** Operational management, vendor onboarding, and product moderation workflows.
  * **Vendor Panel:** Independent shop management, inventory tracking, and sales fulfillment.
  * **Delivery Partner:** Specialized rider interface for order claiming and real-time status updates.
  * **Customer:** Premium shopping experience with secure checkout and order tracking.

### 🛒 High-Performance Commerce

  * **Dynamic Catalog:** Multi-category support with deep filtering and optimized search indexing.
  * **Secure Payment Flow:** Integrated financial transaction logic for seamless user checkout.
  * **Cinematic UX:** High-fidelity animations using **Framer Motion** and **GSAP** for a fluid, modern feel.

-----

## 💻 Technical Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), Tailwind CSS, Framer Motion, GSAP |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL with Prisma ORM |
| **Security** | Multi-role JWT-based Auth, Zod Validation |
| **Tooling** | pnpm, TypeScript |

-----

## 🛠️ Local Installation

1.  **Clone the Project**

    ```bash
    git clone https://github.com/shazid25/Multi-Vendor-Ecommerce-Delivery-System.git
    cd Multi-Vendor-Ecommerce-Delivery-System
    ```

2.  **Install Dependencies**

    ```bash
    pnpm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the `server` directory:

    ```env
    DATABASE_URL="your_postgresql_connection_string"
    JWT_ACCESS_SECRET="your_secret_key"
    NODE_ENV="development"
    ```

4.  **Initialize Database**

    ```bash
    cd server
    npx prisma migrate dev
    npx prisma generate
    ```

-----

## 👤 Author

**Irfan Shazid**

  * **GitHub:** [@shazid25](https://github.com/shazid25)
  * **LinkedIn:** [Irfan Shazid](https://www.google.com/search?q=https://linkedin.com/in/irfan-shazid)
  * **Email:** irfanshazid814@gmail.com
