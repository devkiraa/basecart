import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { getPost, POSTS } from "../../../data/posts";

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost(params.slug);
  if (!post) return {};

  const url = `https://basecart.app/blog/${post.slug}`;

  return {
    title: `${post.title} | Basecart Blog`,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      siteName: "Basecart",
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updatedDate,
      authors: [post.author.name],
      section: post.category,
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: ["/basecart_dashboard_mockup.png"],
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const url = `https://basecart.app/blog/${post.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: ["https://basecart.app/basecart_dashboard_mockup.png"],
    datePublished: post.date,
    dateModified: post.updatedDate,
    author: {
      "@type": "Organization",
      name: post.author.name,
      url: "https://basecart.app",
    },
    publisher: {
      "@type": "Organization",
      name: "Basecart",
      url: "https://basecart.app",
      logo: {
        "@type": "ImageObject",
        url: "https://basecart.app/logo.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    inLanguage: "en",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://basecart.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://basecart.app/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: url,
      },
    ],
  };

  const faqSchema = post.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.a,
          },
        })),
      }
    : null;

  const schemas = [articleSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])];

  return (
    <div className="min-h-screen bg-white text-slate-600 font-sans antialiased selection:bg-blue-50 selection:text-blue-600">
      {/* JSON-LD structured data (sanitized) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemas)
            .replace(/</g, "\\u003c")
            .replace(/>/g, "\\u003e")
            .replace(/&/g, "\\u0026"),
        }}
      />

      <Header />

      {/* Article Hero */}
      <section className="px-6 lg:px-16 pt-16 pb-12 bg-gradient-to-b from-[#F8FAFC]/50 to-white">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to blog
          </Link>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold mb-4">
            <span className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full">
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {post.displayDate}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-slate-500 font-semibold">
            <span className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
              {post.author.name.charAt(0)}
            </span>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <User className="h-3 w-3 text-slate-400" />
                {post.author.name}
              </div>
              <div className="text-xs text-slate-400">{post.author.role}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Body */}
      <article className="px-6 lg:px-16 pb-20">
        <div className="max-w-3xl mx-auto">
          {/* Standalone answer block — first paragraph is a self-contained definition */}
          <p className="text-lg leading-relaxed text-slate-700 font-medium border-l-4 border-blue-600 pl-5 py-1 bg-blue-50/40 rounded-r-lg">
            {post.excerpt}
          </p>

          {post.sections.map((section, i) => (
            <section key={i} className="mt-10">
              {section.heading && (
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-4">
                  {section.heading}
                </h2>
              )}
              {section.paragraphs.map((p, j) => (
                <p key={j} className="text-base leading-relaxed text-slate-600 mb-5">
                  {p}
                </p>
              ))}
              {section.list && (
                <ul className="space-y-2.5 mb-5">
                  {section.list.map((item, k) => (
                    <li key={k} className="flex items-start gap-2.5 text-base text-slate-600 leading-relaxed">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {post.faqs && post.faqs.length > 0 && (
            <section className="mt-14">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6">
                Frequently Asked Questions
              </h2>
              <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-sm">
                {post.faqs.map((faq, i) => (
                  <div key={i} className="p-5 space-y-2">
                    <h3 className="text-sm font-bold text-slate-900">{faq.q}</h3>
                    <p className="text-sm leading-relaxed text-slate-500 font-medium">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="mt-14 bg-blue-600 rounded-2xl p-8 text-white text-center space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Ready to launch your store?
            </h2>
            <p className="text-sm text-blue-100 font-medium">
              Start your 3-month free trial. No credit card required.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-bold text-sm rounded-lg hover:bg-slate-50 transition-all shadow-md"
            >
              Start 3-month free trial
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
