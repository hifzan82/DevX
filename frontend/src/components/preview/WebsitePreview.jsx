import PreviewToolbar from './PreviewToolbar.jsx';
import IssueHighlight from './IssueHighlight.jsx';

export default function WebsitePreview({ className='',iframeRef,srcDoc,demo,url,selector,active,viewport='desktop',onViewportChange,onRefresh }) {
  return <section className={`panel preview-panel ${className}`}><IssueHighlight frameRef={iframeRef} selector={selector}/><PreviewToolbar url={url} demo={demo} active={active} viewport={viewport} onViewportChange={onViewportChange} onRefresh={onRefresh}/><div className="preview-canvas"><div className={`browser-frame ${viewport==='mobile'?'frame-mobile':''}`}><div className="browser-chrome"><div className="traffic"><i/><i/><i/></div><div className="browser-address">{url||'sample-page.design'}</div></div><iframe title="Controlled website preview" ref={iframeRef} srcDoc={srcDoc} sandbox="allow-same-origin" data-selected-selector={selector||''}/></div><div className="preview-legend"><span><i className="legend-orange"/> Selected element</span><span><i className="legend-gray"/> Other findings</span><span className="legend-note">Controlled sample · not the target site</span></div></div></section>;
}
