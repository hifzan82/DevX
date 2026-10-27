document.getElementById('scan').addEventListener('click', async () => {
  const output = document.getElementById('results');
  output.textContent = 'Scanning current tab…';
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('No active tab is available.');
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['axe.min.js']
    });
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        return await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
      }
    });
    const violations = results[0]?.result?.violations || [];
    output.replaceChildren();
    const heading = document.createElement('p');
    heading.textContent = `${violations.length} accessibility rules with violations`;
    output.append(heading);
    for (const violation of violations) {
      const item = document.createElement('div');
      item.className = 'issue';
      const title = document.createElement('strong');
      title.textContent = `[${violation.impact || 'unknown'}] ${violation.id}`;
      const description = document.createElement('p');
      const criteria = (violation.tags || []).filter(tag => /^wcag\d{3,4}$/.test(tag));
      description.textContent = `${violation.help || ''}${criteria.length ? ` · ${criteria.join(', ')}` : ''}`;
      item.append(title, description);
      output.append(item);
    }
  } catch (e) {
    output.textContent = 'Scan failed: ' + e.message;
  }
});
