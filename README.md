# 🛒 Zenith Commerce

#### Welcome to **Zenith Commerce**, the strong backend foundation of a modern e-commerce platform built with **Strapi**. This repository supports a feature-rich shopping experience and integrates smoothly with a **Next.js** frontend. It provides dynamic product management, secure user authentication, efficient order processing, and much more.

<table>
  <tr>
    <td width="50%">
      <img src="https://github.com/user-attachments/assets/2d9b8055-32be-47c6-81f3-51603f0de2e4" alt="Home Page Screenshot" style="width:100%; border-radius:12px;" />
    </td>
    <td width="50%" style="vertical-align: middle; padding-left: 20px;">
      <h2 style="font-size: 28px; color: #7c3aed;">🏠 Home Page</h2>
      <p style="font-size: 16px;">
        This is the vibrant landing page of <strong>Zenith Commerce</strong>, featuring a dynamic showcase of products, 
        special offers, and an engaging introduction to the platform. Built with Strapi and integrated with a Next.js frontend, 
        it highlights categorized product listings, promotional banners, and intuitive navigation — all optimized for a seamless shopping experience.
      </p>
      <p style="font-size: 16px;">
        Users are welcomed with a visually appealing layout, quick access to carts and wishlists, and a responsive design 
        that adapts to all devices, setting the foundation for an efficient and enjoyable e-commerce journey.
      </p>
    </td>
  </tr>
</table>

---

## ✨ Core Features

### 🛍️ Product Management

- **Dynamic Product Data:** Manage products with rich schemas – name, description, categories, tags, and variants.
- **Variants Support:** Handle multiple product variants (e.g., size, color) with independent pricing and images.
- **Categories & Filters:** Organize products with hierarchical categories and enable dynamic filtering.
- **Special Offers:** Add bank offers, coupons, and special discounts programmatically.

<table>
  <tr>
    <td width="50%" style="vertical-align: middle; padding-left: 20px;">
      <h2 style="font-size: 28px; color: #7c3aed;">🛍️ Product Management</h2>
      <p style="font-size: 16px;">
        Showcase the power of product management with a live demo. This section highlights dynamic product updates, variant selections, and special offer applications, all managed through the Strapi backend and          displayed via the Next.js frontend.
      </p>
      <p style="font-size: 16px;">
        Experience real-time filtering and categorization, ensuring a tailored shopping experience for every user.
      </p>
    </td>
     <td width="50%">
      <img src="https://github.com/user-attachments/assets/c28f6c9e-9804-4914-8bd5-76b21ee78374" alt="Home Page Screenshot" style="width:100%; border-radius:12px;" />
    </td>
  </tr>
</table>
<p align="center">
  <img src="https://github.com/user-attachments/assets/85d5550a-2876-4ef7-87c3-d13f8ec9b66a" alt="Recording 1" width="85%" />
</p>

---

### 🔐 User Authentication & Management

- **Secure Login/Registration:** Supports email-password authentication with automated email notifications.
- **User Profiles:** Manage addresses, order history, reviews, wishlists, coupons, and gift cards.
- **Password Reset:** Secure reset flow with email verification.

<table>

  <tr>
    <td width="50%">
      <img src="https://github.com/user-attachments/assets/b0ba5c6f-5175-4cfd-8d78-9cb92af742e4" alt="Home Page Screenshot" style="width:100%; border-radius:12px;" />
      <img src="https://github.com/user-attachments/assets/daebc36e-32a0-4bf7-a981-863471c45d08" alt="Home Page Screenshot" style="width:100%; border-radius:12px;" />
    </td>
    <td width="50%" style="vertical-align: middle; padding-left: 20px;">
      <h2 style="font-size: 28px; color: #7c3aed;">🔐 User Authentication</h2>
      <p style="font-size: 16px;">
        Demonstrate a secure login and registration process, complete with email notifications and profile management. The Strapi backend ensures robust security, while the Next.js frontend provides a smooth user interface.
      </p>
      <p style="font-size: 16px;">
        Users can reset passwords securely, with all actions tracked and verified via email.
      </p>
    </td>
  </tr>
</table>

---

### 🛒 Shopping & Order Processing

- **Multi-Step Checkout:** Includes address selection, order summary, and discount application.
- **Order Management:** Tracks order status – pending, confirmed, or cancelled.
- **Payment Simulation:** Includes countdown-based simulated payment confirmation.


<p align="center">
  <img src="https://github.com/user-attachments/assets/60c53697-4761-426f-b1eb-aa566f4fb3af" alt="Recording 1" width="45%" />
  <img src="https://github.com/user-attachments/assets/589f5a6a-22d5-4e39-abd9-486166fb22f6" alt="Recording 2" width="45%" />
</p>

---

### ❤️ Wishlist & Notifications

- **Wishlists:** Users can create and manage multiple personalized wishlists.
- **Notifications:** Automatic email and in-app notifications for order updates and account events.

<table>

  <tr>
    <td width="50%" style="vertical-align: middle; padding-left: 20px;">
      <h2 style="font-size: 28px; color: #7c3aed;">❤️ Wishlist & Notifications</h2>
      <p style="font-size: 16px;">
        Explore the wishlist feature, allowing users to save items across multiple collections. This demo also highlights real-time notifications for order updates and account activities, integrated via Strapi's email system.
      </p>
      <p style="font-size: 16px;">
        Keep users engaged with timely updates delivered seamlessly to their inbox or app.
      </p>
    </td>
     <td width="50%">
      <img src="https://github.com/user-attachments/assets/43dd528c-aff8-495f-892a-7ed8c807e43c" alt="Home Page Screenshot" style="width:100%; border-radius:12px;" />
    </td>
  </tr>
</table>

---

## 🛠️ Tech Stack

| Layer      | Technology     |
|------------|----------------|
| Backend CMS | [Strapi](https://strapi.io) |
| Database    | SQLite (default), PostgreSQL/MySQL configurable |
| API         | REST (custom controllers & lifecycles) |
| Email       | Built-in service integration |

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

### 🙏 Acknowledgements
-  Powered by Strapi – Open-source headless CMS
-  Inspired by leading e-commerce practices and open-source communities

### 📧 Contact
  For support or collaboration:
-  📨 Email: zayvuecommerce@gmail.com
-  🛠️ Or use the built-in Help & Support feature in the platform!
