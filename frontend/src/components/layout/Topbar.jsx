import { Activity } from 'lucide-react';
import ThemeToggle from './ThemeToggle.jsx';

const items = [['workspace','Workspace'],['history','History'],['monitoring','Monitoring'],['github','GitHub'],['reports','Reports'],['docs','Documentation']];

export default function Topbar({ page, onNavigate, theme, onThemeChange, demo }) {
  return <header className="topbar">
    <button className="brand brand-button" onClick={() => onNavigate('workspace')} aria-label="AccessLens home"><span className="brand-mark"><Activity size={18}/></span><span>access<span className="orange">lens</span><small>WEB ACCESSIBILITY AUDITOR</small></span></button>
    <nav className="main-nav" aria-label="Main navigation">{items.map(([id,label])=><button key={id} className={page===id?'nav-active':''} aria-current={page===id?'page':undefined} onClick={()=>onNavigate(id)}>{label}</button>)}</nav>
    <select className="nav-mobile" aria-label="Navigate" value={page} onChange={e=>onNavigate(e.target.value)}>{[...items,['settings','Settings']].map(([id,label])=><option key={id} value={id}>{label}</option>)}</select>
    <div className="top-actions"><span className="env-pill"><i/> {demo ? 'DEMO MODE' : 'LIVE API'}</span><ThemeToggle theme={theme} onChange={onThemeChange}/><button className="avatar" aria-label="Settings" onClick={()=>onNavigate('settings')}>S</button></div>
  </header>;
}
