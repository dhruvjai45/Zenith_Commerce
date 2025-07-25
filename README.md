# 🛒 Zenith Commerce

Welcome to **Zenith Commerce** – the robust backend foundation of a modern e-commerce platform built with **Strapi**. This repository powers a feature-rich shopping experience and seamlessly integrates with a **Next.js** frontend. It offers dynamic product management, secure user authentication, advanced order processing, and much more.

![Demo](./assets/demo.gif)

---

## 📌 Version

- **Current Version:** `v1.0.0`
- **Release Date:** July 16, 2025
- **Last Updated:** July 16, 2025 – 04:48 PM IST

---

## ✨ Core Features

### 🛍️ Product Management & Storefront

- **Dynamic Product Data:** Manage products with rich schemas – name, description, categories, tags, and variants.
- **Variants Support:** Handle multiple product variants (e.g., size, color) with independent pricing and images.
- **Categories & Filters:** Organize products with hierarchical categories and enable dynamic filtering.
- **Special Offers:** Add bank offers, coupons, and special discounts programmatically.

![Product Demo](./assets/demo.gif)

---

### 🔐 User Authentication & Management

- **Secure Login/Registration:** Supports email-password authentication with automated email notifications.
- **User Profiles:** Manage addresses, order history, reviews, wishlists, coupons, and gift cards.
- **Password Reset:** Secure reset flow with email verification.

![Auth Demo](./assets/demo.gif)

---

### 🛒 Shopping & Order Processing

- **Persistent Cart:** Real-time item quantity updates and total calculations.
- **Multi-Step Checkout:** Includes address selection, order summary, and discount application.
- **Order Management:** Tracks order status – pending, confirmed, or cancelled.
- **Payment Simulation:** Includes countdown-based simulated payment confirmation.

![Order Demo](./assets/demo.gif)

---

### ❤️ Wishlist & Notifications

- **Wishlists:** Users can create and manage multiple personalized wishlists.
- **Notifications:** Automatic email and in-app notifications for order updates and account events.

![Wishlist Demo](./assets/demo.gif)

---

## 🛠️ Tech Stack

| Layer         | Technology     |
|---------------|----------------|
| Backend CMS   | Strapi |
| Database      | SQLite (default), PostgreSQL/MySQL configurable |
| API           | REST (custom controllers & lifecycles) |
| Email         | Built-in service integration |
| Media Storage | Cloudinary |

---

## 🌐 Live Deployment
- **Backend** Hosted on Render at [https://zenith-commerce.onrender.com](https://zenith-commerce.onrender.com)
- **Frontend**Live on Vercel at [https://zayvue-commerce.vercel.app/](https://zayvue-commerce.vercel.app/)
- **Database** Hosted on Render
- **Media Assets** Stored and managed via Cloudinary
- To access the Strapi dashboard, please email zayvuecommerce@gmail.com for an invite to [https://zenith-commerce.onrender.com/](https://zenith-commerce.onrender.com/).

---

## 📋 Schema Overview

Zenith Commerce uses modular collection types and components:

- **Card Details:** Secure storage of user-linked payment information.
- **Carts:** Persistent cart state with line items and totals.
- **Email Notifications:** Event-driven email dispatch manager.
- **Gift Cards:** Unique gift code generation and balance tracking.
- **Help & Support:** Inquiry system with file/media attachment support.
- **Homes:** Configures homepage sections like hero banners and promotions.
- **Notifications:** Tracks user notification history and read status.
- **Order Management:** Full order lifecycle including shipping, coupon, and offer integration.
- **Products:** Rich product models with variants and offer fields.
- **Product Categories:** Tree-structured categorization system.
- **Product Reviews:** User-generated reviews with media support.
- **User Addresses:** Multi-address support per user.
- **Variants:** Modular product variations (size, color, etc.)
- **Wishlists:** Named wishlist collections per user.

**Components** like `delivery_address`, `item_list`, and `gift_card_details` provide flexibility and reuse.

---

## 🚀 Getting Started

### ✅ Prerequisites

- **Node.js** (v18+)
- **npm** or **yarn**
- A working Strapi setup

---

### 🧰 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/zenith-commerce.git
   cd zenith-commerce
2. **Install dependencies**
   ```bash
   npm install
3. **Configure environment variables**
   ```bash
   # Server
   HOST=0.0.0.0
   PORT=1337
   API_TOKEN=your_secure_api_token

   # Secrets
   APP_KEYS=your_app_key1,your_app_key2
   API_TOKEN_SALT=your_api_token_salt
   ADMIN_JWT_SECRET=your_admin_jwt_secret
   TRANSFER_TOKEN_SALT=your_transfer_token_salt
   ENCRYPTION_KEY=your_encryption_key
   EMAIL_ADDRESS=your_email@domain.com
   EMAIL_PASSWORD=your_email_password

   # Database
   DATABASE_CLIENT=sqlite # or postgres / mysql
   DATABASE_HOST=localhost
   DATABASE_PORT=5432 # (3306 for MySQL)
   DATABASE_NAME=zenith_commerce
   DATABASE_USERNAME=your_db_username
   DATABASE_PASSWORD=your_db_password
   DATABASE_SCHEMA=public
   DATABASE_SSL=false
   JWT_SECRET=your_jwt_secret
   
## ⚠️ Important: Ensure .env is added to .gitignore.

4. **Run the development server**
   ```bash
   npm run develop
####  The backend will be live at: http://localhost:1337

###  Security Tips
-  Store all secrets in the .env file – never commit this file.
-  Use HTTPS in production via a reverse proxy like Nginx.
-  Keep all dependencies updated for security patches.
-  Secure Cloudinary credentials and restrict API access.

### 🙏 Acknowledgements
-  Powered by Strapi – Open-source headless CMS
-  Media management by Cloudinary
-  Inspired by leading e-commerce practices and open-source communities

### 📧 Contact
  For support or collaboration:
-  📨 Email: zayvuecommerce@gmail.com
-  🛠️ Or use the built-in Help & Support feature in the platform!
