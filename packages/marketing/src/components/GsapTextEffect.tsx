"use client";

import React, { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    gsap: any;
    SplitText: any;
    ScrollTrigger: any;
  }
}

export default function GsapTextEffect() {
  useEffect(() => {
    // If scripts are already loaded globally, trigger initialize
    if (window.gsap && window.SplitText && window.ScrollTrigger) {
      initGsap();
    }
  }, []);

  const initGsap = () => {
    const gsap = window.gsap;
    const SplitText = window.SplitText;
    const ScrollTrigger = window.ScrollTrigger;

    try {
      gsap.registerPlugin(SplitText, ScrollTrigger);
      gsap.set(".split", { opacity: 1 });

      document.fonts.ready.then(() => {
        const containers = gsap.utils.toArray(".container-split");

        containers.forEach((container: any) => {
          const text = container.querySelector(".split");
          if (!text) return;

          SplitText.create(text, {
            type: "words,lines",
            mask: "lines",
            linesClass: "line",
            autoSplit: true,
            onSplit: (instance: any) => {
              return gsap.from(instance.lines, {
                yPercent: 120,
                stagger: 0.1,
                scrollTrigger: {
                  trigger: container,
                  scrub: true,
                  start: "clamp(top 80%)",
                  end: "clamp(bottom center)",
                },
              });
            },
          });
        });
      });
    } catch (e) {
      console.warn("GSAP Text Effect initialization warning:", e);
    }
  };

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (window.gsap && window.SplitText && window.ScrollTrigger) {
            initGsap();
          }
        }}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (window.gsap && window.SplitText && window.ScrollTrigger) {
            initGsap();
          }
        }}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/gsap-trial@3.12.5/dist/SplitText.min.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (window.gsap && window.SplitText && window.ScrollTrigger) {
            initGsap();
          }
        }}
      />

      <style jsx global>{`
        .split {
          opacity: 0;
          text-align: center;
          font-size: 2.20rem;
          line-height: 1.4;
          font-weight: 800;
          will-change: transform;
          color: #0e100f;
          font-family: inherit;
        }
        .split * {
          will-change: transform;
        }
        .container-split {
          width: 90vw;
          max-width: 900px;
          margin-top: 15vh;
          margin-bottom: 15vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .line {
          overflow: hidden;
        }
      `}</style>
    </>
  );
}
