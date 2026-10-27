import { useEffect, useRef, useState } from 'react';
import CodeFixPanel from './CodeFixPanel.jsx';
import FixVerificationPanel from './FixVerificationPanel.jsx';
import { suggestFix } from '../../services/fixService.js';

export default function CodeFixPanelEnhanced({
  issue,
  onToast,
  onAction,
  websiteCategory = 'General',
  ...props
}) {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const verificationRef = useRef(null);

  useEffect(() => {
    setSuggestion(null);
  }, [issue?.id, issue?.pageUrl]);

  const proposed = suggestion?.suggestedFix || '';

  const localIssue = {
    ...issue,
    fix: proposed || issue?.fix,
    fixType: suggestion?.type || issue?.fixType,
  };

  async function generate() {
    if (loading) return;

    setLoading(true);

    try {
      const response = await suggestFix(issue);
      const next = response.fix || response;

      setSuggestion(next);
      onToast?.('Fix suggestion generated — unverified');
    } catch (error) {
      onToast?.(
        error.userMessage ||
        error.message ||
        'Could not generate the fix'
      );
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(
        proposed || issue?.fix || ''
      );
      onToast?.('Guidance copied');
    } catch {
      onToast?.('Clipboard access unavailable');
    }
  }

  function openVerification(action) {
    verificationRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'nearest',
    });

    const button = verificationRef.current?.querySelector(
      `[data-verification-action="${action}"]`
    );

    button?.click();
  }

  return (
    <div>
      <CodeFixPanel
        {...props}
        issue={localIssue}
        websiteCategory={websiteCategory}
        onAction={onAction}
        onGenerate={generate}
        generating={loading}
        onCopy={copy}
        onPreview={() => openVerification('preview')}
        onVerify={() => openVerification('verify')}
      />

      <div ref={verificationRef}>
        <FixVerificationPanel
          issue={issue}
          suggestion={suggestion}
          onToast={onToast}
        />
      </div>
    </div>
  );
}