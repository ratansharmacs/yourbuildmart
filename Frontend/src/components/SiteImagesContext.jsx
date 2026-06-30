import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { siteImagesApi, resolveImageUrl } from "../services/api";

// ─── SiteImagesContext ──────────────────────────────────────────────────────
// Bulk-fetches every admin-managed website image (Home, About, header/footer
// logo, Quality Assurance, etc.) once on app load, and exposes a lookup hook
// so any page/component can resolve "page + slotKey" to the current URL —
// falling back to the hardcoded default if the slot hasn't loaded yet or the
// admin hasn't set anything custom.
//
// IMPORTANT: `loading` starts as false so children render immediately with
// fallback images. The admin-configured images replace them once the fetch
// resolves. This eliminates the 3-4s blank render that occurred when the app
// waited for this network call before showing any content.

const SiteImagesContext = createContext({ images: {}, loading: false, refresh: () => {} });

export function SiteImagesProvider({ children }) {
  const [images, setImages] = useState({});   // { page: { slotKey: url } }
  const [loading, setLoading] = useState(false); // Start false — don't block render

  const fetchImages = useCallback(() => {
    return siteImagesApi.getAll()
      .then(grouped => {
        if (!grouped) return;
        const flat = {};
        Object.entries(grouped).forEach(([page, slots]) => {
          flat[page] = {};
          slots.forEach(s => {
            // Resolve relative paths → absolute at storage time so ALL consumers
            // (whether they use useSiteImage hook or read images directly) get
            // a fully-qualified URL ready for <img src=...>
            flat[page][s.slotKey] = resolveImageUrl(s.imageUrl) || s.imageUrl;
          });
        });
        setImages(flat);
      })
      .catch(() => { /* keep whatever we already have / hardcoded fallbacks */ });
  }, []);

  useEffect(() => {
    // Fire-and-forget — don't set loading=true, don't block children.
    // Fallback images show instantly; admin images swap in when ready.
    fetchImages();
  }, [fetchImages]);

  // Safety net for cross-tab edits: re-sync when the user comes back to this tab
  useEffect(() => {
    const onFocus      = () => fetchImages();
    const onVisibility = () => { if (document.visibilityState === "visible") fetchImages(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchImages]);

  return (
    <SiteImagesContext.Provider value={{ images, loading, refresh: fetchImages }}>
      {children}
    </SiteImagesContext.Provider>
  );
}

/**
 * useSiteImage("about", "hero_image", "/fallback.jpg")
 * Returns the admin-configured URL for this slot, or `fallback` if the admin
 * hasn't set one yet / the slot doesn't exist / the request hasn't resolved.
 */
export function useSiteImage(page, slotKey, fallback) {
  const { images } = useContext(SiteImagesContext);
  const url = images?.[page]?.[slotKey];
  return url || resolveImageUrl(fallback) || fallback;
}

export function useSiteImages() {
  return useContext(SiteImagesContext);
}

export function useSiteImagesRefresh() {
  return useContext(SiteImagesContext).refresh;
}

export { SiteImagesContext };
