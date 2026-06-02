declare global {
  interface Window {
    google?: typeof google;
    __gmapsReady?: Promise<void>;
    __initGoogleMaps?: () => void;
  }
}

const BROWSER_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY ?? "";

export function getMapsConfigError(): string | null {
  if (!BROWSER_KEY) {
    return "Missing NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY in .env.local";
  }
  return null;
}

export function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  const configError = getMapsConfigError();
  if (configError) return Promise.reject(new Error(configError));

  if (window.__gmapsReady) return window.__gmapsReady;

  window.__gmapsReady = new Promise<void>((resolve, reject) => {
    const finish = async () => {
      try {
        await google.maps.importLibrary("places");
        resolve();
      } catch (err) {
        window.__gmapsReady = undefined;
        reject(err);
      }
    };

    if (window.google?.maps) {
      void finish();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="maps.googleapis.com/maps/api/js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => void finish(), { once: true });
      existing.addEventListener(
        "error",
        () => {
          window.__gmapsReady = undefined;
          reject(new Error("Failed to load Google Maps"));
        },
        { once: true },
      );
      return;
    }

    window.__initGoogleMaps = () => {
      void finish();
    };

    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${BROWSER_KEY}&libraries=places&loading=async&callback=__initGoogleMaps`;
    s.async = true;
    s.onerror = () => {
      window.__gmapsReady = undefined;
      reject(new Error("Failed to load Google Maps"));
    };
    document.head.appendChild(s);
  });

  return window.__gmapsReady;
}
