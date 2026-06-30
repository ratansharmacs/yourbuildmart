import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme, SharedHeader, Footer, useAuth } from "../components";
import { ordersApi, resolveImageUrl } from "../services/api";

const STATUS_COLORS = {
  PENDING:    { bg: "#fff8e1", color: "#f5a623", border: "#ffe082" },
  CONFIRMED:  { bg: "#e8f5e9", color: "#2e7d32", border: "#a5d6a7" },
  PROCESSING: { bg: "#ede7f6", color: "#512da8", border: "#b39ddb" },
  SHIPPED:    { bg: "#e3f2fd", color: "#1565c0", border: "#90caf9" },
  DELIVERED:  { bg: "#e8f5e9", color: "#1b5e20", border: "#a5d6a7" },
  CANCELLED:  { bg: "#fce4ec", color: "#c62828", border: "#ef9a9a" },
  REFUNDED:   { bg: "#f3e5f5", color: "#6a1b9a", border: "#ce93d8" },
};

const STATUS_STEPS = [
  { key: "PENDING",    label: "Order Placed",       icon: "📋" },
  { key: "CONFIRMED",  label: "Confirmed",           icon: "✅" },
  { key: "PROCESSING", label: "Processing / Packed", icon: "📦" },
  { key: "SHIPPED",    label: "Shipped",             icon: "🚚" },
  { key: "DELIVERED",  label: "Delivered",           icon: "🏠" },
];

