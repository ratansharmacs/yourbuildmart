// ─── Product Detail Page Data ─────────────────────────────────────────────────
// Replace with API call: const res = await fetch(`/api/products/${slug}`);

export const PRODUCT = {
  name: "Aluminium C-Channel",
  category: "Aluminium Products",
  categoryHref: "/products?category=Aluminium+Products",
  badge: "ISO Certified",
  tagline: "Grade 3003, 5052, 6061 & 7075 | ISO Certified | Up to 6m Length | Anodized | Sand Blasted",
  images: [
    "https://yourbuildmart.com/public/uploads/all/ba5iYZooFMPEMddIKtVBm4buRtxkphdnf1NhrH65.jpg",
    "https://yourbuildmart.com/public/uploads/all/40hhZt12ecufub4RMVGpgplIBWFZjoylPT0tSs2x.jpg",
    "https://yourbuildmart.com/public/uploads/all/qvzksoytHBhKDMaxSxSwpVQtGlod5C0S4TlOvyCZ.png",
  ],
  specs: [
    { label: "Standard",    value: "ISO / ISI Certified" },
    { label: "Type",        value: "Square and Rectangle" },
    { label: "Size",        value: "As per design" },
    { label: "Length",      value: "6 metres" },
    { label: "Application", value: "Building & Construction" },
    { label: "Surface",     value: "Anodized or Sand Blasted" },
    { label: "Packing",     value: "Standard Export Package (Bundles / Customized)" },
    { label: "Lead Time",   value: "21 Days" },
    { label: "Quantity",    value: "As per requirement" },
  ],
  tabs: [
    { id: "overview",      label: "Overview",      content: `<p>An aluminium C-channel is a structural component with a distinctive C-shaped cross-section, widely used for its lightweight, strength, and corrosion-resistant properties.</p>` },
    { id: "features",      label: "Key Features",  content: `<ol><li><strong>Durable and Lightweight</strong><ul><li>High strength-to-weight ratio ensures excellent structural integrity without adding unnecessary weight.</li></ul></li><li><strong>Corrosion Resistance</strong><ul><li>Natural resistance to rust and corrosion makes aluminium C-channels suitable for both indoor and outdoor use.</li></ul></li><li><strong>Customizable Finishes</strong><ul><li>Available in raw, anodized, or powder-coated finishes.</li></ul></li></ol>` },
    { id: "applications",  label: "Applications",  content: `<ul><li><strong>Construction &amp; Architecture</strong> — Structural frameworks for windows, doors, curtain walls.</li><li><strong>Automotive &amp; Transportation</strong> — Components for lightweight vehicle frames and cargo carriers.</li><li><strong>Industrial &amp; Manufacturing</strong> — Machinery enclosures and cable management systems.</li></ul>` },
    { id: "advantages",    label: "Advantages",    content: `<ul><li><strong>Lightweight Yet Strong</strong> — High strength-to-weight ratio reduces labor costs.</li><li><strong>Corrosion Resistance</strong> — Performs exceptionally in harsh environments.</li><li><strong>Eco-Friendly</strong> — 100% recyclable without losing quality.</li></ul>` },
    { id: "why",           label: "Why Choose Us", content: `<ul><li><strong>ISO &amp; ISI Certified</strong> — Every product meets international quality standards.</li><li><strong>Global Delivery</strong> — We ship to Africa, Europe, Middle East, and beyond.</li><li><strong>Expert Support</strong> — Round-the-clock assistance for your project needs.</li></ul>` },
    { id: "contact",       label: "Contact Us",    content: `<p>Get in touch with YourBuildMart for premium aluminium profiles and professional support.</p><p><strong>📍 UAE:</strong> Unit 13 &amp; 14, Princess Cars Building, Dubai</p><p><strong>📱 UAE:</strong> +971 58 676 6102</p><p><strong>✉ Email:</strong> contact@yourbuildmart.com</p>` },
  ],
};

export const RELATED_PRODUCTS = [
  { name: "Aluminium Products",      href: "/products?category=Aluminium+Products",  img: "https://yourbuildmart.com/public/uploads/all/qvzksoytHBhKDMaxSxSwpVQtGlod5C0S4TlOvyCZ.png" },
  { name: "Electrical Products",     href: "/products?category=Electrical+Products", img: "https://yourbuildmart.com/public/uploads/all/ylpqNpVuBFrDi40XUABTmoEqdVSVZHmXdxC04d9O.jpg" },
  { name: "False Ceiling Products",  href: "/products?category=False+Ceiling",       img: "https://yourbuildmart.com/public/uploads/all/Sel9jonaPtZyRXyMNJBGGzUnlOyws0lBNt78iaen.jpg" },
  { name: "Industrial Valves",       href: "/products?category=Industrial+Valves",   img: "https://yourbuildmart.com/public/uploads/all/uHmWHxUbUReKl6zaKd4xgJ3FX1MgxRpZNGULlmUP.jpg" },
];

export const TOP_SELLING = [
  { name: "PVC Insulated Electrical Wires", href: "/products?category=Electrical+Products", img: "https://yourbuildmart.com/public/uploads/all/ZIBhJ0c7yPTzBRR20exXTLMIfQLuY73ckql4h9dG.jpg" },
  { name: "PEB - Pre Engineered Building",  href: "/products?category=PEB+Structure",       img: "https://yourbuildmart.com/public/uploads/all/vVdQYPPzaBTGdJxh4jAC6EpsPXWQNgx4WPhEXWoU.jpg" },
  { name: "False Ceiling Joint Tape",       href: "/products?category=False+Ceiling",       img: "https://yourbuildmart.com/public/uploads/all/1KoPWR6bXzYDdzHZzVnRoqHutYcij7euEiFbu0KP.jpg" },
  { name: "Aluminium C-Channel",            href: "/products?category=Aluminium+Products",  img: "https://yourbuildmart.com/public/uploads/all/40hhZt12ecufub4RMVGpgplIBWFZjoylPT0tSs2x.jpg" },
];

export const DETAIL_BLOGS = [
  { title: "Affordable Construction Material for African and European Countries", category: "LOGISTIC SERVICE", href: "/blog", img: "https://yourbuildmart.com/public/uploads/all/oaEiFmcHGkRJizyKXL5WZMZSeqeHTu7HoNeudTJZ.jpg" },
  { title: "Cladded Valves: What You Need to Know",                               category: "ORDER PROTECTION", href: "/blog", img: "https://yourbuildmart.com/public/uploads/all/ueOyzSRgkdaNabL9MoVBRGhSQcC82VdkZup4qpdb.jpg" },
  { title: "TMT Steel Bars: The Backbone of Modern Construction",                 category: "INDUSTRY INSIGHTS",href: "/blog", img: "https://yourbuildmart.com/public/uploads/all/NyxEjph6tvdW6iBmKI2jpOFekIrYacpg52T2Ne5S.jpg" },
];
