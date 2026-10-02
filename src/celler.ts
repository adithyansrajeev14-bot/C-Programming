// @ts-nocheck
import { escH, GLOSSARY, JOKES, EXAM_TIPS } from './data';

export function cellerSVG() {
  return '<svg class="celler" data-mood="happy" viewBox="0 0 120 124" role="img" aria-label="Celler, the friendly cell tutor"><g>' +
    '<path d="M60 8c24 0 46 14 50 40 4 24-6 50-30 60-20 8-48 6-62-12C6 78 8 48 22 30 32 16 46 8 60 8z" fill="#7EE0C3" stroke="#1B2559" stroke-width="4" stroke-linejoin="round"/>' +
    '<ellipse cx="34" cy="90" rx="6" ry="4.5" fill="#FF5C8A"/><circle cx="92" cy="86" r="4.5" fill="#FFC93C"/><circle cx="26" cy="64" r="3" fill="#6B4EFF" opacity=".6"/>' +
    '<circle cx="86" cy="30" r="14" fill="#6B4EFF" stroke="#1B2559" stroke-width="3.5"/><circle cx="90" cy="26" r="4.5" fill="#CFC6FF"/>' +
    '<g class="eye"><ellipse cx="45" cy="58" rx="10" ry="12" fill="#fff" stroke="#1B2559" stroke-width="3.5"/><circle class="pupil" cx="47" cy="60" r="5" fill="#1B2559"/></g>' +
    '<g class="eye"><ellipse cx="73" cy="58" rx="10" ry="12" fill="#fff" stroke="#1B2559" stroke-width="3.5"/><circle class="pupil" cx="75" cy="60" r="5" fill="#1B2559"/></g>' +
    '<path class="m m-happy" d="M46 82q14 13 28 0" fill="none" stroke="#1B2559" stroke-width="4" stroke-linecap="round"/>' +
    '<path class="m m-cheer" d="M44 80q16 24 32 0z" fill="#FF5C8A" stroke="#1B2559" stroke-width="4" stroke-linejoin="round"/>' +
    '<path class="m m-oops" d="M44 88q6-8 12 0t12 0 8-2" fill="none" stroke="#1B2559" stroke-width="4" stroke-linecap="round"/>' +
    '<circle class="m m-think" cx="60" cy="86" r="5" fill="#1B2559"/>' +
    '<g class="extra x-cheer"><path d="M14 18l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#FFC93C"/><path d="M104 62l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#FF5C8A"/></g>' +
    '<path class="extra x-oops" d="M100 56q-5 9 0 12 5-3 0-12z" fill="#38BDF8" stroke="#1B2559" stroke-width="2"/></g></svg>';
}

function formatMarkdown(text: string): string {
  if (!text) return '';
  // Convert code blocks ```c ... ```
  let html = text.replace(/```(?:c|C)?\s*([\s\S]*?)```/g, (_m, codeText) => {
    return '<div class="codebox"><pre><code>' + escH(codeText.trim()) + '</code></pre></div>';
  });
  // Inline code `...`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold **...**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  // Italic *...*
  html = html.replace(/\*([^*]+)\*/g, '<i>$1</i>');
  // Convert bullet points to ul/li
  const lines = html.split('\n');
  let inList = false;
  const processed: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      if (!inList) { processed.push('<ul>'); inList = true; }
      processed.push('<li>' + trimmed.slice(2) + '</li>');
    } else {
      if (inList) { processed.push('</ul>'); inList = false; }
      if (trimmed.length > 0) {
        if (!trimmed.startsWith('<div') && !trimmed.startsWith('</div')) {
          processed.push('<p>' + trimmed + '</p>');
        } else {
          processed.push(trimmed);
        }
      }
    }
  }
  if (inList) processed.push('</ul>');
  return processed.join('');
}

