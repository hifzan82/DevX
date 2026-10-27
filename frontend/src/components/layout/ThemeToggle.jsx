import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ theme, onChange }) {
  const next = theme === 'dark' ? 'light' : 'dark';
  return <button className="icon-button" aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`} onClick={() => onChange(next)}>{theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}</button>;
}