function OrderDetailModal({ orderId, dark, onClose }) {
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  const bg       = dark ? "#1a1a1a" : "#fff";
  const border   = dark ? "#2a2a2a" : "#e8e8e8";
  const text      = dark ? "#e8e8e8" : "#222";
  const muted     = dark ? "#888"    : "#888";
  const overlay   = "rgba(0,0,0,0.55)";

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await ordersApi.getById(orderId);
        // unwrap ApiResponse envelope if present
        setOrder(data?.data ?? data);
      } catch (e) {
        setError(e.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  // Determine active step index for the tracker
  const activeStep = order
    ? STATUS_STEPS.findIndex(s => s.key === order.status)
    : -1;
  const isCancelled  = order?.status === "CANCELLED";
  const isRefunded   = order?.status === "REFUNDED";
  const showTracker  = !isCancelled && !isRefunded;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: overlay,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: bg, border: `1px solid ${border}`,
          borderRadius: 20, width: "100%", maxWidth: 620,
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.28)",
          color: text,
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 24px 16px", borderBottom: `1px solid ${border}`,
          position: "sticky", top: 0, background: bg, zIndex: 1, borderRadius: "20px 20px 0 0",
        }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Order Details</h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: "50%", border: "none",
              background: dark ? "#333" : "#f0f0f0", cursor: "pointer",
              fontSize: 18, color: text, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >×</button>
        </div>

        <div style={{ padding: "20px 24px 28px" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: 48, color: muted }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
              Loading order details…
            </div>
          )}
          {error && (
            <div style={{ padding: 16, background: "#fee", color: "#c00", borderRadius: 10, border: "1px solid #fcc" }}>
              {error}
            </div>
          )}

          {order && (
            <>
              {/* Basic info grid */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: 12, marginBottom: 24,
              }}>
                {[
                  ["Enquiry Code", order.orderNumber || `#${order.id}`],
                  ["Date", order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"],
                  ["Name", order.enquiryName || "—"],
                  ["Email", order.enquiryEmail || "—"],
                  ["Organization", order.enquiryOrganization || "—"],
                  ["Country", order.enquiryCountry || "—"],
                ].map(([label, value]) => (
                  <div key={label} style={{
                    background: dark ? "#242424" : "#f8f8f8",
                    borderRadius: 10, padding: "12px 14px",
                    border: `1px solid ${border}`,
                  }}>
                    <p style={{ fontSize: 11, color: muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: label === "Enquiry Code" ? "#e62e04" : text }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Enquiry message */}
              {order.enquiryText && (
                <div style={{
                  background: dark ? "#242424" : "#f8f8f8",
                  borderRadius: 10, padding: "12px 14px",
                  border: `1px solid ${border}`, marginBottom: 24,
                }}>
                  <p style={{ fontSize: 11, color: muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>💬 Enquiry Message</p>
                  <p style={{ fontWeight: 500, fontSize: 14, margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{order.enquiryText}</p>
                </div>
              )}

              {/* Order Status Tracker */}
              {showTracker && (
                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 16 }}>
                    Enquiry Status
                  </p>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
                    {STATUS_STEPS.map((step, i) => {
                      const done    = i <= activeStep;
                      const current = i === activeStep;
                      const stepColor = done ? "#e62e04" : (dark ? "#444" : "#ddd");
                      return (
                        <div key={step.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                          {i > 0 && (
                            <div style={{
                              position: "absolute", top: 16, right: "50%", left: "-50%",
                              height: 3, background: i <= activeStep ? "#e62e04" : (dark ? "#333" : "#e0e0e0"),
                              zIndex: 0,
                            }} />
                          )}
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: done ? "#e62e04" : (dark ? "#2a2a2a" : "#fff"),
                            border: `3px solid ${stepColor}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: current ? 16 : 13,
                            zIndex: 1, position: "relative",
                            boxShadow: current ? "0 0 0 4px rgba(230,46,4,0.18)" : "none",
                            transition: "all 0.3s",
                          }}>
                            {done ? (current ? step.icon : "✓") : <span style={{ color: dark ? "#555" : "#bbb", fontSize: 12 }}>○</span>}
                          </div>
                          <p style={{
                            fontSize: 10, fontWeight: current ? 700 : 500,
                            color: done ? (dark ? "#e8e8e8" : "#333") : muted,
                            textAlign: "center", marginTop: 6, lineHeight: 1.3,
                            maxWidth: 64,
                          }}>{step.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cancelled badge */}
              {(isCancelled || isRefunded) && (() => {
                const st = STATUS_COLORS[order.status];
                return (
                  <div style={{
                    marginBottom: 24, padding: "14px 18px",
                    background: st.bg, border: `1px solid ${st.border}`,
                    borderRadius: 12, display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <span style={{ fontSize: 22 }}>{isCancelled ? "❌" : "💸"}</span>
                    <div>
                      <p style={{ fontWeight: 700, color: st.color, margin: 0 }}>
                        Enquiry {isCancelled ? "Cancelled" : "Refunded"}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Items */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 12 }}>
                  Products Enquired ({(order.items || []).length})
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(order.items || []).map((item, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 14, alignItems: "center",
                      background: dark ? "#242424" : "#f8f8f8",
                      borderRadius: 12, padding: "12px 14px",
                      border: `1px solid ${border}`,
                    }}>
                      <Link to={`/productDetail?id=${item.productId}`} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                        <img
                          src={resolveImageUrl(item.imageUrl || item.productImage) || "https://placehold.co/56x56/f0f0f0/aaa?text=📦"}
                          alt={item.productName}
                          onError={e => { e.target.src = "https://placehold.co/56x56/f0f0f0/aaa?text=📦"; }}
                          style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 10, border: `1px solid ${border}`, display: "block" }}
                        />
                      </Link>
                      <div style={{ flex: 1 }}>
                        <Link
                          to={`/productDetail?id=${item.productId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontWeight: 700, fontSize: 14, color: text, textDecoration: "none" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#e62e04"}
                          onMouseLeave={e => e.currentTarget.style.color = text}
                        >{item.productName}</Link>
                        <p style={{ color: muted, fontSize: 12, margin: "3px 0 0" }}>
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* end items */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const { dark } = useTheme();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [page, setPage]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelling, setCancelling] = useState(null);
  const [detailOrderId, setDetailOrderId] = useState(null); // modal
  const [confirmCancelId, setConfirmCancelId] = useState(null); // premium confirm modal

  const bg        = dark ? "#111"    : "#f4f4f4";
  const cardBg    = dark ? "#1a1a1a" : "#fff";
  const border    = dark ? "#2a2a2a" : "#eee";
  const textColor = dark ? "#e8e8e8" : "#222";
  const mutedColor = dark ? "#888"   : "#888";

  useEffect(() => {
    if (!isLoggedIn) { navigate("/login", { state: { from: "/orders" } }); return; }
    fetchOrders();
  }, [isLoggedIn, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await ordersApi.getMyOrders({ page, size: 10 });
      setOrders(data?.content || data?.items || (Array.isArray(data) ? data : []));
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    setConfirmCancelId(id); // open premium modal instead of window.confirm
  };

  const confirmCancel = async () => {
    const id = confirmCancelId;
    setConfirmCancelId(null);
    setCancelling(id);
    try {
      await ordersApi.cancelOrder(id);
      // Optimistic update — only change the specific order, no full refetch
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "CANCELLED" } : o));
    } catch (err) {
      // On failure — revert by refetching
      fetchOrders();
    } finally { setCancelling(null); }
  };

  if (!isLoggedIn) return null;

  return (
    <div style={{ background: bg, minHeight: "100vh", color: textColor, transition: "background 0.4s" }}>
      <SharedHeader activePage="/orders" />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px clamp(16px,4vw,32px) 80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>My Enquiries</h1>
            <p style={{ color: mutedColor }}>Track and manage your enquiries</p>
          </div>
          <Link to="/profile" style={{ color: "#e62e04", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>← Back to Profile</Link>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: mutedColor }}>Loading orders…</div>
        )}

        {error && (
          <div style={{ padding: 20, background: "#fee", color: "#c00", borderRadius: 12, border: "1px solid #fcc" }}>{error}</div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div style={{ textAlign: "center", padding: 80, color: mutedColor }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No enquiries yet</p>
            <p style={{ fontSize: 14, marginBottom: 24 }}>When you place an enquiry it will appear here</p>
            <Link to="/products" style={{ padding: "12px 28px", background: "#e62e04", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 700 }}>Browse Products</Link>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map(order => {
            const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;
            return (
              <div key={order.id} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 16 }}>
                  <div>
                    <p style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>Enquiry Code</p>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#e62e04" }}>{order.orderNumber || `#${order.id}`}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>Date</p>
                    <p style={{ fontWeight: 600 }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: mutedColor, marginBottom: 4 }}>Organization</p>
                    <p style={{ fontWeight: 600 }}>{order.enquiryOrganization || "—"}</p>
                  </div>
                  <div>
                    <span style={{
                      padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                      background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`,
                    }}>{order.status}</span>
                  </div>
                </div>

                {/* Items preview */}
                {(order.items || order.orderItems || []).length > 0 && (
                  <div style={{ borderTop: `1px solid ${border}`, paddingTop: 16, marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                    {(order.items || order.orderItems).map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Link to={`/productDetail?id=${item.productId}`} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, display: "block" }}>
                          <img
                            src={resolveImageUrl(item.imageUrl || item.productImage) || "https://placehold.co/48x48/f0f0f0/aaa?text=📦"}
                            alt={item.productName}
                            style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: `1px solid ${border}`, display: "block" }}
                            onError={e => { e.target.src = "https://placehold.co/48x48/f0f0f0/aaa?text=📦"; }}
                          />
                        </Link>
                        <div style={{ flex: 1 }}>
                          <Link
                            to={`/productDetail?id=${item.productId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontWeight: 600, fontSize: 14, color: "inherit", textDecoration: "none" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#e62e04"}
                            onMouseLeave={e => e.currentTarget.style.color = "inherit"}
                          >{item.productName}</Link>
                          <p style={{ color: mutedColor, fontSize: 12, margin: "2px 0 0" }}>Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="order-card-actions" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {/* View Details — always visible */}
                  <button
                    onClick={() => setDetailOrderId(order.id)}
                    style={{
                      padding: "8px 18px", borderRadius: 8,
                      background: "#e62e04", border: "none",
                      color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer",
                    }}
                  >View Details</button>

                  {/* Cancel — only for PENDING / CONFIRMED */}
                  {(order.status === "PENDING" || order.status === "CONFIRMED") && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={cancelling === order.id}
                      style={{
                        padding: "8px 18px", borderRadius: 8, background: "transparent",
                        border: "1px solid #e62e04", color: "#e62e04",
                        fontWeight: 600, fontSize: 13, cursor: "pointer",
                      }}
                    >{cancelling === order.id ? "Cancelling…" : "Cancel Order"}</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i)} style={{
                width: 36, height: 36, borderRadius: 8, border: `1px solid ${border}`,
                background: i === page ? "#e62e04" : cardBg,
                color: i === page ? "#fff" : textColor,
                fontWeight: 600, cursor: "pointer",
              }}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {detailOrderId && (
        <OrderDetailModal
          orderId={detailOrderId}
          dark={dark}
          onClose={() => setDetailOrderId(null)}
        />
      )}

      {/* Premium Cancel Confirm Modal */}
      {confirmCancelId && (
        <div onClick={() => setConfirmCancelId(null)} style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          animation: "fadeIn 0.18s ease",
        }}>
          <style>{`
            @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
            @keyframes slideUp { from { opacity:0; transform:translateY(24px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
          `}</style>
          <div onClick={e => e.stopPropagation()} style={{
            background: dark ? "#1a1a1a" : "#fff",
            borderRadius: 20,
            padding: "36px 32px 28px",
            maxWidth: 400, width: "100%",
            boxShadow: "0 24px 64px rgba(0,0,0,0.28)",
            animation: "slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)",
            textAlign: "center",
            border: `1px solid ${dark ? "#2a2a2a" : "#f0f0f0"}`,
          }}>
            {/* Icon */}
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "linear-gradient(135deg, #fff0f0 0%, #fce4ec 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              border: "2px solid #ef9a9a",
              fontSize: 28,
            }}>🚫</div>

            <h3 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 800, color: dark ? "#eee" : "#1a1a1a" }}>
              Cancel Order?
            </h3>
            <p style={{ margin: "0 0 28px", fontSize: 14, color: dark ? "#999" : "#666", lineHeight: 1.6 }}>
              Are you sure you want to cancel this enquiry?<br/>
              <span style={{ color: "#e62e04", fontWeight: 600 }}>This action cannot be undone.</span>
            </p>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setConfirmCancelId(null)}
                style={{
                  flex: 1, padding: "12px", borderRadius: 10,
                  border: `1.5px solid ${dark ? "#333" : "#e0e0e0"}`,
                  background: "transparent",
                  color: dark ? "#ccc" : "#555",
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => e.target.style.background = dark ? "#2a2a2a" : "#f5f5f5"}
                onMouseLeave={e => e.target.style.background = "transparent"}
              >
                Keep Order
              </button>
              <button
                onClick={confirmCancel}
                style={{
                  flex: 1, padding: "12px", borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg, #e62e04 0%, #ff5722 100%)",
                  color: "#fff",
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(230,46,4,0.35)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => e.target.style.opacity = "0.9"}
                onMouseLeave={e => e.target.style.opacity = "1"}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