export const Celler = {
  ctx: { view: 'home' } as any,
  tt: null as any,
  mt: null as any,
  chatHistory: [] as Array<{ role: 'user' | 'model'; text: string }>,

  init() {
    const $ = (s: string) => document.querySelector(s);
    const $$ = (s: string) => [...document.querySelectorAll(s)];

    const fab = document.createElement('div'); fab.className = 'cfab';
    fab.innerHTML = '<button class="cbtn bob" id="cbtn" aria-label="Open AI chat with Celler" aria-expanded="false">' + cellerSVG() + '</button><div class="bubble" id="cbub" hidden role="status"><button class="x" id="cbx" aria-label="Dismiss message">✕</button><b>Celler</b><div id="cbtxt"></div></div>';
    document.body.appendChild(fab);

    const p = document.createElement('section'); p.className = 'cpanel'; p.id = 'cpanel'; p.hidden = true; p.setAttribute('aria-label', 'AI Chat with Celler');
    p.innerHTML = '<div class="chead">' + cellerSVG() + '<div style="flex:1"><b>Celler <span style="font-size:0.75rem;background:#6B4EFF;color:#fff;padding:2px 8px;border-radius:99px;font-family:var(--fb);font-weight:700;">✨ Gemini AI</span></b><small style="display:block">Your C tutor with void main(). Ask me anything!</small></div><button id="cclose" aria-label="Close chat">✕</button></div><div class="clog" id="clog" aria-live="polite"></div><div class="cchips" id="cchips"></div><form class="cform" id="cform"><input id="cin" placeholder="Ask: why void main()? or debug my code..." aria-label="Ask Celler a question" autocomplete="off"><button class="btn sm" type="submit">Ask</button></form>';
    document.body.appendChild(p);

    const chips = [
      ['⚡ Why void main()?', 'why do we use void main() in C?'],
      ['🔍 Debug my code', 'Can you review and debug the code in my editor?'],
      ['💡 Give me a hint', 'give me a hint for this topic'],
      ['🔄 while vs do-while', 'Explain while vs do-while with void main() examples'],
      ['📝 Exam tips', 'Give me the top exam tips for scoring full marks in C']
    ];
    $('#cchips').innerHTML = chips.map((c) => '<button type="button" data-q="' + escH(c[1]) + '">' + c[0] + '</button>').join('');

    $('#cbtn').onclick = () => this.toggle();
    $('#cclose').onclick = () => this.toggle(false);
    $('#cbx').onclick = () => { $('#cbub').hidden = true; };
    $('#cchips').onclick = (e: any) => { const b = e.target.closest('button'); if (b) this.ask(b.dataset.q); };
    $('#cform').onsubmit = (e: any) => {
      e.preventDefault();
      const inp = $('#cin') as HTMLInputElement;
      const v = inp.value.trim();
      if (v) { inp.value = ''; this.ask(v); }
    };
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#cpanel').hidden) this.toggle(false); });
  },

  setMood(m: string, revert?: number) {
    const $$ = (s: string) => [...document.querySelectorAll(s)];
    $$('.celler').forEach((s: any) => { s.dataset.mood = m; });
    clearTimeout(this.mt);
    if (m !== 'happy') this.mt = setTimeout(() => this.setMood('happy'), revert || 4500);
  },

  say(html: string, mood?: string, ms?: number) {
    const $ = (s: string) => document.querySelector(s);
    this.setMood(mood || 'happy');
    const p = $('#cpanel');
    if (p && !p.hidden) { this.add('c', html); return; }
    const txt = $('#cbtxt'), bub = $('#cbub');
    if (txt && bub) {
      txt.innerHTML = html; bub.hidden = false;
      clearTimeout(this.tt); this.tt = setTimeout(() => { bub.hidden = true; }, ms || 11000);
    }
  },

  toggle(force?: boolean) {
    const $ = (s: string) => document.querySelector(s);
    const p = $('#cpanel'), btn = $('#cbtn');
    if (!p) return;
    const open = force === undefined ? p.hidden : force;
    p.hidden = !open;
    if (btn) btn.setAttribute('aria-expanded', String(open));
    if (open) {
      const bub = $('#cbub'); if (bub) bub.hidden = true;
      const log = $('#clog');
      if (log && !log.children.length) {
        this.add('c', 'Hi, I’m <b>Celler</b>! 🧬 Powered by <b>Gemini AI</b>.<br>Ask me any C programming question, ask for code explanations, or tap <b>Debug my code</b> to analyze what you are writing in the Code Lab!');
      }
      setTimeout(() => { const cin = $('#cin') as HTMLInputElement; if (cin) cin.focus(); }, 50);
    }
  },

  add(from: 'c' | 'u', html: string) {
    const $ = (s: string) => document.querySelector(s);
    const d = document.createElement('div'); d.className = 'cm ' + from; d.innerHTML = html;
    const log = $('#clog');
    if (log) { log.appendChild(d); log.scrollTop = log.scrollHeight; }
  },

  async ask(text: string) {
    const $ = (s: string) => document.querySelector(s);
    const p = $('#cpanel');
    if (p && p.hidden) this.toggle(true);

    this.add('u', escH(text));
    this.setMood('think');

    // Add thinking placeholder
    const log = $('#clog');
    const thinkDiv = document.createElement('div');
    thinkDiv.className = 'cm c';
    thinkDiv.id = 'celler-thinking';
    thinkDiv.innerHTML = '<div style="display:flex;align-items:center;gap:8px;font-style:italic;color:var(--muted)">' +
      '<span style="display:inline-block;animation:spin 1s linear infinite">🧬</span> Celler is thinking...</div>';
    if (log) { log.appendChild(thinkDiv); log.scrollTop = log.scrollHeight; }

    // Collect editor context if user is in Code Lab
    const codeEl = $('#code') as HTMLTextAreaElement;
    const stdinEl = $('#stdin') as HTMLTextAreaElement;
    const outEl = $('#out');
    const currentCode = (this.ctx.view === 'lab' && codeEl) ? codeEl.value : '';
    const currentOut = (this.ctx.view === 'lab' && outEl) ? outEl.textContent : '';

    const payload = {
      message: text,
      history: this.chatHistory,
      context: {
        view: this.ctx.view,
        challenge: this.ctx.challenge,
        currentCode: currentCode ? currentCode.slice(0, 2000) : undefined,
        consoleOutput: currentOut ? currentOut.slice(0, 500) : undefined
      }
    };

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const thinkEl = document.getElementById('celler-thinking');
      if (thinkEl) thinkEl.remove();

      if (!res.ok) throw new Error('Network error ' + res.status);
      const data = await res.json();
      const reply = data.reply || "I'm here to help you master C with void main()!";

      this.chatHistory.push({ role: 'user', text });
      this.chatHistory.push({ role: 'model', text: reply });
      if (this.chatHistory.length > 10) this.chatHistory = this.chatHistory.slice(-10);

      this.setMood('happy');
      this.add('c', formatMarkdown(reply));
    } catch (_err) {
      const thinkEl = document.getElementById('celler-thinking');
      if (thinkEl) thinkEl.remove();

      // Graceful local fallback
      const local = this.replyFallback(text);
      this.setMood(local.mood || 'happy');
      this.add('c', local.html);
    }
  },

  replyFallback(text: string) {
    const q = text.toLowerCase().trim();
    if (/\b(void main|int main)\b/.test(q)) {
      return { html: 'In our syllabus, we strictly write <b><code>void main()</code></b>! <code>void</code> indicates that the main function does not return any value to the operating system, which is why we do not need <code>return 0;</code>.', mood: 'cheer' };
    }
    if (/\b(joke|funny)\b/.test(q)) {
      return { html: JOKES[Math.floor(Math.random() * JOKES.length)], mood: 'cheer' };
    }
    if (/\b(tip|exam|marks)\b/.test(q)) {
      return { html: '<b>Exam tip:</b> ' + EXAM_TIPS[Math.floor(Math.random() * EXAM_TIPS.length)], mood: 'happy' };
    }
    for (const [keys, def] of GLOSSARY) {
      for (const a of keys.split('|')) {
        if (q.includes(a)) return { html: def, mood: 'happy' };
      }
    }
    return { html: 'Always remember: in our C syllabus, every program starts with <b><code>void main()</code></b> and statements end with <b><code>;</code></b>. Ask me anything about loops, conditions, or data types!', mood: 'happy' };
  }
};
