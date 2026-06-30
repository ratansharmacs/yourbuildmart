# YourBuildMart (YBM) — Full-Stack E-Commerce Platform

> A production-grade construction and building materials marketplace built with Spring Boot and React. Supports B2B enquiry flows, multi-role authentication, a full admin panel, blog system, wishlist, email notifications, and a rich animated frontend.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Backend Architecture](#4-backend-architecture)
   - 4.1 [Core Configuration](#41-core-configuration)
   - 4.2 [Authentication & JWT](#42-authentication--jwt)
   - 4.3 [Domain Modules](#43-domain-modules)
   - 4.4 [Email Notification System](#44-email-notification-system)
   - 4.5 [File Storage & Image System](#45-file-storage--image-system)
   - 4.6 [Exception Handling](#46-exception-handling)
   - 4.7 [API Documentation (Swagger)](#47-api-documentation-swagger)
5. [Frontend Architecture](#5-frontend-architecture)
   - 5.1 [App Shell & Routing](#51-app-shell--routing)
   - 5.2 [Theme System](#52-theme-system)
   - 5.3 [Component Library](#53-component-library)
   - 5.4 [Animation System](#54-animation-system)
   - 5.5 [API Service Layer](#55-api-service-layer)
6. [Feature Deep-Dives](#6-feature-deep-dives)
   - 6.1 [Homepage](#61-homepage)
   - 6.2 [Product Catalogue & Detail](#62-product-catalogue--detail)
   - 6.3 [Cart System](#63-cart-system)
   - 6.4 [Enquiry / Checkout Flow](#64-enquiry--checkout-flow)
   - 6.5 [User Profile & Addresses](#65-user-profile--addresses)
   - 6.6 [Wishlist](#66-wishlist)
   - 6.7 [Orders / Enquiry Tracking](#67-orders--enquiry-tracking)
   - 6.8 [Blog System](#68-blog-system)
   - 6.9 [Brands Directory](#69-brands-directory)
   - 6.10 [Contact & Agent Program](#610-contact--agent-program)
   - 6.11 [Admin Dashboard](#611-admin-dashboard)
7. [Database Schema Overview](#7-database-schema-overview)
8. [Security Model](#8-security-model)
9. [Security Concerns & Audit](#9-security-concerns--audit)
10. [Mobile Responsiveness](#10-mobile-responsiveness)
11. [Environment Configuration](#11-environment-configuration)
12. [Running the Project](#12-running-the-project)
13. [Build & Deployment](#13-build--deployment)
14. [Changelog](#14-changelog)

---

## 1. Project Overview

YourBuildMart is a full-stack B2B/B2C e-commerce platform specialising in construction and building materials — TMT Steel, PEB Structures, Aluminium Products, Electrical Components, Industrial Valves, Fire-Fighting Equipment, and False Ceiling systems. It targets international buyers (Africa, Europe, Middle East) sourcing from Indian manufacturers.

**Key business flows:**

- Customers browse products, add to cart, and submit an **enquiry** (not a payment) to get a price quote.
- Admins manage products, categories, brands, blog posts, customer accounts, staff, and incoming enquiries from a dedicated admin panel.
- Sellers can list products (future expansion).
- Agents get cash-back rewards via the Agent Program.
- Automated **email notifications** fire on every key event — registration, enquiry, contact form, account changes, and admin replies.

---

## 2. Tech Stack

### Backend

| Layer | Technology | Version |
|---|---|---|
| Framework | Spring Boot | 3.2.5 |
| Language | Java | 17 |
| ORM | Spring Data JPA + Hibernate | Boot-managed |
| Database | MySQL | 8.x |
| Security | Spring Security + JJWT | 0.12.5 |
| Code Generation | Lombok | 1.18.32 |
| Object Mapping | MapStruct | 1.5.5.Final |
| API Docs | SpringDoc OpenAPI (Swagger UI) | 2.5.0 |
| Validation | Spring Validation (Jakarta Bean) | Boot-managed |
| Mail | Spring Boot Starter Mail (Gmail SMTP) | Boot-managed |
| Build Tool | Maven | 3.x |
| Connection Pool | HikariCP | Boot-managed |

### Frontend

| Layer | Technology | Version |
|---|---|---|
| Framework | React | 18 |
| Build Tool | Vite | Latest |
| Routing | React Router v6 | Latest |
| Animations | Framer Motion | Latest |
| Scroll | Lenis (smooth scroll) | Latest |
| Animation library | GSAP | Latest |
| Styling | Inline CSS + CSS Modules (responsive.css, global.css, etc.) | — |
| HTTP | Native Fetch API (custom wrapper) | — |
| Icons/Emoji | Native Unicode | — |

---

## 3. Project Structure

```
YourBuildMart/
├── Backend/
│   ├── pom.xml
│   └── src/main/java/com/yourbuildmart/
│       ├── YourbuildmartApplication.java      # Entry point
│       ├── address/                           # Saved addresses module
│       ├── admin/                             # Admin dashboard APIs
│       ├── analytics/                         # Search log analytics
│       ├── auth/                              # JWT authentication
│       ├── blog/                              # Blog posts & categories
│       ├── brand/                             # Brand management
│       ├── cart/                              # Shopping cart
│       ├── category/                          # Product categories
│       ├── common/util/BaseEntity.java        # Auditable base class
│       ├── config/                            # Security, Swagger, WebMvc, Async
│       ├── email/                             # Email service, templates, enums, DTOs
│       ├── exception/                         # Global error handling
│       ├── notification/                      # User notifications
│       ├── order/                             # Enquiry/order management
│       ├── product/                           # Products & image upload
│       ├── requests/                          # Agent/contact inquiries
│       ├── review/                            # Product reviews
│       ├── security/                          # JWT filter & service
│       ├── sitecontent/                       # Dynamic site images
│       ├── user/                              # User entity & profile
│       └── wishlist/                          # Saved products
│
└── Frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx                           # React root + providers
        ├── App.jsx                            # Homepage sections
        ├── index.css                          # Global imports
        ├── components/
        │   ├── AuthContext.jsx                # Auth state provider
        │   ├── CartContext.jsx                # Cart state provider
        │   ├── CartDrawer.jsx                 # Slide-in cart panel
        │   ├── EnquiryModal.jsx               # Quick enquiry form
        │   ├── Footer.jsx
        │   ├── GlobalAnimationBackground.jsx  # Animated canvas bg
        │   ├── LenisProvider.jsx              # Smooth scroll setup
        │   ├── PageLoader.jsx                 # Branded loading screen
        │   ├── PageTransition.jsx             # Route transition wrapper
        │   ├── Reveal.jsx                     # Scroll-triggered reveals
        │   ├── RichTextEditor.jsx             # Blog post WYSIWYG editor
        │   ├── SharedHeader.jsx               # Responsive navigation
        │   ├── SiteImagesContext.jsx          # Dynamic image provider
        │   ├── ThemeContext.jsx               # Dark/light mode state
        │   ├── ThemeProvider.jsx              # CSS variable injector
        │   ├── ThemeToggle.jsx                # Toggle button component
        │   └── useScrollLock.js              # Modal body-scroll lock
        ├── pages/
        │   ├── AdminDashboard.jsx             # Full admin panel (SPA within SPA)
        │   ├── About.jsx
        │   ├── Blog.jsx
        │   ├── BlogDetail.jsx
        │   ├── Brands.jsx
        │   ├── Checkout.jsx
        │   ├── Contact.jsx
        │   ├── EnquirySuccess.jsx
        │   ├── Login.jsx / Register.jsx
        │   ├── NotFound.jsx                   # 404 page with animated empty box
        │   ├── Orders.jsx
        │   ├── Product.jsx
        │   ├── ProductDetail.jsx
        │   ├── Profile.jsx
        │   ├── QualityAssurance.jsx
        │   └── Wishlist.jsx
        ├── services/
        │   ├── api.js                         # All backend API calls
        │   └── phoneValidation.js             # Phone number validator
        ├── lib/
        │   └── motionVariants.js              # Shared Framer Motion variants
        └── styles/
            ├── global.css
            ├── responsive.css                 # All breakpoint overrides
            ├── about.css / blog.css / etc.
```

---

## 4. Backend Architecture

### 4.1 Core Configuration

**`application.yml`** holds all runtime configuration:

- **DataSource**: MySQL on port 3306, database `yourbuildmart` (auto-created via `createDatabaseIfNotExist=true`). HikariCP connection pool with max 10 connections, 30-second timeout.
- **JPA**: `ddl-auto: update` — Hibernate automatically applies schema changes without dropping data. Batch inserts (`batch_size: 20`) optimise bulk operations.
- **Multipart**: Files up to 10 MB per file, 50 MB per request (batch image uploads).
- **Email**: Gmail SMTP via Spring Boot Starter Mail. Controlled by `app.email.enabled` flag — set to `false` in dev for stub mode (logs instead of sending), `true` in production with real credentials.
- **JWT secrets and expiry** are read from `application.yml` via `@Value` annotations.

**`WebMvcConfig`** registers the `/uploads/**` path as a static resource handler so uploaded product images are served directly over HTTP without going through any controller logic.

**`AsyncConfig`** defines a dedicated `emailTaskExecutor` thread pool (core: 2, max: 5, queue: 100) used exclusively by the email service. This ensures email sending never blocks API responses.

**`AdminSeeder`** is a `CommandLineRunner` bean that creates the default admin account (ADMIN role) on first boot if it doesn't already exist.

**`BrandSeeder`** seeds 16 partner brands on first run.

### 4.2 Authentication & JWT

Authentication uses a **stateless JWT** approach — no sessions, no cookies.

**`User` entity** implements Spring Security's `UserDetails` directly. The user has a `Role` enum (`USER`, `ADMIN`, `SELLER`) and an `active` boolean flag — disabled accounts cannot log in.

**`JwtService`** handles token generation, validation, and claim extraction using HMAC-SHA256.

**`JwtAuthenticationFilter`** intercepts every request, extracts the email from the Bearer token, loads the user, validates the token, and sets the `SecurityContext`.

**`RefreshTokenService`** manages persisted refresh tokens with 7-day expiry and rotation on every use.

**`SecurityConfig`** defines public vs protected routes. `/admin/**` requires `ROLE_ADMIN`. Cart, orders, wishlist, and profile require any authenticated user.

### 4.3 Domain Modules

Each feature is a self-contained package: `entity → repository → dto → service → controller`.

#### User, Product, Category, Brand, Cart, Order, Address, Wishlist, Review, Blog, Requests, Notifications, Analytics, Site Content

_(Unchanged from v7.5.2 — see previous sections for full descriptions.)_

### 4.4 Email Notification System

The email system is fully asynchronous, template-driven, and controlled by a master on/off flag.

#### Architecture

```
Service layer (e.g. OrderServiceImpl)
    └── emailService.sendEmail(EmailRequest)   ← non-blocking, returns immediately
            └── @Async("emailTaskExecutor")    ← runs on dedicated thread pool
                    └── EmailTemplateBuilder.buildHtml(request)
                    └── JavaMailSender.send(MimeMessage)
```

#### Email Types (`EmailType` enum)

| Type | Trigger | Recipient |
|---|---|---|
| `WELCOME_EMAIL` | User registers | User |
| `PASSWORD_CHANGED` | User changes password | User |
| `ACCOUNT_DISABLED` | Admin disables a user account | User |
| `ACCOUNT_DELETED` | Admin deletes a user account | User |
| `ENQUIRY_CONFIRMATION` | User places an enquiry | User |
| `ADMIN_NEW_ENQUIRY_ALERT` | User places an enquiry | Admin |
| `CONTACT_CONFIRMATION` | User submits contact form | User |
| `ADMIN_NEW_CONTACT_ALERT` | User submits contact form | Admin |
| `AGENT_CONFIRMATION` | Agent submits registration | Agent |
| `ADMIN_NEW_AGENT_ALERT` | Agent submits registration | Admin |
| `ADMIN_REPLY` | Admin replies to any inquiry | User/Agent |

#### Trigger Points

| Event | Service | Email(s) fired |
|---|---|---|
| User registration | `AuthServiceImpl.register()` | `WELCOME_EMAIL` |
| Password change | `UserServiceImpl.changePassword()` | `PASSWORD_CHANGED` |
| Account disabled | `AdminServiceImpl.toggleUserStatus()` | `ACCOUNT_DISABLED` |
| Account deleted | `AdminServiceImpl.deleteUser()` | `ACCOUNT_DELETED` |
| Enquiry placed | `OrderServiceImpl.placeOrder()` | `ENQUIRY_CONFIRMATION` + `ADMIN_NEW_ENQUIRY_ALERT` |
| Contact form submit | `InquiryRequestService.submitContact()` | `CONTACT_CONFIRMATION` + `ADMIN_NEW_CONTACT_ALERT` |
| Agent registration | `InquiryRequestService.submitAgent()` | `AGENT_CONFIRMATION` + `ADMIN_NEW_AGENT_ALERT` |
| Admin replies | `InquiryRequestService.reply()` | `ADMIN_REPLY` |

#### Template Design

All emails share a single `baseTemplate()` method in `EmailTemplateBuilder` that produces a consistent branded HTML layout:
- Red (`#e62e04`) header bar with YourBuildMart branding
- White body with the event-specific content
- Red CTA button linking to the relevant page
- Grey footer with copyright

Each email type has its own builder method that fills in the content block.

#### Configuration (`application.yml`)

```yaml
app:
  email:
    enabled: false                        # Set true in production with live credentials
    from-address: info@yourbuildmart.com
    from-name: YourBuildMart

spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your_gmail@gmail.com
    password: your_gmail_app_password     # 16-character Gmail App Password
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true
```

> **Note:** Use a Gmail App Password (not your account password). Enable 2FA on your Google account, then go to **Google Account → Security → App Passwords** to generate one.

#### Error Handling

Email failures are caught and logged but **never propagate to the API response**. The user's action (registration, enquiry, etc.) succeeds regardless of whether the email sends. This prevents email infrastructure issues from blocking core business operations.

### 4.5 File Storage & Image System

Files saved to `uploads/` at project root. Path structure:

```
uploads/
  products/{productId}/{uuid}.{ext}
  categories/{categoryId}/{uuid}.{ext}
  blog/{postId}/{uuid}.{ext}
  site-images/{slotKey}/{uuid}.{ext}
```

`AvifConversionService` attempts AVIF conversion via `ffmpeg` with graceful fallback.

### 4.6 Exception Handling

`GlobalExceptionHandler` converts all exceptions to consistent JSON:

```json
{
  "success": false,
  "message": "Cannot delete the last admin account.",
  "status": 400
}
```

Custom exceptions: `ResourceNotFoundException` (404), `BadRequestException` (400), `ConflictException` (409), `UnauthorizedException` (401).

### 4.7 API Documentation (Swagger)

Available at `http://localhost:8080/swagger-ui.html`. JWT Bearer auth scheme enabled in Swagger UI.

---

## 5. Frontend Architecture

### 5.1 App Shell & Routing

`main.jsx` wraps the app in: `ThemeProvider → AuthProvider → CartProvider → SiteImagesProvider → LenisProvider → BrowserRouter`.

| Path | Component | Auth |
|---|---|---|
| `/` | `App.jsx` | Public |
| `/products` | `Product.jsx` | Public |
| `/products/:slug` | `ProductDetail.jsx` | Public |
| `/brands` | `Brands.jsx` | Public |
| `/blog` | `Blog.jsx` | Public |
| `/blog/:slug` | `BlogDetail.jsx` | Public |
| `/about` | `About.jsx` | Public |
| `/quality-assurance` | `QualityAssurance.jsx` | Public |
| `/contact` | `Contact.jsx` | Public |
| `/login` | `Login.jsx` | Guest only |
| `/register` | `Register.jsx` | Guest only |
| `/profile` | `Profile.jsx` | Required |
| `/wishlist` | `Wishlist.jsx` | Required |
| `/orders` | `Orders.jsx` | Required |
| `/checkout` | `Checkout.jsx` | Required |
| `/enquiry-success` | `EnquirySuccess.jsx` | Required |
| `/admin` | `AdminDashboard.jsx` | ADMIN role |
| `*` | `NotFound.jsx` | Public (404) |

### 5.2 Theme System

`ThemeContext` stores `dark` boolean in `localStorage`. `ThemeProvider` writes CSS custom properties onto `:root`. Components read `useTheme()` and compute inline styles directly.

### 5.3 Component Library

**`SharedHeader`** — Responsive navigation with Products dropdown (fixed overflow clipping, centered positioning, `min-width: 260px`). Transparent on hero, solid on scroll.

**`Profile.jsx`** — All five section components (`OrdersSection`, `AddressesSection`, `SecuritySection`, `SavedItemsSection`, `ChatsSection`) are defined as **top-level functions outside the `Profile` component** to prevent React unmounting them on every state change (which caused input fields to lose focus after each keystroke).

**`CartDrawer`, `EnquiryModal`, `PageLoader`, `PageTransition`, `Reveal`, `RichTextEditor`, `Footer`** — unchanged from v7.5.2.

### 5.4 Animation System

Lenis smooth scroll, `GlobalAnimationBackground` canvas, `CardRayEffect` 3D tilt, Framer Motion variants.

### 5.5 API Service Layer

`services/api.js` — single point of contact. `apiFetch()` handles JWT injection, 401 auto-refresh, and token rotation. Named API objects: `authApi`, `productApi`, `cartApi`, `ordersApi`, `userApi`, `addressApi`, `wishlistApi`, `reviewApi`, `blogApi`, `requestsApi`, and more.

---

## 6. Feature Deep-Dives

_(Sections 6.1–6.10 unchanged from v7.5.2.)_

### 6.11 Admin Dashboard

`AdminDashboard.jsx` is a Single Page App within the SPA. Internal navigation via `activeKey` state.

#### Admin Account Protection

- **Customer List**: Disable and Delete buttons are **hidden** for any user with `role === "ADMIN"`. Only USER and SELLER accounts can be disabled or deleted from this view.
- **Staff Members**: ADMIN-role rows show a red **"Protected"** badge instead of action buttons. Only SELLER accounts have Disable/Delete actions.
- **Backend guard** (`AdminServiceImpl`): Even if bypassed on the frontend, the backend enforces:
  - Cannot disable the last active admin (`countByRoleAndActiveTrue`)
  - Cannot delete the last admin (`countByRole`)
  - Throws `BadRequestException` (400) for either violation.

#### User Delete Fix

Deleting any user now correctly deletes their `refresh_tokens` record first (via `refreshTokenRepository.deleteByUser(user)`) before deleting the user, preventing the foreign key constraint error that previously caused a 500 response.

#### Staff Section

- Lists all ADMIN and SELLER users.
- ADMIN rows: **Protected** badge — no actions available.
- SELLER rows: Disable/Enable toggle + Delete with confirmation modal.

---

## 7. Database Schema Overview

```
users                 — id, firstName, lastName, email, password, phone, role, active
  ├── refresh_tokens  — id, token, user_id (FK → users.id), expiryDate
  ├── carts           — id, user_id
  │   └── cart_items  — id, cart_id, product_id, quantity
  ├── orders          — id, user_id, orderNumber, status, totalAmount, enquiry fields
  │   └── order_items — id, order_id, product_id, quantity, price, productName, productImage
  ├── addresses       — id, user_id, fullName, phone, addressLine1..., isDefault, addressType
  ├── wishlists       — id, user_id, product_id
  ├── reviews         — id, user_id, product_id, rating, title, comment
  └── notifications   — id, user_id, message, type, read

products              — id, name, description, price, originalPrice, stock, imageUrl,
                        category_id, seller_id, brand, sku, unit, active, featured,
                        averageRating, reviewCount
  └── product_images  — product_id, image_url, image_order

categories            — id, name, description, imageUrl, active
brands                — id, name, logoUrl, description, websiteUrl, active

blog_posts            — id, title, slug, content, shortDescription, bannerImageUrl,
                        author, category_id, published, viewCount
blog_categories       — id, name, slug, description

inquiry_requests      — id, type (AGENT/CONTACT), status (PENDING/REPLIED/DISCARDED),
                        firstName, lastName, email, phone, message,
                        product, quantity, country, city,
                        shopName, address, password,
                        adminReply, repliedAt

search_logs           — id, query, user_id (nullable), createdAt
site_images           — id, slotKey, imageUrl, description
```

---

## 8. Security Model

```
Role        Can Access
──────────────────────────────────────────────────────────────────────
PUBLIC      Browse products, categories, brands, blog
            Submit contact/agent requests
            Search products (with logging)

USER        Everything PUBLIC +
            Cart, orders, addresses, wishlist, reviews
            Update profile / change password
            View notifications, my requests & replies

ADMIN       Everything USER +
            /admin/** (full admin panel)
            Manage products, categories, brands, blog
            Manage all orders, all users
            View and reply to all requests
            Update site images, view analytics
            Cannot delete or disable other ADMIN accounts
            Cannot delete the last admin (backend enforced)
```

---

### Credential Management — Current Setup

All secrets are managed via environment variables and excluded from version control.

```
Backend/
  .env              ← your real values  (now in .gitignore — never committed)
  .env.example      ← safe template     (committed — shows required variables)
  application.yml   ← uses ${VAR} refs  (committed — no secrets)
```

**Variables required to run the project:**

| Variable | Description | Example |
|---|---|---|
| `DB_USERNAME` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `yourpassword` |
| `JWT_SECRET` | JWT signing key — random, 64+ chars | `openssl rand -base64 64` |
| `ADMIN_EMAIL` | Seed admin email | `info@yourbuildmart.com` |
| `ADMIN_PASSWORD` | Seed admin account password | `StrongPass@2024` |
| `MAIL_USERNAME` | Gmail address for sending emails | `you@gmail.com` |
| `MAIL_PASSWORD` | Gmail App Password (16 chars) | `abcd efgh ijkl mnop` |
| `EMAIL_ENABLED` | Set `true` in production to send real emails | `false` |
| `FRONTEND_URL` | Base URL used in email links | `https://yourbuildmart.com` |

`DB_PASSWORD`, `JWT_SECRET`, and `ADMIN_PASSWORD` have **no default values** in `application.yml` — the app will refuse to start if they are not set. This is intentional.

**Generating a strong JWT secret:**
```bash
openssl rand -base64 64
```

**Getting a Gmail App Password:**
1. Enable 2FA on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Generate a new app password for "Mail"
4. Paste the 16-character code as `MAIL_PASSWORD`

> ⚠️ If this repository has ever been pushed to GitHub with the old hardcoded `application.yml`, the exposed DB password, JWT secret, and admin password should all be treated as **compromised** — rotate them (new DB password, new `JWT_SECRET`, new `ADMIN_PASSWORD`) even after this fix, since they remain visible in git history unless the history itself is rewritten or the repo is made private and credentials changed.

---

## 9. Mobile Responsiveness

Breakpoints in `src/styles/responsive.css`:

| Name | Width |
|---|---|
| Tablet landscape | `max-width: 900px` |
| Tablet portrait | `max-width: 768px` |
| Large phone | `max-width: 640px` |
| Phone | `max-width: 480px` |
| Small phone | `max-width: 380px` |

| Page | Desktop | Mobile |
|---|---|---|
| Header | Full nav + dropdowns | Hamburger → overlay drawer |
| Homepage Hero | 2-column: text + carousel | Stacked, centred |
| Product Grid | 3 columns | 2 → 1 column |
| Blog Layout | Content + sidebar | Sidebar hidden |
| Admin Dashboard | Sticky sidebar | Overlay sidebar |
| Profile | Sidebar + content | Horizontal tab strip |
| Checkout | 2-column form | Stacked single column |

---

## 10. Environment Configuration

### Backend — `.env` (never committed)

Copy `Backend/.env.example` to `Backend/.env` and fill in your values:

```bash
cp Backend/.env.example Backend/.env
```

```env
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your-64-char-random-string
ADMIN_PASSWORD=YourStrongAdminPass@2024
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_16_char_app_password
EMAIL_ENABLED=false
FRONTEND_URL=http://localhost:5173
```

### Backend — `application.yml` (safe to commit)

All secrets are referenced via `${VARIABLE_NAME}` — no hardcoded values:

```yaml
spring:
  datasource:
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD}
  mail:
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}

jwt:
  secret: ${JWT_SECRET}

admin:
  password: ${ADMIN_PASSWORD}

app:
  email:
    enabled: ${EMAIL_ENABLED:false}
  frontend:
    url: ${FRONTEND_URL:http://localhost:5173}
```

> ⚠️ `DB_PASSWORD`, `JWT_SECRET`, and `ADMIN_PASSWORD` have **no default values** — the app will refuse to start if they are not set. This is intentional.

### Frontend — `.env`

```env
VITE_API_URL=http://localhost:8080
```

---

## 11. Running the Project

### Prerequisites

- Java 17+
- Maven 3.x
- Node.js 18+
- MySQL 8.x
- `make` (pre-installed on macOS/Linux; on Windows use Git Bash or WSL)
- (Optional) `ffmpeg` for AVIF image conversion

### First-Time Setup

```bash
# 1. Create your local .env file
cp Backend/.env.example Backend/.env
# Edit Backend/.env with your actual values

# 2. Create the MySQL database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS yourbuildmart;"
```

### Backend

```bash
cd Backend
make run        # loads .env automatically and starts Spring Boot
```

Available `make` commands:

| Command | Description |
|---|---|
| `make run` | Start backend (auto-loads `.env`) |
| `make build` | Build production JAR (skips tests) |
| `make clean` | Clean build artifacts |
| `make help` | List all commands |

Starts on `http://localhost:8080`.
Swagger UI at `http://localhost:8080/swagger-ui.html` *(disable in production)*.

On first run: admin account and 16 brands are seeded automatically.

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

Starts on `http://localhost:5173`.

---

## 12. Build & Deployment

### Frontend Production Build

```bash
cd Frontend
npm run build
# Output in Frontend/dist/
```

### Backend Production JAR

```bash
cd Backend
make build
# Output: Backend/target/yourbuildmart-backend-1.0.0.jar
```

### Running the JAR in Production

Pass environment variables directly — never use a `.env` file on a production server:

```bash
java -jar target/yourbuildmart-backend-1.0.0.jar \
  --spring.datasource.password=YourProdDBPass \
  --jwt.secret=YourProdJWTSecret \
  --admin.password=YourProdAdminPass \
  --spring.mail.username=your@gmail.com \
  --spring.mail.password=yourapppassword \
  --app.email.enabled=true \
  --app.frontend.url=https://yourbuildmart.com
```

### Same-Domain Deployment

1. Copy `Frontend/dist/*` into `Backend/src/main/resources/static/`
2. Add a catch-all controller to serve `index.html` for all non-API routes
3. Set `VITE_API_URL=` (empty) before building the frontend

### Docker

```dockerfile
FROM eclipse-temurin:17-jdk-alpine
COPY target/yourbuildmart-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

```yaml
# docker-compose.yml
services:
  db:
    image: mysql:8
    environment:
      MYSQL_DATABASE: yourbuildmart
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}

  backend:
    build: ./Backend
    environment:
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      MAIL_USERNAME: ${MAIL_USERNAME}
      MAIL_PASSWORD: ${MAIL_PASSWORD}
      EMAIL_ENABLED: true
      FRONTEND_URL: https://yourbuildmart.com
    ports:
      - "8080:8080"
    depends_on:
      - db
```

> ⚠️ In production Docker, source environment variables from the host machine or a secrets manager — never hardcode them in `docker-compose.yml`.

---


*YourBuildMart — Built with Spring Boot 3.2.5 · React 18 · MySQL 8 · v7.5.9*
