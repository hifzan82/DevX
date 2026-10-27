import CodeFixPanel from './CodeFixPanel.jsx';
import { generateFix, verifyFix } from '../../services/fixService.js';
import { useState } from 'react';

export default function CodeFixPanelConnected(props) {
  const { issue, onToast } = props;
  const [localIssue, setLocalIssue] = useState(issue);
  const [verifying, setVerifying] = useState(false);

  const actions = async (label) => {
    if (label === 'Generate fix') {
      try {
        const res = await generateFix(localIssue);
        const fixText = res.fix?.suggestedFix ? res.fix.suggestedFix + '\n\n// ' + (res.fix.explanation || '') : (res.fix || JSON.stringify(res));
        setLocalIssue({ ...localIssue, fix: fixText, status: localIssue.status === 'Ignored' ? localIssue.status : 'Not tested' });
        onToast?.('Fix generated');
      } catch (e) {
        onToast?.(e.userMessage || e.message || 'Failed to generate fix');
      }
      return;
    }
    if (label === 'Preview') {
      onToast?.('Preview available in verification environment');
      return;
    }
    if (label === 'Verify') {
      setVerifying(true);
      try {
        const res = await verifyFix({ url: localIssue.pageUrl, html: localIssue.snippet });
        setLocalIssue({ ...localIssue, status: res.status });
        onToast?.(`Verification: ${res.status}`);
      } catch (e) {
        onToast?.(e.userMessage || e.message || 'Verification failed');
      } finally {
        setVerifying(false);
      }
      return;
    }
    if (label === 'Copy guidance') {
      try {
        await navigator.clipboard.writeText(localIssue.fix || '');
        onToast?.('Remediation guidance copied');
      } catch {
        onToast?.('Clipboard access is unavailable');
      }
      return;
    }
  };

  return <CodeFixPanel {...props} issue={localIssue} onAction={actions} onCopy={() => actions('Copy guidance')} />;
}
