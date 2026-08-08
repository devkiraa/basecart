/**
 * Basecart URL Origin & Attribution Tracker
 * Traces deep-link routes, sectionId, unitId, lessonId, adaptiveId, UTM parameters, and referral origins.
 */

export interface OriginContext {
  originUrl?: string;
  sectionId?: string;
  unitId?: string;
  lessonId?: string;
  adaptiveId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
}

const STORAGE_KEY = "basecart_origin_context";

export function initUrlTracker(): OriginContext | null {
  if (typeof window === "undefined") return null;

  try {
    const fullUrl = window.location.href;
    const searchParams = new URLSearchParams(window.location.search);

    // Also check hash parameters if URL uses hash routing e.g. /#/practice/adaptive/107489/lessons/738230?sectionId=1&unitId=20
    let hashQueryString = "";
    if (window.location.hash.includes("?")) {
      hashQueryString = window.location.hash.split("?")[1];
    }
    const hashParams = new URLSearchParams(hashQueryString);

    const getParam = (key: string): string | undefined => {
      return searchParams.get(key) || hashParams.get(key) || undefined;
    };

    // Extract path-based IDs (e.g., /adaptive/107489/lessons/738230)
    const fullPathAndHash = window.location.pathname + window.location.hash;
    const adaptiveMatch = fullPathAndHash.match(/adaptive\/(\d+|\w+)/);
    const lessonMatch = fullPathAndHash.match(/lessons\/(\d+|\w+)/);

    const sectionId = getParam("sectionId");
    const unitId = getParam("unitId");
    const lessonId = getParam("lessonId") || (lessonMatch ? lessonMatch[1] : undefined);
    const adaptiveId = getParam("adaptiveId") || (adaptiveMatch ? adaptiveMatch[1] : undefined);
    const utmSource = getParam("utm_source") || getParam("ref") || getParam("source");
    const utmMedium = getParam("utm_medium");
    const utmCampaign = getParam("utm_campaign");
    const referrer = document.referrer || undefined;

    // Check if any tracking info is present
    const hasInfo =
      sectionId ||
      unitId ||
      lessonId ||
      adaptiveId ||
      utmSource ||
      utmMedium ||
      utmCampaign ||
      referrer ||
      fullUrl.includes("sectionId=") ||
      fullUrl.includes("unitId=");

    if (hasInfo) {
      const originContext: OriginContext = {
        originUrl: fullUrl,
        sectionId,
        unitId,
        lessonId,
        adaptiveId,
        utmSource,
        utmMedium,
        utmCampaign,
        referrer,
      };

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(originContext));
      return originContext;
    }
  } catch (e) {
    console.error("UrlTracker error:", e);
  }

  return getOriginContext();
}

export function getOriginContext(): OriginContext | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {}
  return null;
}
