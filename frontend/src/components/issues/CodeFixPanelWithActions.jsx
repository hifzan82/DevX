import CodeFixPanel from './CodeFixPanel.jsx';
import { generateFix, verifyFix } from '../../services/fixService.js';
import { useState } from 'react';

export default function CodeFixPanelWithActions(props) {
  const { issue } = props;
  const [fixData, setFixData] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const handleGenerate = async () => {
    try {
      const res = await generateFix(issue);
      setFixData(res.fix);
      props.onToast?.('Fix generated');
    } catch (e) {
      props.onToast?.(e.userMessage || e.message || 'Failed to generate fix');
    }
  };

  const handlePreview = () => {
    props.onToast?.('Preview uses isolated environment when Verify is run');
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await verifyFix({ url: issue.pageUrl, html: issue.snippet });
      setVerifyResult(res);
      props.onToast?.(`Verification: ${res.status}`);
    } catch (e) {
      props.onToast?.(e.userMessage || e.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const enhancedIssue = fixData ? { ...issue, fix: fixData.suggestedFix + '\n\n// ' + fixData.explanation } : issue;
  return (
    <div>
      <CodeFixPanel
        {...props}
        issue={enhancedIssue}
        onAction={(label) => {
          if (label === 'Generate fix') handleGenerate();
          if (label === 'Preview') handlePreview();
          if (label === 'Verify') handleVerify();
        }}
      />
      {verifyResult && (
        <div className="px-4 pb-4 text-[11px] text-zinc-600 dark:text-zinc-400">
          Verification: <strong>{verifyResult.status}</strong> — {verifyResult.message}
        </div>
      )}
    </div>
  );
}
