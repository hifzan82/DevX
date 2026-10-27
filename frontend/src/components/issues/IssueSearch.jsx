import { Search } from 'lucide-react';

export default function IssueSearch({ value,onChange }) {
  return <label className="search-box"><Search size={15}/><input placeholder="Search issues…" aria-label="Search issues" value={value} onChange={e=>onChange(e.target.value)}/><kbd>⌘ K</kbd></label>;
}
