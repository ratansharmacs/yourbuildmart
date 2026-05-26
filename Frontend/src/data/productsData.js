// ─── Products Page Data ───────────────────────────────────────────────────────
// Replace with API call: const res = await fetch('/api/products');

export const ALL_PRODUCTS = [
  { id: 54, name: "Steel Sheet",                              img: "https://yourbuildmart.com/public/uploads/all/ht8ZZADqglloTYRX26oSKQL3YFoFOyUnR4t2bqWx.jpg",  href: "/productDetail", category: "Steel Sections",       tag: "ISO Certified"   },
  { id: 52, name: "Butterfly Valves",                         img: "https://yourbuildmart.com/public/uploads/all/l3JEgHz9repFAiFyLU2p5CHjbcUPdmo0VEMec3kJ.png",  href: "/productDetail", category: "Industrial Valves",    tag: "Global Delivery"  },
  { id: 51, name: "Gate, Globe & Check Valves – Bolted Bonnet", img: "https://yourbuildmart.com/public/uploads/all/GrLvcocreimeiNs13iOYvNZ2dMA9pLXlyrmaXvpQ.png",href: "/productDetail", category: "Industrial Valves",    tag: "ISI Marked"       },
  { id: 50, name: "Fire Protection Valves",                   img: "https://yourbuildmart.com/public/uploads/all/xT99T3DRGI7u1N22erKyEnM54VtzGhQkFOVsRrsS.jpg",  href: "/productDetail", category: "Fire Fighting",        tag: "Best Price"       },
  { id: 48, name: "Fire Fighting Grooved Pipe Fittings & Coupling", img: "https://yourbuildmart.com/public/uploads/all/xe3TEue39X9QojFUhzC2JCbzgF3TjtBOkEWspgJx.jpg", href: "/productDetail", category: "Fire Fighting", tag: "ISO Certified"   },
  { id: 47, name: "TMT Steel Bars",                           img: "https://yourbuildmart.com/public/uploads/all/0ER95UzZVBeagJpEPWXZm5M9SSWaZnj2CP0auTBs.gif",  href: "/productDetail", category: "TMT Steel",           tag: "ISO Certified"   },
  { id: 42, name: "Galvanized Iron (GI) Roofing Sheets",      img: "https://yourbuildmart.com/public/uploads/all/skxYNbjMfCpEfEYAINnuiKLyXGnwTNIHUvjjyZHJ.jpg",  href: "/productDetail", category: "Steel Sections",       tag: "Global Delivery"  },
  { id: 41, name: "PEB – Pre Engineered Building",            img: "https://yourbuildmart.com/public/uploads/all/vVdQYPPzaBTGdJxh4jAC6EpsPXWQNgx4WPhEXWoU.jpg",  href: "/productDetail", category: "PEB Structure",        tag: "Global Delivery"  },
  { id: 35, name: "Aluminium C-Channel",                      img: "https://yourbuildmart.com/public/uploads/all/qvzksoytHBhKDMaxSxSwpVQtGlod5C0S4TlOvyCZ.png",  href: "/productDetail", category: "Aluminium Products",  tag: "ISI Marked"       },
  { id: 36, name: "Electrical Conduit Pipes",                 img: "https://yourbuildmart.com/public/uploads/all/ylpqNpVuBFrDi40XUABTmoEqdVSVZHmXdxC04d9O.jpg",  href: "/productDetail", category: "Electrical Products", tag: "ISI Marked"       },
  { id: 37, name: "False Ceiling Grid System",                img: "https://yourbuildmart.com/public/uploads/all/Sel9jonaPtZyRXyMNJBGGzUnlOyws0lBNt78iaen.jpg",  href: "/productDetail", category: "False Ceiling",        tag: "Best Price"       },
  { id: 38, name: "Industrial Ball Valves",                   img: "https://yourbuildmart.com/public/uploads/all/uHmWHxUbUReKl6zaKd4xgJ3FX1MgxRpZNGULlmUP.jpg",  href: "/productDetail", category: "Industrial Valves",   tag: "ISO Certified"    },
];

export const CATEGORIES_SIDEBAR = [
  { name: "All Products",       img: null,    href: "#",                                   count: 12 },
  { name: "Aluminium Products", img: "https://yourbuildmart.com/public/uploads/all/qvzksoytHBhKDMaxSxSwpVQtGlod5C0S4TlOvyCZ.png", href: "/products?category=Aluminium+Products",  count: 5  },
  { name: "Electrical Products",img: "https://yourbuildmart.com/public/uploads/all/ylpqNpVuBFrDi40XUABTmoEqdVSVZHmXdxC04d9O.jpg", href: "/products?category=Electrical+Products", count: 8  },
  { name: "False Ceiling",      img: "https://yourbuildmart.com/public/uploads/all/Sel9jonaPtZyRXyMNJBGGzUnlOyws0lBNt78iaen.jpg", href: "/products?category=False+Ceiling",       count: 6  },
  { name: "Fire Fighting",      img: "https://yourbuildmart.com/public/uploads/all/G98hSbCqpgGs4u7l116dQRNkdnVowdyYliKEVerr.jpg", href: "/products?category=Fire+Fighting",       count: 7  },
  { name: "Industrial Valves",  img: "https://yourbuildmart.com/public/uploads/all/uHmWHxUbUReKl6zaKd4xgJ3FX1MgxRpZNGULlmUP.jpg", href: "/products?category=Industrial+Valves",   count: 9  },
  { name: "PEB Structure",      img: "https://yourbuildmart.com/public/uploads/all/blJXzfApTXVc3364qVExp6aNwVo9dCs80CaEqfXG.jpg",  href: "/products?category=PEB+Structure",       count: 4  },
  { name: "TMT Steel",          img: "https://yourbuildmart.com/public/assets/img/steel__bars.jpg",                                href: "/products?category=TMT+Steel",           count: 6  },
  { name: "Steel Sections",     img: "https://yourbuildmart.com/public/uploads/all/ht8ZZADqglloTYRX26oSKQL3YFoFOyUnR4t2bqWx.jpg", href: "https://yourbuildmart.com/steel-sections-and-accessories-products", count: 10 },
];

export const TAG_COLORS = {
  "ISO Certified":  { bg: "#e8f5e9", color: "#2e7d32" },
  "ISI Marked":     { bg: "#e3f2fd", color: "#1565c0" },
  "Global Delivery":{ bg: "#fce4ec", color: "#c62828" },
  "Best Price":     { bg: "#fff8e1", color: "#f57f17" },
};
