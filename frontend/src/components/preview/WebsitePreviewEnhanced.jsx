import { useState } from 'react';
import WebsitePreview from './WebsitePreview.jsx';
import { fetchPreview } from '../../services/previewService.js';

export default function WebsitePreviewEnhanced(props) {
  const [liveHtml, setLiveHtml] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadLive = async () => {
    if (!props.url || props.demo) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetchPreview(props.url);
      setLiveHtml(res.html);
    } catch (e) {
      setError(e.userMessage || e.message || 'Failed to load live preview');
    } finally {
      setLoading(false);
    }
  };

  // If we have live HTML and no screenshot, use it as srcDoc-like by passing through; component expects srcDoc for demo
  return (
    <div className="relative">
      <WebsitePreview {...props} srcDoc={props.demo ? props.srcDoc : (liveHtml || props.srcDoc)} demo={props.demo || Boolean(liveHtml)} />
      {!props.demo && !props.screenshot && (
        <button onClick={loadLive} disabled={loading} className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs shadow">{loading ? 'Loading...' : 'Load live preview'}</button>
      )}
      {error && <div className="absolute bottom-3 left-3 text-xs text-red-600">{error}</div>}
    </div>
  );
}
