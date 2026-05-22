# YourBuildMart 🏗️

A modern e-commerce frontend for building materials and hardware products, built with **React 19** and **Vite**.

---

## 📁 Project Structure

```
yourbuildmart_restructured/
├── Backend/                        # Backend placeholder (in development)
│   └── .gitkeep
└── Frontend/                       # React + Vite frontend
    ├── index.html                  # App entry point
    ├── package.json
    ├── vite.config.js
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    └── src/
        ├── main.jsx                # Root renderer & router setup
        ├── App.jsx                 # Homepage component
        ├── App.css
        ├── index.css               # Global styles
        ├── assets/
        │   ├── hero.png
        │   ├── react.svg
        │   └── vite.svg
        ├── components/             # Reusable UI components
        │   ├── index.js            # Barrel export
        │   ├── SharedHeader.jsx    # Site-wide navigation header
        │   ├── Footer.jsx          # Site-wide footer
        │   ├── CartDrawer.jsx      # Slide-out shopping cart
        │   ├── CartContext.jsx     # Cart state & context provider
        │   ├── ThemeContext.jsx    # Light/dark theme context
        │   ├── ThemeToggle.jsx     # Theme switcher button
        │   └── StarRating.jsx      # Reusable star rating widget
        └── pages/                  # Route-level page components
            ├── About.jsx           # About Us page
            ├── Blog.jsx            # Blog listing page
            ├── Brands.jsx          # Brands showcase page
            ├── Contact.jsx         # Contact page
            ├── Product.jsx         # Product listing/catalog page
            └── ProductDetail.jsx   # Individual product detail page
```

---

## 🚀 Tech Stack

| Layer     | Technology                          |
|-----------|--------------------------------------|
| Framework | React 19                            |
| Build Tool | Vite 8                             |
| Routing   | React Router DOM v7                 |
| Compiler  | React Compiler (Babel plugin)       |
| Linting   | ESLint 10                           |
| Language  | JavaScript (JSX)                    |

---

## ⚙️ Getting Started

### Prerequisites

- Node.js **v18+**
- npm **v9+**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ratansharmacs/yourbuildmart.git
cd yourbuildmart

# 2. Navigate to the frontend
cd Frontend

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will be running at **http://localhost:5173**

---

## 📜 Available Scripts

Run these from inside the `Frontend/` directory:

| Command           | Description                        |
|-------------------|------------------------------------|
| `npm run dev`     | Start local development server     |
| `npm run build`   | Build for production               |
| `npm run preview` | Preview the production build       |
| `npm run lint`    | Run ESLint checks                  |

---

## 🗺️ Pages & Routes

| Route            | Component          | Description                  |
|------------------|--------------------|------------------------------|
| `/`              | `App.jsx`          | Homepage                     |
| `/about`         | `About.jsx`        | About Us                     |
| `/products`      | `Product.jsx`      | Product catalog              |
| `/productDetail` | `ProductDetail.jsx`| Product detail view          |
| `/brands`        | `Brands.jsx`       | Brands listing               |
| `/blog`          | `Blog.jsx`         | Blog posts                   |
| `/contact`       | `Contact.jsx`      | Contact form                 |

---

## 🧩 Key Components

- **SharedHeader** — Top navigation bar shared across all pages
- **Footer** — Site-wide footer with links and info
- **CartDrawer** — Slide-in cart panel driven by `CartContext`
- **CartContext** — Global cart state using React Context API
- **ThemeContext / ThemeToggle** — Light/dark mode support
- **StarRating** — Reusable rating component for product reviews

---

## 🔧 Backend

The `Backend/` directory is scaffolded and ready for development. API integration is planned for a future release.

---

## 📄 License

This project is private. All rights reserved © YourBuildMart.
