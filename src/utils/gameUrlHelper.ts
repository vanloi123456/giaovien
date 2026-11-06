/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ApplicationGame } from '../types.ts';

/**
 * Decodes common HTML entities if the embed snippet was escaped
 */
function unescapeEmbedHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * Normalizes and optimizes URLs from common educational platforms (Wordwall, Scratch, Canva, YouTube, PhET)
 */
export function optimizeGameUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();

  // Ensure protocol is present
  if (url.startsWith('//')) {
    url = `https:${url}`;
  } else if (!/^https?:\/\//i.test(url) && !url.startsWith('/') && !url.startsWith('data:')) {
    url = `https://${url}`;
  }

  // Wordwall:
  // 1. Fix any erroneous language prefix in /embed/ (Wordwall embed endpoint has no language prefix)
  if (url.includes('wordwall.net/vi/embed/')) {
    url = url.replace(/wordwall\.net\/vi\/embed\//i, 'wordwall.net/embed/');
  }

  // Scratch: Convert /projects/123 to /projects/123/embed
  if (/scratch\.mit\.edu\/projects\/\d+/i.test(url) && !url.includes('/embed')) {
    url = url.replace(/scratch\.mit\.edu\/projects\/(\d+)\/?/i, 'scratch.mit.edu/projects/$1/embed');
  }

  // Canva: Ensure embed param is present if it is a view link
  if (/canva\.com\/design\/[^\s]+\/view/i.test(url) && !url.includes('embed')) {
    url = url.includes('?') ? `${url}&embed` : `${url}?embed`;
  }

  // YouTube: Convert watch?v= to embed/
  if (url.includes('youtube.com/watch?v=')) {
    url = url.replace(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/i, 'youtube.com/embed/$1');
  } else if (url.includes('youtu.be/')) {
    url = url.replace(/youtu\.be\/([a-zA-Z0-9_-]+)/i, 'youtube.com/embed/$1');
  }

  return url;
}

/**
 * Extracts the independent direct URL of a game or simulation from its embed code.
 * Supports:
 * - Direct URLs: https://..., http://..., //..., www....
 * - Iframe tags: <iframe src="..."></iframe> (multiline, flexible attributes, single/double/unquoted)
 * - Embed & Object tags: <embed src="...">, <object data="...">
 * - Anchor tags: <a href="..."></a>
 * - Platform links (Wordwall, PhET, Scratch, Canva, Google Gemini, Quizizz, Kahoot, YouTube, etc.)
 */
