# 🛒 Zenith Commerce

Welcome to **Zenith Commerce** – the robust backend foundation of a modern e-commerce platform built with **Strapi**. This repository powers a feature-rich shopping experience and seamlessly integrates with a **Next.js** frontend. It offers dynamic product management, secure user authentication, advanced order processing, and much more.

---

## 📌 Version

- **Current Version:** `v1.0.0`
- **Release Date:** July 16, 2025
- **Last Updated:** July 16, 2025 – 04:48 PM IST

---

## ✨ Core Features

### 🏠 Home Page 

<table>
  <tr>
    <td width="50%">
      <img src="https://github.com/user-attachments/assets/8c99fc59-ca2e-412a-b76e-e80868fa5a20" alt="Home Page Screenshot" style="width:100%; border-radius:12px;" />
    </td>
    <td width="50%" style="vertical-align: middle; padding-left: 20px;">
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

### 🛍️ Product Management & Storefront
      
<table>
  <tr>
    <td width="50%" style="vertical-align: middle; padding-left: 20px;">
      <ul style="font-size: 16px; line-height: 1.6;">
        <li><strong>Dynamic Product Data:</strong> Manage products with rich schemas – name, description, categories, tags, and variants.</li>
        <li><strong>Variants Support:</strong> Handle multiple product variants (e.g., size, color) with independent pricing and images.</li>
        <li><strong>Categories & Filters:</strong> Organize products with hierarchical categories and enable dynamic filtering.</li>
        <li><strong>Special Offers:</strong> Add bank offers, coupons, and special discounts programmatically.</li>
      </ul>
      <img src="https://github.com/user-attachments/assets/616bf665-7514-4ca3-83d7-2f681058a7d5" alt="Home Page Screenshot" style="width:100%; border-radius:12px;" />
    </td>
    <td width="50%">
      <img src="https://github.com/user-attachments/assets/bf8876fb-ed9b-4d40-a41b-ce68951e7b4b" alt="Home Page Screenshot" style="width:100%; border-radius:12px;" />
    </td>
  </tr>
</table>

---

### 🔐 User Authentication & Management

<table>
  <tr>
    </td>
    <td width="50%" style="vertical-align: middle; padding-left: 20px;">
      <img src="https://github.com/user-attachments/assets/c1e85576-7447-4b39-9e77-9d880b906350" alt="Authentication Demo" style="width:100%; border-radius:12px;" />
      <img src="https://github.com/user-attachments/assets/27e0642f-7dfd-4417-b674-610ce25d8ab4" alt="Authentication Demo" style="width:100%; border-radius:12px;" />
    </td>
    <td width="50%">
      <ul style="font-size: 16px; line-height: 1.6;">
        <li><strong>Secure Login/Registration:</strong> Supports email-password authentication with automated email notifications.</li>
        <li><strong>User Profiles:</strong> Manage addresses, order history, reviews, wishlists, coupons, and gift cards.</li>
        <li><strong>Password Reset:</strong> Secure reset flow with email verification.</li>
      </ul>
  </tr>
</table>

---

### 🛒 Shopping & Order Processing

<table>
  <tr>
    <td width="50%">
      <ul style="font-size: 16px; line-height: 1.6;">
        <li><strong>Persistent Cart:</strong> Real-time item quantity updates and total calculations.</li>
        <li><strong>Multi-Step Checkout:</strong> Includes address selection, order summary, and discount application.</li>
        <li><strong>Order Management:</strong> Tracks order status – pending, confirmed, or cancelled.</li>
        <li><strong>Payment Simulation:</strong> Includes countdown-based simulated payment confirmation.</li>
      </ul>
    </td>
    <td width="50%" style="vertical-align: middle; padding-left: 20px;">
      <img src="https://github.com/user-attachments/assets/5ac9cd5e-d5a1-4869-ac55-512feb6eb2dc" alt="Order Processing Demo" style="width:100%; border-radius:12px;" />
      <img src="https://github.com/user-attachments/assets/756a1726-dcad-423f-868e-34928819a6e1" alt="Order Processing Demo" style="width:100%; border-radius:12px;" />
      <img src="https://github.com/user-attachments/assets/77429d0b-5399-4d3f-a1e5-231e0dc6951e" alt="Order Processing Demo" style="width:100%; border-radius:12px;" />
    </td>
  </tr>
</table>

---

### ❤️ Wishlist & Notifications

<table>
  <tr>
    <td width="50%" style="vertical-align: middle; padding-left: 20px;">
      <img src="https://github.com/user-attachments/assets/795867b0-363f-4978-adfe-f7c667f9d999" alt="Wishlist and Notifications Demo" style="width:100%; border-radius:12px;" />
      <img src="https://github.com/user-attachments/assets/a4f35b59-9e98-4638-acff-fcb6fd08140d" alt="Wishlist and Notifications Demo" style="width:100%; border-radius:12px;" />
    </td>
    <td width="50%">
      <h2 style="font-size: 28px; color: #ec4899;">❤️ Wishlist & Notifications</h2>
      <ul style="font-size: 16px; line-height: 1.6;">
        <li><strong>Wishlists:</strong> Users can create and manage multiple personalized wishlists.</li>
        <li><strong>Notifications:</strong> Automatic email and in-app notifications for order updates and account events.</li>
      </ul>
    </td>
  </tr>
</table>

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
