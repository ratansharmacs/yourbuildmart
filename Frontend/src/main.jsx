import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider, ThemeProvider, GlobalAnimationBackground } from "./components";
import "./index.css";
import App from "./App";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Product from "./pages/Product";
import Brands from "./pages/Brands";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <CartProvider>
          <GlobalAnimationBackground />
          <Routes>
            <Route path="/"             element={<App />} />
            <Route path="/about"        element={<About />} />
            <Route path="/contact"      element={<Contact />} />
            <Route path="/blog"         element={<Blog />} />
            <Route path="/products"     element={<Product />} />
            <Route path="/brands"       element={<Brands />} />
            <Route path="/productDetail" element={<ProductDetail />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/register"     element={<Register />} />
          </Routes>
        </CartProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