export function extractGameDirectUrl(embedCode: string, gameId?: string): {
  url: string;
  isDirectLink: boolean;
} {
  if (!embedCode || typeof embedCode !== 'string') {
    return { url: '', isDirectLink: false };
  }

  let code = embedCode.trim();
  if (code.includes('&lt;') || code.includes('&gt;') || code.includes('&quot;')) {
    code = unescapeEmbedHtml(code);
  }

  // 1. Direct URL (starts with http:// or https://)
  if (/^https?:\/\//i.test(code)) {
    return { url: optimizeGameUrl(code), isDirectLink: true };
  }
  if (code.startsWith('//')) {
    return { url: optimizeGameUrl(`https:${code}`), isDirectLink: true };
  }

  // 1b. Common platform links pasted without protocol
  if (/^(www\.|share\.gemini\.google|gemini\.google\.com|wordwall\.net|phet\.colorado\.edu|scratch\.mit\.edu|canva\.com|quizizz\.com|kahoot\.it|baamboozle\.com|youtube\.com|youtu\.be)/i.test(code)) {
    return { url: optimizeGameUrl(`https://${code}`), isDirectLink: true };
  }

  // 2. Extract src from <iframe> tag (flexible attribute order, multiline, single/double/unquoted quotes)
  const iframeMatch = code.match(/<iframe\b[^>]*?\bsrc\s*=\s*(?:["']([^"'>]+)["']|([^\s>]+))/is);
  if (iframeMatch) {
    let src = (iframeMatch[1] || iframeMatch[2] || '').trim().replace(/&amp;/g, '&');
    if (src.startsWith('//')) src = `https:${src}`;
    else if (!/^https?:\/\//i.test(src) && !src.startsWith('data:') && !src.startsWith('/')) {
      src = `https://${src}`;
    }
    if (src && (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/'))) {
      return { url: optimizeGameUrl(src), isDirectLink: true };
    }
  }

  // 3. Extract src from <embed> tag
  const embedMatch = code.match(/<embed\b[^>]*?\bsrc\s*=\s*(?:["']([^"'>]+)["']|([^\s>]+))/is);
  if (embedMatch) {
    let src = (embedMatch[1] || embedMatch[2] || '').trim().replace(/&amp;/g, '&');
    if (src.startsWith('//')) src = `https:${src}`;
    if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
      return { url: optimizeGameUrl(src), isDirectLink: true };
    }
  }

  // 4. Extract data from <object> tag
  const objectMatch = code.match(/<object\b[^>]*?\bdata\s*=\s*(?:["']([^"'>]+)["']|([^\s>]+))/is);
  if (objectMatch) {
    let dataUrl = (objectMatch[1] || objectMatch[2] || '').trim().replace(/&amp;/g, '&');
    if (dataUrl.startsWith('//')) dataUrl = `https:${dataUrl}`;
    if (dataUrl && (dataUrl.startsWith('http://') || dataUrl.startsWith('https://'))) {
      return { url: optimizeGameUrl(dataUrl), isDirectLink: true };
    }
  }

  // 5. Extract href from <a> tag
  const linkMatch = code.match(/<a\b[^>]*?\bhref\s*=\s*(?:["']([^"'>]+)["']|([^\s>]+))/is);
  if (linkMatch) {
    let href = (linkMatch[1] || linkMatch[2] || '').trim().replace(/&amp;/g, '&');
    if (href.startsWith('//')) href = `https:${href}`;
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      return { url: optimizeGameUrl(href), isDirectLink: true };
    }
  }

  // 6. Any http(s) URL found anywhere in the text
  const anyUrlMatch = code.match(/https?:\/\/[^\s"'>]+/i);
  if (anyUrlMatch && anyUrlMatch[0]) {
    return { url: optimizeGameUrl(anyUrlMatch[0].trim().replace(/&amp;/g, '&')), isDirectLink: true };
  }

  // 7. If this is a registered game with a persistent ID on the server
  if (gameId && typeof window !== 'undefined') {
    const rawUrl = `${window.location.origin}/api/play/${encodeURIComponent(gameId)}/raw`;
    return { url: rawUrl, isDirectLink: false };
  }

  return { url: '', isDirectLink: false };
}

export interface OpenGameResult {
  url: string;
  opened: boolean;
  isDirectLink: boolean;
}

/**
 * Opens a game/simulation in a new browser tab with only the game's independent link.
 * Uses native link dispatch for 100% reliable tab opening across all browsers without popup blocking.
 */
export function openGameInIndependentNewTab(game: ApplicationGame): OpenGameResult {
  const { url, isDirectLink } = extractGameDirectUrl(game.embedCode, game.id);

  let targetUrl = url;
  if (!targetUrl && typeof window !== 'undefined' && game.id) {
    targetUrl = `${window.location.origin}/api/play/${encodeURIComponent(game.id)}/raw`;
  }

  let opened = false;
  if (targetUrl && typeof window !== 'undefined') {
    // Increment play count asynchronously
    if (game.id && !game.id.startsWith('custom-')) {
      fetch(`/api/applications/${encodeURIComponent(game.id)}/play-increment`, { method: 'POST' }).catch(() => {});
    }

    try {
      // Trigger a synthetic anchor click: this is recognized by browsers as a user navigation and bypasses popup blockers
      const link = document.createElement('a');
      link.href = targetUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      opened = true;
    } catch (err) {
      console.warn('Anchor click error, trying window.open:', err);
      try {
        const win = window.open(targetUrl, '_blank');
        if (win) opened = true;
      } catch (e2) {
        opened = false;
      }
    }
  }

  return { url: targetUrl, opened, isDirectLink };
}
