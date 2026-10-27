import { Filter, ListFilter, ArrowDownUp } from 'lucide-react';
import IssueSearch from './IssueSearch.jsx';

export default function IssueFilters({ query,onQueryChange,status,onStatusChange,severity,onSeverityChange,onSort }) {
  return <div className="issue-tools"><IssueSearch value={query} onChange={onQueryChange}/><div className="filter-row"><label><ListFilter size={14}/><select aria-label="Filter issue status" value={status} onChange={e=>onStatusChange(e.target.value)}><option>All issues</option><option>Open</option><option>Verified</option></select></label><label><Filter size={14}/><select aria-label="Filter severity" value={severity} onChange={e=>onSeverityChange(e.target.value)}><option>All severities</option><option>Critical</option><option>Serious</option><option>Moderate</option></select></label><button title="Sort by severity" onClick={onSort}><ArrowDownUp size={14}/></button></div></div>;
}
