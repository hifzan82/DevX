import dns from 'node:dns/promises';
import net from 'node:net';
import ipaddr from 'ipaddr.js';

export function parsePublicUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) throw new Error('Enter a valid public website URL.');
  let url;
  try { url = new URL(value); } catch { throw new Error('Enter a valid public website URL.'); }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) {
    throw new Error('Only public HTTP or HTTPS URLs without credentials are supported.');
  }
  if (url.port && !['80', '443'].includes(url.port)) throw new Error('Only standard web ports are supported.');
  url.hash = '';
  return url;
}

export function isPublicAddress(address) {
  try {
    const parsed = ipaddr.process(address);
    // ipaddr.js labels globally routable IPv4/IPv6 as unicast.
    return parsed.range() === 'unicast';
  } catch { return false; }
}

export async function assertPublicUrl(value, lookup = dns.lookup) {
  const url = parsePublicUrl(value);
  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new Error('Private and local addresses cannot be scanned.');
  }
  if (net.isIP(host)) {
    if (!isPublicAddress(host)) throw new Error('Private and local addresses cannot be scanned.');
  } else {
    let addresses;
    try { addresses = await Promise.race([
      lookup(host, { all: true, verbatim: true }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('DNS timeout')), 3000)),
    ]); }
    catch { throw new Error('The website hostname could not be resolved.'); }
    if (!Array.isArray(addresses) || !addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) {
      throw new Error('The website resolves to a private or reserved address.');
    }
  }
  return url.toString();
}
