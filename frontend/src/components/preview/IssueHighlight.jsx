
import { useEffect } from 'react';

export default function IssueHighlight({ frameRef, selector }) {
  useEffect(() => {
    const frame = frameRef?.current;

    if (!frame) return;

    let animationFrame;

    const highlight = () => {
      let doc;

      try {
        doc = frame.contentDocument;
      } catch {
        return;
      }

      if (!doc) return;

      doc.querySelectorAll('.broken').forEach((element) => {
        element.classList.remove('broken');
      });

      doc.getElementById('accesslens-highlight-styles')?.remove();

      if (!selector) return;

      try {
        const elements = doc.querySelectorAll(selector);

        if (!elements.length) return;

        const style = doc.createElement('style');
        style.id = 'accesslens-highlight-styles';

        style.textContent = `
          .broken {
            outline: 3px solid #f97316 !important;
            outline-offset: 5px !important;
            border-radius: 5px !important;
            box-shadow:
              0 0 0 8px rgba(249, 115, 22, 0.12),
              0 5px 22px rgba(249, 115, 22, 0.16) !important;
            transition:
              outline-color 0.25s ease,
              box-shadow 0.25s ease !important;
          }

          @media (prefers-reduced-motion: reduce) {
            .broken {
              transition: none !important;
            }
          }
        `;

        doc.head?.appendChild(style);

        elements.forEach((element) => {
          element.classList.add('broken');
        });

        animationFrame = requestAnimationFrame(() => {
          elements[0]?.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
              ? 'instant'
              : 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        });
      } catch {
        return;
      }
    };

    frame.addEventListener('load', highlight);
    highlight();

    return () => {
      frame.removeEventListener('load', highlight);
      cancelAnimationFrame(animationFrame);

      try {
        const doc = frame.contentDocument;

        doc?.querySelectorAll('.broken').forEach((element) => {
          element.classList.remove('broken');
        });

        doc?.getElementById('accesslens-highlight-styles')?.remove();
      } catch {
        return;
      }
    };
  }, [frameRef, selector]);

  return null;
}
