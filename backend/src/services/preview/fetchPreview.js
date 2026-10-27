import { assertPublicUrl } from '../publicUrl.js';

const MAX_BYTES = 512 * 1024;

export async function fetchPreviewHtml(inputUrl) {
  let url = await assertPublicUrl(inputUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    let response;
    for (let redirect = 0; redirect <= 3; redirect += 1) {
      response = await fetch(url, {
        method: 'GET', redirect: 'manual',
        headers: { 'User-Agent': 'AccessLens/1.0', Accept: 'text/html,application/xhtml+xml' },
        signal: controller.signal,
      });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get('location');
      if (!location || redirect === 3) throw new Error('Preview redirected too many times.');
      url = await assertPublicUrl(new URL(location, url).toString());
      await response.body?.cancel();
    }
    if (!response.ok) throw new Error(`Target returned HTTP ${response.status}.`);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) throw new Error('Only HTML previews are supported.');
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Preview response has no content.');
    const chunks = [];
    let bytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) { await reader.cancel(); throw new Error('Preview is too large to render safely.'); }
      chunks.push(value);
    }
    const buffer = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.byteLength; }
    return { html: new TextDecoder('utf-8').decode(buffer), url };
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Preview request timed out.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
