export function formatDate(value,locale) {
  if(!value)return '—';
  const date=new Date(value);
  if(Number.isNaN(date.getTime()))return '—';
  return new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}).format(date);
}

export function formatUrl(value) {
  try { const url=new URL(value); return `${url.hostname}${url.pathname==='/'?'':url.pathname}`; }
  catch { return value||'—'; }
}
