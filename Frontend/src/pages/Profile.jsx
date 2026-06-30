import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme, SharedHeader, Footer, useAuth } from "../components";
import { userApi, ordersApi, addressApi, resolveImageUrl, wishlistApi, requestsApi } from "../services/api";
import { validatePhone } from "../services/phoneValidation";
import { useCart } from "../components/CartContext";

/* ─── Constants ─────────────────────────────────────────────────────────── */
const STATUS_COLORS = {
  PENDING:   { bg: "rgba(245,166,35,0.12)",  color: "#f5a623" },
  CONFIRMED: { bg: "rgba(46,125,50,0.12)",   color: "#2e7d32" },
  SHIPPED:   { bg: "rgba(21,101,192,0.12)",  color: "#1565c0" },
  DELIVERED: { bg: "rgba(27,94,32,0.12)",    color: "#1b5e20" },
  CANCELLED: { bg: "rgba(198,40,40,0.12)",   color: "#c62828" },
};

const BLANK_ADDR = {
  fullName: "", phone: "", addressLine1: "", addressLine2: "",
  city: "", state: "", country: "India", postalCode: "",
  isDefault: false, addressType: "HOME",
};

const NAV_ITEMS = [
  { id: "orders",     label: "My Enquiries",    icon: "🚚" },
  { id: "addresses",  label: "Your addresses",  icon: "📍" },
  { id: "security",   label: "Login & security",icon: "🔒" },
  { id: "savedItems", label: "Saved items",     icon: "❤️"  },
  { id: "chats",      label: "My Requests",     icon: "💬"  },
];

const ADDR_FIELDS = [
  { key: "fullName",     label: "Full Name *",          placeholder: "Prabhat Kumar",         full: false },
  { key: "phone",        label: "Phone *",              placeholder: "+91 98765 43210",        full: false },
  { key: "addressLine1", label: "Address Line 1 *",     placeholder: "House / Flat / Street",  full: true  },
  { key: "addressLine2", label: "Address Line 2",       placeholder: "Area / Landmark",        full: true  },
  { key: "city",         label: "City *",               placeholder: "Varanasi",               full: false },
  { key: "state",        label: "State *",              placeholder: "Uttar Pradesh",          full: false },
  { key: "country",      label: "Country *",            placeholder: "India",                  full: false },
  { key: "postalCode",   label: "PIN / Postal Code *",  placeholder: "221001",                 full: false },
];

const RED = "#e62e04";

/* ─── Section helper (outside Profile so it never re-creates) ────────────── */
function SectionTitle({ title, action, textColor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: textColor }}>{title}</h2>
      {action}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ORDERS SECTION
