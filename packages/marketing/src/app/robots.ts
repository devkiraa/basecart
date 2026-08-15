import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://basecart.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      // ── AI search engines & answer engines (explicit allows so
      //    they can crawl and cite our content) ─────────────────────
      {
        userAgent: "GPTBot",
        allow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
      },
      {
        // OpenAI's crawler for ChatGPT search citations (GPTBot is training-focused)
        userAgent: "OAI-SearchBot",
        allow: "/",
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "Bingbot",
        allow: "/",
      },
      // ── Training-only crawlers (blocked: they index for model
      //    training, not for citing/search) ──────────────────────────
      {
        userAgent: "CCBot",
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
