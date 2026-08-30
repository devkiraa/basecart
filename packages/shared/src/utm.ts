/**
 * UTM Campaign & Traffic Source Attribution Helper
 * Captures query parameters (utm_source, utm_medium, utm_campaign, utm_term, utm_content)
 * and document.referrer, storing them in sessionStorage for signup & checkout attribution.
 */

export interface UtmParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
}

const UTM_STORAGE_KEY = "basecart_utm_params";

export function captureUtmParams(): UtmParams | null {
  if (typeof window === "undefined" || typeof document === "undefined") return null;

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const utmSource = searchParams.get("utm_source");
    const utmMedium = searchParams.get("utm_medium");
    const utmCampaign = searchParams.get("utm_campaign");
    const utmTerm = searchParams.get("utm_term");
    const utmContent = searchParams.get("utm_content");
    const referrer = document.referrer || undefined;

    if (utmSource || utmMedium || utmCampaign || utmTerm || utmContent || referrer) {
      const existing = getStoredUtmParams() || {};
      const params: UtmParams = {
        utmSource: utmSource || existing.utmSource,
        utmMedium: utmMedium || existing.utmMedium,
        utmCampaign: utmCampaign || existing.utmCampaign,
        utmTerm: utmTerm || existing.utmTerm,
        utmContent: utmContent || existing.utmContent,
        referrer: referrer || existing.referrer,
      };

      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(params));
      }
      return params;
    }
  } catch (e) {
    console.warn("Failed to capture UTM parameters:", e);
  }

  return getStoredUtmParams();
}

export function getStoredUtmParams(): UtmParams | null {
  if (typeof window === "undefined" || typeof sessionStorage === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {}
  return null;
}

export function buildCampaignUrl(baseUrl: string, params: UtmParams): string {
  if (!baseUrl) return "";
  try {
    const url = new URL(baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`);
    if (params.utmSource) url.searchParams.set("utm_source", params.utmSource);
    if (params.utmMedium) url.searchParams.set("utm_medium", params.utmMedium);
    if (params.utmCampaign) url.searchParams.set("utm_campaign", params.utmCampaign);
    if (params.utmTerm) url.searchParams.set("utm_term", params.utmTerm);
    if (params.utmContent) url.searchParams.set("utm_content", params.utmContent);
    return url.toString();
  } catch (e) {
    return baseUrl;
  }
}
