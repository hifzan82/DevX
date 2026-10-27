import { ChevronRight } from 'lucide-react';
import CodeFixPanel from './CodeFixPanel.jsx';

export default function IssueCard({ issue,index,selected,expanded,onSelect,onInspect,onCopy,onIgnore,onAction }) {
  return <article className={`issue-card ${selected?'issue-selected':''} ${issue.status==='Ignored'?'issue-ignored':''}`}><button className="issue-summary" onClick={onSelect} aria-expanded={expanded}><span className={`severity-marker severity-${issue.severity}`}/><span className="issue-number">{String(index+1).padStart(2,'0')}</span><span className="issue-title-wrap"><strong>{issue.title}</strong><span><code>{issue.rule}</code><i/>WCAG {issue.wcag}</span></span><span className={`badge badge-${issue.severity}`}>{issue.severity}</span><span className="affected-count">{issue.count}<small> nodes</small></span><ChevronRight className={`issue-chevron ${expanded?'turned':''}`} size={16}/></button>{expanded&&<CodeFixPanel issue={issue} onInspect={onInspect} onCopy={onCopy} onAction={onAction} onIgnore={onIgnore}/>}</article>;
}
