import { Link } from "react-router-dom";
import { SharedHeader, useTheme, Footer, useSiteImage } from "../components";
import "../styles/about.css";

// ─── DATA ────────────────────────────────────────────────────────────────────
const QA_STEPS = [
  {
    icon: "🔍",
    title: "Stringent Supplier Selection",
    body: "The foundation of our quality assurance begins with the selection of our suppliers. We work only with trusted, reliable partners who share our commitment to quality. Every supplier undergoes a rigorous vetting process, which includes an evaluation of their manufacturing processes, product consistency, and adherence to international standards. This ensures that all materials we offer — whether building supplies, hardware, or finishing materials — meet the highest standards of durability, safety, and performance.",
  },
  {
    icon: "🧪",
    title: "Material Testing & Inspection",
    body: "Before any product is stocked or dispatched to a customer, it undergoes thorough testing and inspection. Our team of experts conducts a series of tests to ensure that the materials meet not only our high standards but also any relevant industry regulations. These tests include strength testing, durability checks, and compliance with safety standards. Only after passing these inspections do products earn the YourBuildMart seal of approval.",
  },
  {
    icon: "📊",
    title: "Continuous Monitoring & Auditing",
    body: "Quality assurance is an ongoing process at YourBuildMart. We continuously monitor the performance of our products in real-world applications. Feedback from customers and contractors is invaluable, helping us fine-tune our processes and address any potential issues. Our auditing system ensures we maintain consistent quality over time, with regular reviews of both supplier performance and our internal processes.",
  },
  {
    icon: "📋",
    title: "Certifications & Compliance",
    body: "All products offered by YourBuildMart comply with local and international quality standards. We take compliance very seriously, ensuring all products meet regulatory requirements such as ISO certifications, ASTM standards, and environmental guidelines. This guarantees that the products you purchase are not only high-quality but also safe and sustainable.",
  },
  {
    icon: "🤝",
    title: "Customer Support & Feedback",
    body: "At YourBuildMart, customer satisfaction is paramount. We understand that the success of your project depends on the reliability of our products. That's why we offer comprehensive customer support to address any concerns you may have about product quality. Our team is always ready to assist with product inquiries, troubleshooting, and after-sales support.",
  },
];

// ─── SECTIONS ────────────────────────────────────────────────────────────────
function PageHero() {
  const { dark } = useTheme();
  return (
    <section
      className="page-hero"
      style={{
        background: "transparent",
        borderBottom: `1px solid ${dark ? "#222" : "#eee"}`,
        padding: "40px 0",
        transition: "background 0.4s",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <h1
          style={{
            fontSize: "clamp(26px,5vw,36px)",
            fontWeight: 800,
            color: dark ? "#fff" : "#111",
            marginBottom: 10,
            letterSpacing: "-0.5px",
          }}
        >
          Quality Assurance
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: dark ? "#888" : "#666" }}>
          <Link to="/" style={{ color: "#e62e04", textDecoration: "none", fontWeight: 600 }}>
            Home
          </Link>
          <span>›</span>
          <Link to="/about" style={{ color: "#e62e04", textDecoration: "none", fontWeight: 600 }}>
            About Us
          </Link>
          <span>›</span>
          <span style={{ color: dark ? "#ccc" : "#444" }}>Quality Assurance</span>
        </div>
      </div>
    </section>
  );
}

