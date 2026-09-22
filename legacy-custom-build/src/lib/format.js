// Tiny markdown-lite renderer. Client-safe (no Node/edge APIs).
// Escapes HTML first, then applies formatting — XSS-safe by construction.

export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatBody(body) {
  const blocks = [];
  // 1. Pull out fenced code blocks so nothing inside gets formatted.
  let text = String(body ?? '').replace(/```(\w*)\n?([\s\S]*?)```/g, (_m, lang, code) => {
    blocks.push(
      `<pre class="codeblock"><code>${escapeHtml(code.replace(/\n$/, ''))}</code>${lang ? `<span class="codelang">${escapeHtml(lang)}</span>` : ''}</pre>`
    );
    return `\u0000${blocks.length - 1}\u0000`;
  });
  // 2. Escape everything else.
  let h = escapeHtml(text);
  // 3. Inline formatting.
  h = h
    .replace(/`([^`\n]+)`/g, '<code class="inlinecode">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(>])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="nofollow noopener">$1</a>')
    .replace(/(^|[\s(>])@([a-zA-Z0-9-]{1,39})/g, '$1<a href="/u/$2" class="mention">@$2</a>')
    .replace(/\n/g, '<br>');
  // 4. Restore code blocks.
  h = h.replace(/\u0000(\d+)\u0000/g, (_m, i) => blocks[Number(i)] ?? '');
  return h;
}

export function excerpt(text, len = 160) {
  const t = String(text ?? '').replace(/\s+/g, ' ').trim();
  return t.length > len ? t.slice(0, len - 1) + '…' : t;
}
