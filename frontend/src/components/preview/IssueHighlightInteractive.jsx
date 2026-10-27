import { useEffect, useState } from 'react';

export default function IssueHighlightInteractive({ containerRef, issues = [], activeId, onSelectIssue, viewport = 'desktop' }) {
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    if (!containerRef?.current || !issues?.length) {
      setHighlights([]);
      return;
    }
    const container = containerRef.current;
    const items = [];
    issues.forEach((issue) => {
      const bounds = issue.bounds;
      if (!bounds || bounds.x < 0 || bounds.y < 0) return;
      // Assume screenshot rendered at full width scaled; use percentages based on viewport base
      const baseWidth = viewport === 'mobile' ? 375 : 1280;
      const baseHeight = viewport === 'mobile' ? 812 : 900;
      items.push({
        issueId: issue.id,
        issue,
        style: {
          left: `${(bounds.x / baseWidth) * 100}%`,
          top: `${(bounds.y / baseHeight) * 100}%`,
          width: `${Math.max(bounds.width / baseWidth * 100, 2)}%`,
          height: `${Math.max(bounds.height / baseHeight * 100, 2)}%`,
        },
        active: issue.id === activeId
      });
    });
    setHighlights(items);
  }, [containerRef, issues, activeId, viewport]);

  if (!highlights.length) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {highlights.map((h, idx) => (
        <button
          key={h.issueId + idx}
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelectIssue?.(h.issueId); }}
          className={`pointer-events-auto absolute rounded border-[3px] transition-all duration-200 ${h.active ? 'border-orange-500 bg-orange-500/20 shadow-[0_0_0_4px_rgba(249,115,22,0.25)]' : 'border-orange-400/80 bg-orange-400/10 hover:border-orange-500 hover:bg-orange-500/20'}`}
          style={h.style}
          aria-label={`Select issue: ${h.issue.title}`}
          title={h.issue.title}
        />
      ))}
    </div>
  );
}
