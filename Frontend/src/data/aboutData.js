// ─── About Page Data ──────────────────────────────────────────────────────────
// Replace these with API calls when backend is ready:
// e.g. const res = await fetch('/api/about/products');

export const ABOUT_PRODUCTS = [
  { name: "Aluminium Products",  href: "/products?category=Aluminium+Products",  slotKey: "category_aluminium",   img: "https://yourbuildmart.com/public/uploads/all/qvzksoytHBhKDMaxSxSwpVQtGlod5C0S4TlOvyCZ.png" },
  { name: "Electrical Products", href: "/products?category=Electrical+Products", slotKey: "category_electrical",  img: "https://yourbuildmart.com/public/uploads/all/ylpqNpVuBFrDi40XUABTmoEqdVSVZHmXdxC04d9O.jpg" },
  { name: "False Ceiling",       href: "/products?category=False+Ceiling",       slotKey: "category_false_ceiling",img: "https://yourbuildmart.com/public/uploads/all/Sel9jonaPtZyRXyMNJBGGzUnlOyws0lBNt78iaen.jpg" },
  { name: "Fire Fighting",       href: "/products?category=Fire+Fighting",       slotKey: "category_fire_fighting",img: "https://yourbuildmart.com/public/uploads/all/G98hSbCqpgGs4u7l116dQRNkdnVowdyYliKEVerr.jpg" },
  { name: "Industrial Valves",   href: "/products?category=Industrial+Valves",   slotKey: "category_valves",      img: "https://yourbuildmart.com/public/uploads/all/uHmWHxUbUReKl6zaKd4xgJ3FX1MgxRpZNGULlmUP.jpg" },
  { name: "PEB Structure",       href: "/products?category=PEB+Structure",       slotKey: "category_peb",         img: "https://yourbuildmart.com/public/uploads/all/blJXzfApTXVc3364qVExp6aNwVo9dCs80CaEqfXG.jpg" },
];

export const CLIENT_LOGOS = [
  { slotKey: "partner_bpl",     img: "https://yourbuildmart.com/public/assets/img/BPL.png" },
  { slotKey: "partner_aai",     img: "https://yourbuildmart.com/public/assets/img/AAI.png" },
  { slotKey: "partner_irites",  img: "https://yourbuildmart.com/public/assets/img/irites.png" },
  { slotKey: "partner_dpworld", img: "https://yourbuildmart.com/public/assets/img/DP_world.png" },
  { slotKey: "partner_cfcl",    img: "https://yourbuildmart.com/public/assets/img/CFCL.png" },
  { slotKey: "partner_iol",     img: "https://yourbuildmart.com/public/assets/img/IOL.png" },
  { slotKey: "partner_dlf",     img: "https://yourbuildmart.com/public/assets/img/DLF.png" },
  { slotKey: "partner_nha",     img: "https://yourbuildmart.com/public/assets/img/NHA.png" },
];

export const CERTIFICATIONS = [
  "Apollo CI Plumbing Pipe Product Certificate",
  "ISO 9001:2015 Quality Management Certificate",
  "ISI Mark Certificate – TMT Steel Bars",
  "Fire Safety Compliance Certificate",
  "PEB Structure Quality Assurance Certificate",
  "Electrical Products ISI Certification",
  "Aluminium Products Standards Certificate",
  "Environmental Compliance Certificate",
];

export const SUSTAINABILITY_SECTIONS = [
  {
    title: "Sustainability and Quality Assurance",
    text: "At YourBuildMart, sustainability is at the core of our operations. We are committed to minimizing our environmental impact by implementing green manufacturing processes and ensuring responsible sourcing of materials. Our quality assurance program ensures that every product we manufacture meets or exceeds industry standards.",
    img: "https://yourbuildmart.com/public/assets/img/sustainable.jpg",
    slotKey: "sustainable_image",
    imgRight: true,
  },
  {
    title: "Customer-Centric Approach",
    text: "We believe in building lasting relationships with our customers by offering end-to-end support. Whether it's helping you choose the right product, offering expert installation advice, or providing after-sales service, we are here to assist at every stage of your project.",
    img: "https://yourbuildmart.com/public/assets/img/costomer.jpg",
    slotKey: "customer_image",
    imgRight: false,
  },
];

export const VISION_MISSION = [
  { label: "Vision",  icon: "🔭", text: "To revolutionize the building materials industry by setting new standards for innovation, quality, and sustainability, ensuring our customers have access to the most advanced solutions available." },
  { label: "Mission", icon: "🎯", text: "We aim to be the most trusted partner for construction companies worldwide by providing a comprehensive range of products, timely delivery, and unmatched customer service." },
];
