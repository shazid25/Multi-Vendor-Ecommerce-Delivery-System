
-----

# 📦 Multi-Vendor E-commerce & Delivery System

A production-grade, full-stack ecosystem designed for scalability. This platform features a sophisticated multi-tenant architecture, real-time delivery tracking, and a secure three-tier user management system.

-----

### 🚀 Live Demo & Credentials

**Live Link:** [https://multivendor-phi.vercel.app/](https://multivendor-phi.vercel.app/)

To explore the different roles and dashboards, use the following test accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `irfanshazd814@gmail.com` | `irfanshazd814@gmail.com` |
| **Admin** | `driveintocode@gmail.com` | `driveintocode@gmail.com` |
| **Vendor** | `ishazid57@gmail.com` | `ishazid57@gmail.com` |
| **Delivery Man** | `jossjossjosss62@gmail.com` | `jossjossjosss62@gmail.com` |

-----

## 🏗️ System Architecture


The system is built on a **Modular Monolith** backend architecture with a highly responsive, animated frontend. It ensures strict data integrity through Zod schema validation and Prisma’s type-safe database queries.

-----

## ✨ Key Features

### 🔐 Advanced User Management

  * **Super Admin:** Full platform governance, user authorization, and global analytics.
  * **Admin:** Day-to-day operations, vendor management, and product approval workflows.
  * **Vendor Panel:** Shop branding, inventory management, and fulfillment tracking.
  * **Delivery App:** Specialized interface for delivery personnel to claim and update order statuses.

### 🛒 Core E-commerce Functionality

  * **Dynamic Catalog:** Multi-category support with advanced filtering and search.
  * **Secure Payments:** Integrated payment flow for seamless transactions.
  * **Cinematic UX:** Smooth transitions and high-performance animations using Framer Motion and GSAP.

-----

## 💻 Tech Stack

  * **Frontend:** Next.js (App Router), Tailwind CSS, Framer Motion
  * **Backend:** Node.js, Express.js
  * **Database:** PostgreSQL with **Prisma ORM**
  * **Authentication:** Multi-role JWT-based Auth
  * **Validation:** Zod (Type-safe schema validation)
  * **Package Manager:** pnpm

-----

## 🛠️ Local Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/shazid25/Multi-Vendor-Ecommerce-Delivery-System.git
    cd Multi-Vendor-Ecommerce-Delivery-System
    ```

2.  **Install Dependencies:**

    ```bash
    # Install for the entire workspace
    pnpm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the `server` directory:

    ```env
    DATABASE_URL="your_postgresql_connection_string"
    JWT_ACCESS_SECRET="your_secret"
    NODE_ENV="development"
    ```

4.  **Database Migration:**

    ```bash
    cd server
    npx prisma migrate dev
    npx prisma generate
    ```

5.  **Run the Project:**

    ```bash
    # Run server and client
    pnpm run dev
    ```

-----

## 🚀 Deployment

This project is optimized for **Vercel** (Frontend) and any Node.js compatible environment (Backend).

  * **Database:** Hosted on PostgreSQL.
  * **Build Command:** `prisma generate && tsc` (Server) / `next build` (Client).

-----

## 👤 Author

**Irfan Shazid**

  * **GitHub:** [@shazid25](https://github.com/shazid25)
  * **LinkedIn:** [@irfan-shazid](https://www.linkedin.com/in/irfan-shazid/)
  * **Email:** irfanshazid814@gmail.com

-----

*Built with passion for high-performance web applications.*