══════════════════════════════════════════════════════════════════════════ */
function OrdersSection({ orders, ordersLoading, dark, textColor, mutedColor, cardBg, border }) {
  return (
    <div>
      <SectionTitle
        title="My Enquiries"
        textColor={textColor}
        action={
          <Link to="/orders" style={{
            padding: "8px 18px", borderRadius: 8, background: RED, color: "#fff",
            textDecoration: "none", fontWeight: 700, fontSize: 13,
          }}>View All →</Link>
        }
      />
      {ordersLoading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: mutedColor }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
          <p style={{ fontSize: 14 }}>Loading enquiries…</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: mutedColor }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: textColor }}>No enquiries yet</p>
          <p style={{ fontSize: 14, marginBottom: 20 }}>Browse our products and submit your first enquiry.</p>
          <Link to="/products" style={{
            padding: "10px 24px", borderRadius: 8, background: RED,
            color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 14,
          }}>Browse Products</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map(order => {
            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;
            const orderItems = order.items || order.orderItems || [];
            return (
              <div key={order.id} style={{
                borderRadius: 12, border: `1px solid ${border}`,
                background: cardBg, overflow: "hidden",
                boxShadow: dark ? "0 1px 3px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.06)",
              }}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 800, color: textColor, margin: "0 0 4px" }}>
                        Order #{order.orderNumber}
                      </p>
                      <p style={{ fontSize: 12, color: mutedColor, margin: 0 }}>
                        {orderItems.length} item{orderItems.length !== 1 ? "s" : ""}
                        {order.createdAt ? ` · ${new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : ""}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "4px 12px",
                        borderRadius: 20, background: sc.bg, color: sc.color,
                        textTransform: "uppercase", letterSpacing: "0.5px",
                      }}>{order.status}</span>
                      <Link to="/orders" style={{
                        fontSize: 12, fontWeight: 700, color: RED, textDecoration: "none",
                        padding: "4px 12px", borderRadius: 8, border: `1px solid ${border}`,
                      }}>Details</Link>
                    </div>
                  </div>
                </div>
                <div style={{ padding: "12px 20px", borderBottom: orderItems.length > 0 ? `1px solid ${border}` : "none",
                  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "8px 16px" }}>
                  {[
                    ["Status",       order.status || "—"],
                    ["Organisation", order.enquiryOrganization || "—"],
                    ["Total",        order.totalAmount ? `₹${order.totalAmount.toLocaleString("en-IN")}` : "—"],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p style={{ fontSize: 11, color: mutedColor, margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: label === "Status" ? sc.color : textColor, margin: 0 }}>{val}</p>
                    </div>
                  ))}
                </div>
                {orderItems.length > 0 && (
                  <div style={{ padding: "14px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                    {orderItems.map((item, i) => (
                      <Link key={i} to={`/productDetail?id=${item.productId}`} target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none",
                          padding: "8px 10px", borderRadius: 10,
                          border: `1px solid ${border}`, background: dark ? "#111" : "#fafafa" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = RED}
                        onMouseLeave={e => e.currentTarget.style.borderColor = border}
                      >
                        <img
                          src={resolveImageUrl(item.imageUrl || item.productImage) || "https://placehold.co/52x52/f0f0f0/aaa?text=📦"}
                          alt={item.productName}
                          style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                          onError={e => { e.target.src = "https://placehold.co/52x52/f0f0f0/aaa?text=📦"; }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: textColor, margin: "0 0 3px",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.productName}</p>
                          <p style={{ fontSize: 12, color: mutedColor, margin: 0 }}>Qty: {item.quantity}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ADDRESSES SECTION
══════════════════════════════════════════════════════════════════════════ */
function AddressesSection({
  dark, textColor, mutedColor, cardBg, border, inputBg,
  addresses, addrLoading, addrForm, editAddrId, addrSaving, addrMsg,
  handleAddrFormChange, handleAddrSave, openNewAddr, openEditAddr, closeAddrForm,
  handleAddrDelete, handleSetDefault,
}) {
  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: `1.5px solid ${border}`, background: inputBg,
    color: textColor, fontSize: 14, outline: "none",
    transition: "border-color 0.2s", fontFamily: "inherit",
    boxSizing: "border-box",
  };

  return (
    <div>
      <SectionTitle
        title="Your Addresses"
        textColor={textColor}
        action={editAddrId === null ? (
          <button onClick={openNewAddr} style={{
            padding: "8px 18px", borderRadius: 8, background: RED,
            color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>+ Add Address</button>
        ) : null}
      />

      {/* Form */}
      {editAddrId !== null && (
        <div style={{
          padding: 24, borderRadius: 12, border: `1.5px solid ${RED}`,
          background: dark ? "#110a08" : "#fff8f6", marginBottom: 24,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: textColor, marginBottom: 20 }}>
            {editAddrId === 0 ? "Add New Address" : "Edit Address"}
          </h3>
          {addrMsg && (
            <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16,
              background: "#fee", color: "#c00", border: "1px solid #fcc", fontSize: 13, fontWeight: 600 }}>
              ⚠ {addrMsg}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {ADDR_FIELDS.map(f => (
              <div key={f.key} style={f.full ? { gridColumn: "1/-1" } : {}}>
                <label style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: mutedColor }}>{f.label}</label>
                <input
                  value={addrForm[f.key]}
                  placeholder={f.placeholder}
                  name={f.key}
                  onChange={handleAddrFormChange}
                  onFocus={e => e.target.style.borderColor = RED}
                  onBlur={e => e.target.style.borderColor = border}
                  style={inputStyle}
                />
              </div>
            ))}
            <div>
              <label style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: mutedColor }}>Type</label>
              <select
                value={addrForm.addressType}
                name="addressType"
                onChange={handleAddrFormChange}
                onFocus={e => e.target.style.borderColor = RED}
                onBlur={e => e.target.style.borderColor = border}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {["HOME", "WORK", "SITE", "OTHER"].map(t => (
                  <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 22 }}>
              <input type="checkbox" id="isDefault" checked={addrForm.isDefault}
                name="isDefault"
                onChange={handleAddrFormChange}
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: RED }} />
              <label htmlFor="isDefault" style={{ fontSize: 13, color: textColor, cursor: "pointer", fontWeight: 600 }}>
                Set as default address
              </label>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={handleAddrSave} disabled={addrSaving} style={{
              padding: "11px 24px", background: RED, color: "#fff", border: "none",
              borderRadius: 9, fontWeight: 700, cursor: addrSaving ? "not-allowed" : "pointer",
              opacity: addrSaving ? 0.65 : 1, fontSize: 14,
            }}>{addrSaving ? "Saving…" : editAddrId === 0 ? "Save Address" : "Update Address"}</button>
            <button onClick={closeAddrForm} style={{
              padding: "11px 20px", background: "none", border: `1px solid ${border}`,
              color: mutedColor, borderRadius: 9, cursor: "pointer", fontWeight: 600,
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      {addrLoading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: mutedColor }}>Loading addresses…</div>
      ) : addresses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: mutedColor }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📍</div>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: textColor }}>No saved addresses</p>
          <p style={{ fontSize: 14, marginBottom: 20 }}>Add your first delivery address.</p>
          {editAddrId === null && (
            <button onClick={openNewAddr} style={{
              padding: "10px 24px", borderRadius: 8, background: RED,
              color: "#fff", border: "none", fontWeight: 700, cursor: "pointer",
            }}>+ Add Address</button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {addresses.map(addr => (
            <div key={addr.id} style={{
              padding: "18px 20px", borderRadius: 12, border: `1px solid ${border}`,
              background: cardBg, display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", gap: 16, flexWrap: "wrap",
              boxShadow: dark ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: textColor }}>{addr.fullName}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20,
                    background: dark ? "#222" : "#f0f0f0", color: mutedColor, textTransform: "uppercase" }}>
                    {addr.addressType}
                  </span>
                  {addr.isDefault && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20,
                      background: "rgba(230,46,4,0.1)", color: RED }}>Default</span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: mutedColor, margin: "0 0 2px" }}>
                  {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                </p>
                <p style={{ fontSize: 13, color: mutedColor, margin: "0 0 4px" }}>
                  {[addr.city, addr.state, addr.country, addr.postalCode].filter(Boolean).join(", ")}
                </p>
                <p style={{ fontSize: 12, color: mutedColor, margin: 0 }}>📞 {addr.phone}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr.id)} style={{
                    fontSize: 12, padding: "5px 12px", borderRadius: 6, cursor: "pointer",
                    background: "none", border: `1px solid ${border}`, color: mutedColor, fontWeight: 600,
                  }}>Set Default</button>
                )}
                <button onClick={() => openEditAddr(addr)} style={{
                  fontSize: 12, padding: "5px 12px", borderRadius: 6, cursor: "pointer",
                  background: "none", border: `1px solid ${border}`, color: textColor, fontWeight: 600,
                }}>Edit</button>
                <button onClick={() => handleAddrDelete(addr.id)} style={{
                  fontSize: 12, padding: "5px 12px", borderRadius: 6, cursor: "pointer",
                  background: "none", border: "1px solid #fcc", color: "#c00", fontWeight: 600,
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SECURITY SECTION
══════════════════════════════════════════════════════════════════════════ */
function SecuritySection({
  dark, textColor, mutedColor, cardBg, border, inputBg,
  profile, editMode, setEditMode,
  form, handleFormChange,
  pwForm, handlePwFormChange,
  loading, handleProfileSave, handlePasswordChange,
}) {
  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: `1.5px solid ${border}`, background: inputBg,
    color: textColor, fontSize: 14, outline: "none",
    transition: "border-color 0.2s", fontFamily: "inherit",
    boxSizing: "border-box",
  };

  return (
    <div>
      <SectionTitle title="Login & Security" textColor={textColor} />

      {/* Profile info card */}
      <div style={{ borderRadius: 12, border: `1px solid ${border}`, background: cardBg,
        overflow: "hidden", marginBottom: 20,
        boxShadow: dark ? "0 1px 3px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: textColor }}>Profile Information</h3>
          {!editMode && (
            <button onClick={() => setEditMode(true)} style={{
              padding: "6px 16px", borderRadius: 8, background: "transparent",
              border: `1px solid ${RED}`, color: RED, fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>Edit</button>
          )}
        </div>
        <div style={{ padding: "20px" }}>
          {profile && (editMode ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[["First Name", "firstName"], ["Last Name", "lastName"]].map(([label, key]) => (
                  <div key={key}>
                    <label style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: mutedColor }}>{label}</label>
                    <input
                      style={inputStyle}
                      value={form[key]}
                      name={key}
                      onChange={handleFormChange}
                      onFocus={e => e.target.style.borderColor = RED}
                      onBlur={e => e.target.style.borderColor = border}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: mutedColor }}>Phone</label>
                <input
                  style={inputStyle}
                  value={form.phone}
                  name="phone"
                  onChange={handleFormChange}
                  onFocus={e => e.target.style.borderColor = RED}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleProfileSave} disabled={loading} style={{
                  padding: "10px 22px", borderRadius: 8, background: RED, color: "#fff",
                  border: "none", fontWeight: 700, cursor: "pointer",
                }}>{loading ? "Saving…" : "Save Changes"}</button>
                <button onClick={() => setEditMode(false)} style={{
                  padding: "10px 22px", borderRadius: 8, background: "transparent",
                  border: `1px solid ${border}`, color: textColor, fontWeight: 600, cursor: "pointer",
                }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>
              {[
                ["Full Name", `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "—"],
                ["Email",     profile.email],
                ["Phone",     profile.phone || "—"],
                ["Role",      profile.role  || "USER"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p style={{ fontSize: 11, color: mutedColor, marginBottom: 3, fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</p>
                  <p style={{ fontWeight: 700, margin: 0, color: textColor }}>{value}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Change Password card */}
      <div style={{ borderRadius: 12, border: `1px solid ${border}`, background: cardBg,
        overflow: "hidden", boxShadow: dark ? "0 1px 3px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${border}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: textColor }}>Change Password</h3>
        </div>
        <div style={{ padding: "20px" }}>
          <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Current Password",    key: "currentPassword" },
              { label: "New Password",         key: "newPassword"     },
              { label: "Confirm New Password", key: "confirm"         },
            ].map(({ label, key }) => (
              <div key={key}>
                <label style={{ display: "block", marginBottom: 5, fontSize: 12, fontWeight: 600, color: mutedColor }}>{label}</label>
                <input
                  type="password"
                  style={inputStyle}
                  value={pwForm[key]}
                  name={key}
                  onChange={handlePwFormChange}
                  onFocus={e => e.target.style.borderColor = RED}
                  onBlur={e => e.target.style.borderColor = border}
                  placeholder="••••••••"
                />
              </div>
            ))}
            <button type="submit" disabled={loading} style={{
              padding: "11px 22px", borderRadius: 8, background: RED, color: "#fff",
              border: "none", fontWeight: 700, cursor: "pointer", alignSelf: "flex-start",
            }}>{loading ? "Updating…" : "Update Password"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SAVED ITEMS SECTION
══════════════════════════════════════════════════════════════════════════ */
function SavedItemsSection({ dark, textColor, mutedColor, border, showMsg }) {
  const [wItems, setWItems]       = useState([]);
  const [wLoading, setWLoading]   = useState(true);
  const [wError, setWError]       = useState("");
  const [wRemoving, setWRemoving] = useState(null);
  const [wAddedIds, setWAddedIds] = useState(new Set());
  const { addItem } = useCart();

  const PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160'%3E%3Crect width='200' height='160' fill='%23f0f0f0'/%3E%3Ctext x='100' y='80' font-size='13' fill='%23aaa' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E`;

  useEffect(() => {
    setWLoading(true);
    wishlistApi.getWishlist()
      .then(data => setWItems(data?.content || (Array.isArray(data) ? data : [])))
      .catch(e => setWError(e.message || "Failed to load saved items"))
      .finally(() => setWLoading(false));
  }, []);

  const handleWRemove = async (productId) => {
    setWRemoving(productId);
    try {
      await wishlistApi.toggle(productId);
      setWItems(prev => prev.filter(i => i.productId !== productId));
    } catch (e) { showMsg(e.message || "Could not remove item", "error"); }
    finally { setWRemoving(null); }
  };

  const handleWAddToCart = (item) => {
    addItem({ id: item.productId, name: item.productName,
      img: resolveImageUrl(item.imageUrl), price: item.price ?? 0, category: "" });
    setWAddedIds(prev => new Set([...prev, item.productId]));
    setTimeout(() => setWAddedIds(prev => { const n = new Set(prev); n.delete(item.productId); return n; }), 2000);
  };

  return (
    <div>
      <SectionTitle
        title="Saved Items"
        textColor={textColor}
        action={
          <Link to="/wishlist" style={{
            padding: "8px 18px", borderRadius: 8, background: RED, color: "#fff",
            textDecoration: "none", fontWeight: 700, fontSize: 13,
          }}>View All →</Link>
        }
      />
      {wLoading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 14 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${border}`, background: dark ? "#111" : "#f9f9f9" }}>
              <div style={{ aspectRatio: "4/3", background: dark ? "#222" : "#ebebeb" }} />
              <div style={{ padding: "10px 12px" }}>
                <div style={{ height: 12, borderRadius: 6, background: dark ? "#222" : "#ebebeb", marginBottom: 8 }} />
                <div style={{ height: 12, borderRadius: 6, background: dark ? "#222" : "#ebebeb", width: "50%", marginBottom: 10 }} />
                <div style={{ height: 28, borderRadius: 7, background: dark ? "#222" : "#ebebeb", marginBottom: 6 }} />
                <div style={{ height: 28, borderRadius: 7, background: dark ? "#222" : "#ebebeb", marginBottom: 6 }} />
                <div style={{ height: 26, borderRadius: 7, background: dark ? "#222" : "#ebebeb" }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {!wLoading && wError && (
        <div style={{ padding: "12px 16px", background: "#fee", color: "#c00", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          ⚠ {wError}
        </div>
      )}
      {!wLoading && !wError && wItems.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 0", color: mutedColor }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🤍</div>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: textColor }}>No saved items yet</p>
          <p style={{ fontSize: 14, marginBottom: 20 }}>Browse products and click the heart icon to save them here.</p>
          <Link to="/products" style={{
            padding: "10px 24px", borderRadius: 8, background: RED,
            color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 14,
          }}>Browse Products</Link>
        </div>
      )}
      {!wLoading && !wError && wItems.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px,1fr))", gap: 14 }}>
          {wItems.map(item => {
            const rawImg = resolveImageUrl(item.imageUrl);
            const isAdded = wAddedIds.has(item.productId);
            const isRem = wRemoving === item.productId;
            return (
              <div key={item.id || item.productId} style={{
                background: dark ? "#111" : "#fafafa",
                border: `1px solid ${border}`, borderRadius: 12, overflow: "hidden",
                display: "flex", flexDirection: "column",
                transition: "transform 0.18s, box-shadow 0.18s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(230,46,4,0.13)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ position: "relative", aspectRatio: "4/3", background: dark ? "#1a1a1a" : "#f0f0f0", overflow: "hidden" }}>
                  <img
                    src={rawImg || PLACEHOLDER}
                    alt={item.productName}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={e => { if (e.target.src !== PLACEHOLDER) e.target.src = PLACEHOLDER; }}
                  />
                  <button onClick={() => handleWRemove(item.productId)} disabled={isRem}
                    title="Remove from wishlist"
                    style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30,
                      borderRadius: "50%", background: "rgba(255,255,255,0.92)",
                      border: "none", cursor: isRem ? "not-allowed" : "pointer", fontSize: 15,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "all 0.18s",
                      opacity: isRem ? 0.5 : 1 }}
                    onMouseEnter={e => { e.currentTarget.style.background = RED; e.currentTarget.style.transform = "scale(1.12)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.92)"; e.currentTarget.style.transform = "scale(1)"; }}>
                    {isRem ? "…" : "❤️"}
                  </button>
                </div>
                <div style={{ padding: "10px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: textColor, margin: 0,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4 }}>
                    {item.productName}
                  </p>
                  {item.price != null && (
                    <p style={{ color: RED, fontWeight: 800, fontSize: 14, margin: 0 }}>
                      ₹{Number(item.price).toLocaleString("en-IN")}
                    </p>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: "auto" }}>
                    <Link to={`/productDetail?id=${item.productId}`}
                      style={{ display: "block", textAlign: "center", padding: "7px 4px", borderRadius: 7,
                        fontSize: 12, fontWeight: 700, color: RED,
                        border: `1.5px solid ${RED}`, textDecoration: "none", transition: "all 0.18s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = RED; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = RED; }}>
                      👁 View
                    </Link>
                    <button onClick={() => handleWAddToCart(item)}
                      style={{ padding: "7px 4px", borderRadius: 7, border: "none",
                        background: isAdded ? "#16a34a" : RED,
                        color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "background 0.18s" }}>
                      {isAdded ? "✓ Added!" : "🛒 Add to Cart"}
                    </button>
                    <button onClick={() => handleWRemove(item.productId)} disabled={isRem}
                      style={{ padding: "6px 4px", borderRadius: 7, border: `1px solid ${border}`,
                        background: "transparent", color: mutedColor,
                        fontWeight: 600, fontSize: 11.5, cursor: isRem ? "not-allowed" : "pointer",
                        transition: "all 0.18s", opacity: isRem ? 0.5 : 1 }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#c00"; e.currentTarget.style.color = "#c00"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = mutedColor; }}>
                      {isRem ? "Removing…" : "🗑 Remove"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   CHATS SECTION
══════════════════════════════════════════════════════════════════════════ */
function ChatsSection({ dark, textColor }) {
  const [myRequests, setMyRequests] = useState([]);
  const [loadingReq, setLoadingReq] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [reqError, setReqError] = useState("");

  const cardBg = dark ? "#1a1a1a" : "#fff";
  const border  = dark ? "#2a2a2a" : "#ebebeb";
  const subTxt  = dark ? "#888"    : "#666";
  const reqTxt  = dark ? "#ddd"    : "#222";

  const STATUS_STYLE = {
    PENDING:   { bg: "rgba(245,166,35,0.12)",  color: "#f5a623" },
    REPLIED:   { bg: "rgba(46,125,50,0.12)",   color: "#2e7d32" },
    DISCARDED: { bg: "rgba(198,40,40,0.12)",   color: "#c62828" },
  };
  const TYPE_STYLE = {
    AGENT:   { bg: "rgba(33,150,243,0.12)", color: "#1565c0", label: "Agent Request" },
    CONTACT: { bg: "rgba(76,175,80,0.12)",  color: "#2e7d32", label: "Contact Request" },
  };

  useEffect(() => {
    setLoadingReq(true);
    setReqError("");
    requestsApi.getMyRequests()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.content ?? []);
        setMyRequests(list);
        if (list.length > 0) setSelectedReq(list[0]);
      })
      .catch(err => {
        console.error("[ChatsSection] Failed to load requests:", err);
        setReqError("Could not load your requests. Please make sure you are logged in and try again.");
      })
      .finally(() => setLoadingReq(false));
  }, []);

  const fmtDate = (d) => d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

  if (loadingReq) return <div style={{ padding: 40, textAlign: "center", color: subTxt }}>Loading your requests…</div>;
  if (reqError) return (
    <div style={{ padding: "40px 0", textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
      <p style={{ color: RED, fontSize: 14 }}>{reqError}</p>
    </div>
  );

  return (
    <div>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: textColor, marginBottom: 20 }}>My Requests & Replies</h3>
      {myRequests.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: subTxt }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
          <p style={{ fontSize: 15 }}>You haven't submitted any requests yet.</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Submit an enquiry from the Contact page or Register as Agent from the homepage.</p>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: "0 0 340px", display: "flex", flexDirection: "column", gap: 10 }}>
            {myRequests.map(r => (
              <div key={r.id} onClick={() => setSelectedReq(r)}
                style={{ padding: "14px 16px", borderRadius: 10, background: cardBg, border: `1.5px solid ${selectedReq?.id === r.id ? RED : border}`, cursor: "pointer", transition: "border-color 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: TYPE_STYLE[r.type]?.bg, color: TYPE_STYLE[r.type]?.color }}>{TYPE_STYLE[r.type]?.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: STATUS_STYLE[r.status]?.bg, color: STATUS_STYLE[r.status]?.color }}>{r.status}</span>
                </div>
                {r.product  && <p style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 600, color: reqTxt }}>Product: {r.product}</p>}
                {r.shopName && <p style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 600, color: reqTxt }}>Shop: {r.shopName}</p>}
                <p style={{ margin: "4px 0 0", fontSize: 12, color: subTxt }}>{fmtDate(r.createdAt)}</p>
                {r.status === "REPLIED" && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#2e7d32", fontWeight: 700 }}>✉ Admin replied</p>}
              </div>
            ))}
          </div>
          {selectedReq && (
            <div style={{ flex: 1, minWidth: 280, background: cardBg, borderRadius: 12, border: `1px solid ${border}`, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: textColor }}>{TYPE_STYLE[selectedReq.type]?.label}</h4>
                <span style={{ fontSize: 12, color: subTxt }}>{fmtDate(selectedReq.createdAt)}</span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: subTxt, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.8px" }}>Your Message</p>
                <div style={{ background: dark ? "#111" : "#f3f4f6", borderRadius: "12px 12px 12px 0", padding: "12px 16px" }}>
                  {selectedReq.message  && <p style={{ margin: 0, fontSize: 14, color: reqTxt, lineHeight: 1.7 }}>{selectedReq.message}</p>}
                  {selectedReq.product  && <p style={{ margin: "4px 0 0", fontSize: 13, color: reqTxt }}><strong>Product:</strong> {selectedReq.product} {selectedReq.quantity ? `(Qty: ${selectedReq.quantity})` : ""}</p>}
                  {selectedReq.country  && <p style={{ margin: "4px 0 0", fontSize: 13, color: reqTxt }}><strong>Location:</strong> {selectedReq.city ? `${selectedReq.city}, ` : ""}{selectedReq.country}</p>}
                  {selectedReq.shopName && <p style={{ margin: "4px 0 0", fontSize: 13, color: reqTxt }}><strong>Shop:</strong> {selectedReq.shopName}</p>}
                  {selectedReq.address  && <p style={{ margin: "4px 0 0", fontSize: 13, color: reqTxt }}><strong>Address:</strong> {selectedReq.address}</p>}
                </div>
              </div>
              {selectedReq.adminReply ? (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#2e7d32", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.8px" }}>YBM Team Reply</p>
                  <div style={{ background: dark ? "#0d1a0d" : "#e8f5e9", borderRadius: "12px 12px 0 12px", padding: "12px 16px" }}>
                    <p style={{ margin: 0, fontSize: 14, color: reqTxt, lineHeight: 1.7 }}>{selectedReq.adminReply}</p>
                    {selectedReq.repliedAt && <p style={{ margin: "6px 0 0", fontSize: 11, color: "#2e7d32" }}>Replied on {fmtDate(selectedReq.repliedAt)}</p>}
                  </div>
                </div>
              ) : (
                <div style={{ padding: "14px 16px", borderRadius: 10, background: dark ? "#111" : "#fffbf0", border: `1px solid ${dark ? "#2a2a00" : "#fde68a"}` }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#b45309" }}>⏳ Awaiting reply from the YBM team. We typically respond within 24 hours.</p>
                </div>
              )}
              {selectedReq.status === "DISCARDED" && (
                <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: dark ? "#1a0000" : "#fff5f5", border: `1px solid ${dark ? "#3a0000" : "#fecaca"}` }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#c62828" }}>This request was closed by the YBM team.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PROFILE COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function Profile() {
  const { dark } = useTheme();
  const { user, logout, isLoggedIn } = useAuth();
  const { openCart } = useCart();
  const navigate = useNavigate();

  /* ── State ───────────────────────────────────────────────────────────── */
  const [activeSection, setActiveSection] = useState("orders");
  const [profile,    setProfile]    = useState(null);
  const [editMode,   setEditMode]   = useState(false);
  const [form,       setForm]       = useState({ firstName: "", lastName: "", phone: "" });
  const [pwForm,     setPwForm]     = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [loading,    setLoading]    = useState(false);
  const [msg,        setMsg]        = useState({ text: "", type: "" });
  const [addresses,  setAddresses]  = useState([]);
  const [addrLoading,setAddrLoading]= useState(false);
  const [addrForm,   setAddrForm]   = useState(BLANK_ADDR);
  const [editAddrId, setEditAddrId] = useState(null);
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrMsg,    setAddrMsg]    = useState("");
  const [orders,     setOrders]     = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  /* ── Stable handlers ─────────────────────────────────────────────────── */
  const handleFormChange = useCallback(e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handlePwFormChange = useCallback(e => {
    const { name, value } = e.target;
    setPwForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleAddrFormChange = useCallback(e => {
    const { name, value, type, checked } = e.target;
    setAddrForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }, []);

  /* ── Theme tokens ────────────────────────────────────────────────────── */
  const bg        = dark ? "#0f0f0f"  : "#f5f5f7";
  const cardBg    = dark ? "#1a1a1a"  : "#ffffff";
  const sidebarBg = dark ? "#141414"  : "#ffffff";
  const border    = dark ? "#2a2a2a"  : "#e8e8e8";
  const textColor = dark ? "#e8e8e8"  : "#1a1a1a";
  const mutedColor= dark ? "#777"     : "#777";
  const inputBg   = dark ? "#0f0f0f"  : "#f9f9f9";
  const hoverBg   = dark ? "#222"     : "#f0f0f0";

  /* ── Data loading ────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!isLoggedIn) { navigate("/login", { state: { from: "/profile" } }); return; }
    userApi.getProfile().then(data => {
      setProfile(data);
      setForm({ firstName: data.firstName || "", lastName: data.lastName || "", phone: data.phone || "" });
    }).catch(() => {});
    loadAddresses();
    setOrdersLoading(true);
    ordersApi.getMyOrders({ page: 0, size: 10 })
      .then(data => {
        const list = data?.content || data?.items || (Array.isArray(data) ? data : []);
        setOrders(list);
      })
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, [isLoggedIn, navigate]);

  const loadAddresses = () => {
    setAddrLoading(true);
    addressApi.getAll()
      .then(data => setAddresses(Array.isArray(data) ? data : (data?.content || data?.items || [])))
      .catch(() => {})
      .finally(() => setAddrLoading(false));
  };

  const showMsg = useCallback((text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3500);
  }, []);

  /* ── Profile handlers ────────────────────────────────────────────────── */
  const handleProfileSave = useCallback(async () => {
    if (form.phone) {
      const phoneResult = validatePhone(form.phone);
      if (!phoneResult.valid) { showMsg(phoneResult.error, "error"); return; }
      form.phone = phoneResult.normalised;
    }
    try {
      setLoading(true);
      const updated = await userApi.updateProfile(form);
      setProfile(updated);
      setEditMode(false);
      showMsg("Profile updated successfully!");
    } catch (err) { showMsg(err.message || "Update failed", "error"); }
    finally { setLoading(false); }
  }, [form, showMsg]);

  const handlePasswordChange = useCallback(async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { showMsg("Passwords don't match", "error"); return; }
    try {
      setLoading(true);
      await userApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
      showMsg("Password changed successfully!");
    } catch (err) { showMsg(err.message || "Password change failed", "error"); }
    finally { setLoading(false); }
  }, [pwForm, showMsg]);

  /* ── Address handlers ────────────────────────────────────────────────── */
  const openNewAddr  = useCallback(() => { setAddrForm(BLANK_ADDR); setEditAddrId(0); setAddrMsg(""); }, []);
  const openEditAddr = useCallback((addr) => {
    setAddrForm({
      fullName: addr.fullName || "", phone: addr.phone || "",
      addressLine1: addr.addressLine1 || "", addressLine2: addr.addressLine2 || "",
      city: addr.city || "", state: addr.state || "",
      country: addr.country || "India", postalCode: addr.postalCode || "",
      isDefault: addr.isDefault || false, addressType: addr.addressType || "HOME",
    });
    setEditAddrId(addr.id); setAddrMsg("");
  }, []);
  const closeAddrForm = useCallback(() => { setEditAddrId(null); setAddrMsg(""); }, []);

  const validateAddr = (f) => {
    if (!f.fullName.trim())     return "Full name is required.";
    if (!f.phone.trim())        return "Phone number is required.";
    if (!/^[+]?[0-9]{7,15}$/.test(f.phone.trim())) return "Enter a valid phone number.";
    if (!f.addressLine1.trim()) return "Address line 1 is required.";
    if (!f.city.trim())         return "City is required.";
    if (!f.state.trim())        return "State is required.";
    if (!f.country.trim())      return "Country is required.";
    if (!f.postalCode.trim())   return "Postal / PIN code is required.";
    return null;
  };

  const handleAddrSave = useCallback(async () => {
    const err = validateAddr(addrForm);
    if (err) { setAddrMsg(err); return; }
    setAddrSaving(true); setAddrMsg("");
    try {
      const payload = { ...addrForm, phone: addrForm.phone.trim() };
      if (editAddrId === 0) await addressApi.create(payload);
      else                  await addressApi.update(editAddrId, payload);
      loadAddresses(); closeAddrForm();
      showMsg(editAddrId === 0 ? "Address added!" : "Address updated!");
    } catch (err) { setAddrMsg(err.message || "Failed to save address."); }
    finally { setAddrSaving(false); }
  }, [addrForm, editAddrId, closeAddrForm, showMsg]);

  const handleAddrDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await addressApi.delete(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      showMsg("Address deleted.");
    } catch (err) { showMsg(err.message || "Failed to delete address.", "error"); }
  }, [showMsg]);

  const handleSetDefault = useCallback(async (id) => {
    try { await addressApi.setDefault(id); loadAddresses(); showMsg("Default address updated."); }
    catch (err) { showMsg(err.message || "Failed to update default.", "error"); }
  }, [showMsg]);

  const handleLogout = async () => { await logout(); navigate("/"); };

  if (!isLoggedIn) return null;

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ background: bg, minHeight: "100vh", color: textColor, transition: "background 0.4s, color 0.4s" }}>
      <SharedHeader activePage="/profile" />

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "40px clamp(16px,4vw,32px) 80px" }}>

        {/* Page heading */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, margin: "0 0 4px", color: textColor }}>Your Account</h1>
          <p style={{ color: mutedColor, fontSize: 14, margin: 0 }}>
            {profile ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() : ""}{profile?.email ? `, Email: ${profile.email}` : ""}
          </p>
        </div>

        {/* Global message */}
        {msg.text && (
          <div style={{
            padding: "12px 20px", borderRadius: 8, marginBottom: 20,
            background: msg.type === "error" ? "#fee" : "#e6f9ee",
            color: msg.type === "error" ? "#c00" : "#1a7f3c",
            border: `1px solid ${msg.type === "error" ? "#fcc" : "#b5ead7"}`,
            fontWeight: 600, fontSize: 14,
          }}>{msg.text}</div>
        )}

        {/* Mobile bottom nav tabs */}
        <div className="profile-mobile-tabs" style={{ display: "none" }}>
          {NAV_ITEMS.map(item => {
            const active = activeSection === item.id;
            return (
              <button key={item.id} onClick={() => setActiveSection(item.id)} style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
                gap: 3, padding: "8px 4px", background: "transparent", border: "none",
                borderBottom: active ? `2px solid ${RED}` : "2px solid transparent",
                cursor: "pointer", color: active ? RED : mutedColor,
                fontWeight: active ? 700 : 500, fontSize: 10.5, transition: "all 0.2s",
              }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Two-column layout */}
        <div className="profile-two-col" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, alignItems: "start" }}>

          {/* Sidebar */}
          <div className="profile-sidebar-sticky" style={{
            background: sidebarBg, borderRadius: 16,
            border: `1px solid ${border}`, overflow: "hidden",
            boxShadow: dark ? "0 2px 8px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.06)",
            position: "sticky", top: 88,
          }}>
            <div style={{ padding: "8px 0" }}>
              {NAV_ITEMS.map(item => {
                const active = activeSection === item.id;
                return (
                  <button key={item.id} onClick={() => setActiveSection(item.id)} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 20px",
                    background: active ? (dark ? "rgba(230,46,4,0.12)" : "rgba(230,46,4,0.08)") : "transparent",
                    border: "none", cursor: "pointer", textAlign: "left",
                    color: active ? RED : textColor,
                    fontWeight: active ? 700 : 500, fontSize: 14,
                    borderLeft: active ? `3px solid ${RED}` : "3px solid transparent",
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = hoverBg; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ height: 1, background: border, margin: "0 16px" }} />
            <div style={{ padding: "8px 0" }}>
              <Link to="/orders" style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 20px", color: mutedColor, textDecoration: "none",
                fontWeight: 500, fontSize: 14, borderLeft: "3px solid transparent",
              }}
                onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              ><span>📦</span><span>All Enquiries</span></Link>
              <button onClick={openCart} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "12px 20px", background: "transparent",
                border: "none", cursor: "pointer", textAlign: "left",
                color: mutedColor, fontWeight: 500, fontSize: 14,
                borderLeft: "3px solid transparent",
              }}
                onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              ><span>🛒</span><span>My Cart</span></button>
              <button onClick={handleLogout} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "12px 20px", background: "transparent",
                border: "none", cursor: "pointer", textAlign: "left",
                color: "#c62828", fontWeight: 600, fontSize: 14,
                borderLeft: "3px solid transparent",
              }}
                onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              ><span>🚪</span><span>Log out</span></button>
            </div>
          </div>

          {/* Main content panel */}
          <div style={{
            background: sidebarBg, borderRadius: 16,
            border: `1px solid ${border}`, padding: "28px 28px",
            boxShadow: dark ? "0 2px 8px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.06)",
            minHeight: 400,
          }}>
            {activeSection === "orders" && (
              <OrdersSection
                orders={orders} ordersLoading={ordersLoading}
                dark={dark} textColor={textColor} mutedColor={mutedColor}
                cardBg={cardBg} border={border}
              />
            )}
            {activeSection === "addresses" && (
              <AddressesSection
                dark={dark} textColor={textColor} mutedColor={mutedColor}
                cardBg={cardBg} border={border} inputBg={inputBg}
                addresses={addresses} addrLoading={addrLoading}
                addrForm={addrForm} editAddrId={editAddrId}
                addrSaving={addrSaving} addrMsg={addrMsg}
                handleAddrFormChange={handleAddrFormChange}
                handleAddrSave={handleAddrSave}
                openNewAddr={openNewAddr} openEditAddr={openEditAddr}
                closeAddrForm={closeAddrForm}
                handleAddrDelete={handleAddrDelete}
                handleSetDefault={handleSetDefault}
              />
            )}
            {activeSection === "security" && (
              <SecuritySection
                dark={dark} textColor={textColor} mutedColor={mutedColor}
                cardBg={cardBg} border={border} inputBg={inputBg}
                profile={profile} editMode={editMode} setEditMode={setEditMode}
                form={form} handleFormChange={handleFormChange}
                pwForm={pwForm} handlePwFormChange={handlePwFormChange}
                loading={loading}
                handleProfileSave={handleProfileSave}
                handlePasswordChange={handlePasswordChange}
              />
            )}
            {activeSection === "savedItems" && (
              <SavedItemsSection
                dark={dark} textColor={textColor} mutedColor={mutedColor}
                border={border} showMsg={showMsg}
              />
            )}
            {activeSection === "chats" && (
              <ChatsSection dark={dark} textColor={textColor} />
            )}
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @media (max-width: 700px) {
          .profile-two-col { grid-template-columns: 1fr !important; }
          .profile-sidebar-sticky { display: none !important; }
          .profile-mobile-tabs {
            display: flex !important; overflow-x: auto; gap: 0;
            background: ${sidebarBg}; border: 1px solid ${border};
            border-radius: 12px; margin-bottom: 16px;
            scrollbar-width: none; -webkit-overflow-scrolling: touch;
          }
          .profile-mobile-tabs::-webkit-scrollbar { display: none; }
        }
        @media (max-width: 500px) {
          .profile-two-col > div:last-child { padding: 16px !important; }
        }
      `}</style>
    </div>
  );
}