function Intro() {
  const { dark } = useTheme();
  const qualityImg = useSiteImage("quality-assurance", "quality_image", "https://yourbuildmart.com/public/assets/img/quality.jpg");
  const textColor = dark ? "#ccc" : "#444";
  const headingColor = dark ? "#fff" : "#111";

  return (
    <section style={{ background: "transparent", padding: "clamp(40px,6vw,80px) 0", transition: "background 0.4s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <div className="about-who-grid">
          {/* Text */}
          <div>
            <span
              style={{
                display: "inline-block",
                background: "#fef0ed",
                color: "#e62e04",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                padding: "5px 12px",
                borderRadius: 4,
                marginBottom: 20,
              }}
            >
              Our Promise
            </span>
            <h2
              style={{
                fontSize: "clamp(22px,4vw,34px)",
                fontWeight: 800,
                color: headingColor,
                lineHeight: 1.2,
                marginBottom: 20,
                letterSpacing: "-0.5px",
              }}
            >
              Quality Assurance at YourBuildMart
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: textColor }}>
              At YourBuildMart, we take immense pride in delivering top-quality products and services to our
              customers. Our commitment to excellence is embedded in every aspect of our operations — from
              sourcing premium materials to ensuring that each product meets rigorous industry standards. We
              believe quality assurance is not just a process but a promise: that your projects will be built
              with the best possible materials and craftsmanship.
            </p>
          </div>
          {/* Image */}
          <div
            style={{
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: dark ? "0 20px 60px rgba(0,0,0,0.5)" : "0 20px 60px rgba(0,0,0,0.12)",
              height: "clamp(240px,40vw,360px)",
            }}
          >
            <img
              src={qualityImg}
              alt="Quality Assurance at YourBuildMart"
              onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = "https://yourbuildmart.com/public/assets/img/quality.jpg"; }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessSteps() {
  const { dark } = useTheme();
  const headingColor = dark ? "#fff" : "#111";
  const textColor = dark ? "#ccc" : "#444";
  const cardBg = dark ? "#181818" : "#fff";
  const cardShadow = dark ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.07)";

  return (
    <section
      style={{
        background: dark ? "#111" : "#f7f7f7",
        padding: "clamp(40px,6vw,80px) 0",
        transition: "background 0.4s",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span
            style={{
              display: "inline-block",
              background: "#fef0ed",
              color: "#e62e04",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              padding: "5px 12px",
              borderRadius: 4,
              marginBottom: 16,
            }}
          >
            Our Process
          </span>
          <h2
            style={{
              fontSize: "clamp(22px,4vw,34px)",
              fontWeight: 800,
              color: headingColor,
              marginBottom: 12,
              letterSpacing: "-0.5px",
            }}
          >
            Our Quality Assurance Process
          </h2>
          <p style={{ fontSize: 16, color: textColor, maxWidth: 600, margin: "0 auto" }}>
            A structured, end-to-end approach that guarantees every product you receive meets the highest standards.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {QA_STEPS.map((step, i) => (
            <div
              key={step.title}
              className="ray-card"
              style={{
                background: cardBg,
                borderRadius: 16,
                padding: "clamp(20px,3vw,36px)",
                boxShadow: cardShadow,
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "clamp(16px,2vw,32px)",
                alignItems: "flex-start",
                borderLeft: "4px solid #e62e04",
                transition: "background 0.4s",
              }}
            >
              {/* Step number + icon */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 56 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "#fef0ed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                  }}
                >
                  {step.icon}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#e62e04",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  Step {i + 1}
                </span>
              </div>

              {/* Content */}
              <div>
                <h3
                  style={{
                    fontSize: "clamp(16px,2vw,20px)",
                    fontWeight: 800,
                    color: headingColor,
                    marginBottom: 10,
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: textColor, margin: 0 }}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Sustainability() {
  const { dark } = useTheme();
  const sustainabilityImg = useSiteImage("quality-assurance", "sustainability_image", "https://yourbuildmart.com/public/assets/img/sustainbility.jpg");
  const textColor = dark ? "#ccc" : "#444";
  const headingColor = dark ? "#fff" : "#111";

  return (
    <section style={{ background: "transparent", padding: "clamp(40px,6vw,80px) 0", transition: "background 0.4s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        {/* Sustainability split */}
        <div className="about-who-grid" style={{ marginBottom: 64 }}>
          <div>
            <span
              style={{
                display: "inline-block",
                background: "#fef0ed",
                color: "#e62e04",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                padding: "5px 12px",
                borderRadius: 4,
                marginBottom: 20,
              }}
            >
              Green Future
            </span>
            <h2
              style={{
                fontSize: "clamp(22px,4vw,34px)",
                fontWeight: 800,
                color: headingColor,
                lineHeight: 1.2,
                marginBottom: 20,
                letterSpacing: "-0.5px",
              }}
            >
              Our Commitment to Sustainability
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: textColor }}>
              Quality at YourBuildMart extends beyond performance and durability — it includes our responsibility
              to the environment. We are committed to sourcing eco-friendly materials and promoting sustainable
              building practices. Many of our products are made from recycled or renewable resources, and we are
              constantly seeking new ways to reduce our carbon footprint. When you choose YourBuildMart, you are
              not only getting high-quality materials but also contributing to a greener future.
            </p>
          </div>
          <div
            style={{
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: dark ? "0 20px 60px rgba(0,0,0,0.5)" : "0 20px 60px rgba(0,0,0,0.12)",
              height: "clamp(240px,40vw,360px)",
            }}
          >
            <img
              src={sustainabilityImg}
              alt="Sustainability at YourBuildMart"
              onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = "https://yourbuildmart.com/public/assets/img/sustainbility.jpg"; }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Closing statement */}
        <div
          className="ray-card"
          style={{
            background: dark ? "#181818" : "#fff",
            borderRadius: 20,
            padding: "clamp(28px,4vw,56px)",
            boxShadow: dark ? "0 8px 40px rgba(0,0,0,0.4)" : "0 8px 40px rgba(0,0,0,0.08)",
            textAlign: "center",
            transition: "background 0.4s",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 16 }}>🏆</div>
          <h3
            style={{
              fontSize: "clamp(18px,3vw,26px)",
              fontWeight: 800,
              color: headingColor,
              marginBottom: 16,
              letterSpacing: "-0.3px",
            }}
          >
            Quality is the Cornerstone of Our Business
          </h3>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: textColor,
              maxWidth: 700,
              margin: "0 auto 28px",
            }}
          >
            Our comprehensive quality assurance process ensures that every product you purchase meets the
            highest standards of reliability, safety, and sustainability. From supplier selection to material
            testing and customer feedback, we go the extra mile to make your building projects successful.
            YourBuildMart is committed to being your trusted partner in delivering exceptional quality, every
            step of the way.
          </p>
          <Link
            to="/contact"
            style={{
              display: "inline-block",
              background: "#e62e04",
              color: "#fff",
              padding: "12px 32px",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: "none",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#c0280a")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#e62e04")}
          >
            Get In Touch →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function QualityAssurance() {
  return (
    <>
      <SharedHeader activePage="about" />
      <PageHero />
      <Intro />
      <ProcessSteps />
      <Sustainability />
      <Footer />
    </>
  );
}
