// @ts-nocheck
import './index.css';
import { CInterp } from './interpreter';
import {
  R, STARTER, HELLO_STARTER, SNIPS, escH, hl, code, bio, tip, trap, flow,
  LESSONS, ALGOS, PROGS, THEORY, CHALLENGES, GLOSSARY, JOKES, EXAM_TIPS
} from './data';
import { Celler, cellerSVG } from './celler';

const $ = (s: string, r?: any) => (r || document).querySelector(s);
const $$ = (s: string, r?: any) => [...(r || document).querySelectorAll(s)];

const store = {
  get(k: string) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
  set(k: string, v: any) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
};

let S = Object.assign({ xp: 0, lessons: {}, qs: {}, th: {}, ch: {}, qa: {}, quizBest: 0, theme: 'auto' }, store.get('cellc-v1') || {});
const save = () => store.set('cellc-v1', S);
const LEVELS = ['Zygote', 'Stem Cell', 'Neuron', 'Platelet', 'White Blood Cell', 'Organ', 'Organism', 'Ecosystem', 'C Master'];
const XPL = 150;
const lvl = () => Math.min(Math.floor(S.xp / XPL), LEVELS.length - 1);

let toastT: any;
function toast(t: string) {
  const el = $('#toast'); if (!el) return;
  el.textContent = t; el.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2100);
}

function confetti(n?: number) {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = document.createElement('div'); box.className = 'confetti';
  const cols = ['#7EE0C3', '#FF5C8A', '#FFC93C', '#6B4EFF', '#38BDF8'];
  for (let i = 0; i < (n || 50); i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + '%';
    p.style.background = cols[i % 5];
    p.style.animationDelay = Math.random() * 0.5 + 's';
    box.appendChild(p);
  }
  document.body.appendChild(box); setTimeout(() => box.remove(), 2700);
}

function award(n: number, why?: string) {
  const before = lvl(); S.xp += n; save(); toast('+' + n + ' XP' + (why ? ' · ' + why : '')); updateMe();
  if (lvl() > before) {
    setTimeout(() => {
      confetti(80);
      Celler.say('<b>Level up!</b> You are now a ' + LEVELS[lvl()] + '. Keep going!', 'cheer');
    }, 700);
  }
}

function prog() {
  const L = LESSONS.length, lDone = LESSONS.filter((l) => S.lessons[l.id] && S.lessons[l.id].done).length;
  const qIds = ALGOS.concat(PROGS).map((x) => x.id), qDone = qIds.filter((i) => S.qs[i]).length;
  const cDone = CHALLENGES.filter((c) => S.ch[c.id] && S.ch[c.id].done).length;
  const tDone = THEORY.filter((_, i) => S.th[i]).length;
  const ready = Math.round(100 * (0.25 * lDone / L + 0.25 * qDone / qIds.length + 0.30 * cDone / CHALLENGES.length + 0.10 * tDone / THEORY.length + 0.10 * (S.quizBest || 0) / 100));
  return { L, lDone, qTotal: qIds.length, qDone, cTotal: CHALLENGES.length, cDone, tTotal: THEORY.length, tDone, ready };
}

const NAV = [
  ['home', '🧭', 'Trail', 'Trail'],
  ['questions', '📝', 'Questions', 'Qs'],
  ['lab', '💻', 'Code Lab', 'Lab'],
  ['theory', '📚', 'Theory Q&A', 'Theory'],
  ['quiz', '🎯', 'Boss Quiz', 'Quiz'],
  ['cheat', '⚡', 'Cheat Sheet', 'Cheat']
];

const LOGO = '<svg viewBox="0 0 120 124" aria-hidden="true"><path d="M60 8c24 0 46 14 50 40 4 24-6 50-30 60-20 8-48 6-62-12C6 78 8 48 22 30 32 16 46 8 60 8z" fill="#7EE0C3" stroke="#1B2559" stroke-width="6"/><circle cx="86" cy="30" r="15" fill="#6B4EFF" stroke="#1B2559" stroke-width="5"/></svg>';

function buildShell() {
  const root = $('#root');
  if (!root) return;
  root.innerHTML =
    '<div class="topbar"><a class="logo" href="#/home">' + LOGO + 'Learn C</a><div class="row"><div class="xpchip" id="xpchip"></div><button class="theme" data-theme-toggle aria-label="Toggle dark mode">🌓</button></div></div>' +
    '<div class="app"><aside class="side"><a class="logo" href="#/home">' + LOGO + 'Learn C<br>with Celler</a><nav class="nav" aria-label="Main">' +
    NAV.map((n) => '<a href="#/' + n[0] + '" data-nav="' + n[0] + '"><span class="ic">' + n[1] + '</span>' + n[2] + '</a>').join('') +
    '</nav><div class="me" id="me"></div><button class="theme" data-theme-toggle style="margin-top:8px">🌓 Light / dark</button></aside><main class="main" id="main" tabindex="-1"></main></div>' +
    '<nav class="bottom" aria-label="Main">' + NAV.map((n) => '<a href="#/' + n[0] + '" data-nav="' + n[0] + '"><span class="ic">' + n[1] + '</span>' + n[3] + '</a>').join('') + '</nav>';
  updateMe();
}

function updateMe() {
  const l = lvl(), into = l >= LEVELS.length - 1 ? XPL : S.xp % XPL, pct = Math.round(100 * into / XPL);
  const me = $('#me');
  if (me) me.innerHTML = '<div class="lv">Level ' + (l + 1) + ': ' + LEVELS[l] + '</div><div class="bar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="Progress"><i style="width:' + pct + '%"></i></div><div class="small">' + S.xp + ' XP · ' + (l >= LEVELS.length - 1 ? 'max level!' : (XPL - into) + ' to next level') + '</div>';
  const chip = $('#xpchip');
  if (chip) chip.innerHTML = '⭐ ' + S.xp + ' XP · ' + LEVELS[l];
}

function applyTheme() {
  if (S.theme === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', S.theme);
}

function toggleTheme() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark' || (S.theme === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  S.theme = dark ? 'light' : 'dark'; save(); applyTheme();
}

function go(h: string) { if (location.hash === h) route(); else location.hash = h; }
function openLab(o: any) { Lab.preload = o; go('#/lab'); }

function route() {
  const h = location.hash.replace(/^#\/?/, '') || 'home';
  const parts = h.split('/'), name = parts[0], arg = parts[1];
  Lab.stopPlay && Lab.stopPlay();
  const main = $('#main');
  let nav = name;
  switch (name) {
    case 'lesson': viewLesson(main, arg); nav = 'home'; break;
    case 'questions': viewQuestions(main, arg); break;
    case 'theory': viewTheory(main); break;
    case 'lab': viewLab(main, arg); break;
    case 'quiz': viewQuiz(main); break;
    case 'cheat': viewCheat(main); break;
    default: viewHome(main); nav = 'home';
  }
  $$('[data-nav]').forEach((a: any) => {
    if (a.dataset.nav === nav) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
}

/* ===== HOME ===== */
function viewHome(main: any) {
  Celler.ctx = { view: 'home' };
  const P = prog(), next = LESSONS.find((l) => !(S.lessons[l.id] && S.lessons[l.id].done));
  const node = (l: any) => {
    const st = S.lessons[l.id], done = st && st.done;
    return '<a class="node' + (done ? ' done' : '') + '" href="#/lesson/' + l.id + '" style="--c:' + l.color + '"><span class="bub" aria-hidden="true">' + l.emoji + '</span><span><b>' + l.title + '</b><small>' + l.blurb + '</small></span><span class="st">' + (done ? '✓ ' + st.score + '/' + st.total : 'Start') + '</span></a>';
  };
  main.innerHTML =
    '<section class="hero"><div class="big bob">' + cellerSVG() + '</div><div><h1>Learn C with Celler &amp; void main() 🧬</h1><p>Every topic from your syllabus: simplified theory, ' + (ALGOS.length + PROGS.length) + ' solved questions using <b>void main()</b>, interactive Code Lab, and an <b>AI Tutor</b> powered by Gemini.</p><div class="row">' +
    (next ? '<a class="btn" href="#/lesson/' + next.id + '">Continue: ' + next.title + '</a>' : '<a class="btn" href="#/lab">Practise in Code Lab</a>') + '<a class="btn sec" href="#/lab">Open Code Lab</a></div></div></section>' +
    '<div class="stats"><div class="stat"><b>' + S.xp + '</b><span>XP earned</span></div><div class="stat"><b>' + LEVELS[lvl()] + '</b><span>Level</span></div><div class="stat"><b>' + P.lDone + '/' + P.L + '</b><span>Lessons</span></div><div class="stat"><b>' + P.qDone + '/' + P.qTotal + '</b><span>Questions</span></div><div class="stat"><b>' + P.cDone + '/' + P.cTotal + '</b><span>Lab Challenges</span></div></div>' +
    '<div class="ready"><div class="row" style="justify-content:space-between"><b>Exam readiness (with void main())</b><b>' + P.ready + '%</b></div><div class="bar" role="progressbar" aria-valuenow="' + P.ready + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + P.ready + '%"></i></div></div>' +
    '<div class="modh"><span>Module 1</span>Computers and C basics with void main()</div><div class="trail">' + LESSONS.filter((l) => l.mod === 1).map(node).join('') + '</div>' +
    '<div class="modh"><span>Module 2</span>Control structures &amp; loops</div><div class="trail">' + LESSONS.filter((l) => l.mod === 2).map(node).join('') + '</div>' +
    '<div class="modh">Practice zones</div><div class="zones"><a class="zone" href="#/questions"><b>📝 Solved questions</b><span>' + (ALGOS.length + PROGS.length) + ' solved questions with void main()</span></a><a class="zone" href="#/lab"><b>💻 Code Lab</b><span>Run &amp; test programs interactively</span></a><a class="zone" href="#/quiz"><b>🎯 Boss Quiz</b><span>Test your mastery</span></a></div>';
  Celler.say('Welcome! In our syllabus, every program starts with <b><code>void main()</code></b>. Tap me anytime for AI explanations or code debugging!', 'happy');
}

/* ===== QUIZ RUNNER ===== */
function runQuiz(box: any, items: any[], cb: any) {
  let i = 0; const res: boolean[] = [];
  function show() {
    const it = items[i];
    box.innerHTML = '<div class="qdots">' + items.map((_, k) => '<i class="' + (k < res.length ? (res[k] ? 'ok' : 'no') : k === i ? 'on' : '') + '"></i>').join('') + '</div>' +
      (it.tag ? '<div class="small">' + escH(it.tag) + '</div>' : '') + '<div class="q">' + escH(it.q) + '</div>' + (it.code ? '<pre class="plain">' + escH(it.code) + '</pre>' : '') +
      '<div class="opts">' + it.o.map((o: string, k: number) => '<button class="opt" data-k="' + k + '">' + escH(o) + '</button>').join('') + '</div><div id="qfb"></div>';
    $$('.opt', box).forEach((b: any) => { b.onclick = () => choose(+b.dataset.k); });
  }
  function choose(k: number) {
    const it = items[i], ok = k === it.a; res.push(ok);
    $$('.opt', box).forEach((b: any, j: number) => { b.disabled = true; if (j === it.a) b.classList.add('right'); else if (j === k) b.classList.add('wrong'); });
    $('#qfb', box).innerHTML = '<div class="why"><b>' + (ok ? 'Correct!' : 'Not quite.') + '</b> ' + escH(it.w) + '</div><div class="row" style="margin-top:12px"><button class="btn sm" id="qnext">' + (i < items.length - 1 ? 'Next question' : 'See result') + '</button></div>';
    if (cb.onAnswer) cb.onAnswer(ok, it, i);
    const nb = $('#qnext', box); nb.onclick = () => { if (i < items.length - 1) { i++; show(); } else cb.onFinish(res); }; nb.focus();
  }
  show();
}

/* ===== LESSON VIEW ===== */
function viewLesson(main: any, id: string) {
  const L = LESSONS.find((l) => l.id === id);
  if (!L) { viewHome(main); return; }
  Celler.ctx = { view: 'lesson', id: L.id };
  const idx = LESSONS.indexOf(L), prev = LESSONS[idx - 1], next = LESSONS[idx + 1];
  main.innerHTML = '<a class="back" href="#/home">← Back to trail</a>' +
    '<div class="lhead"><div class="em" style="--c:' + L.color + '" aria-hidden="true">' + L.emoji + '</div><div><h1 style="margin:0">' + L.title + '</h1><div class="small">Module ' + L.mod + ' · ' + L.blurb + '</div></div></div>' +
    L.sections.map((s) => '<section class="card sec"><h2>' + s.h + '</h2>' + s.html + '</section>').join('') +
    '<section class="card sec" id="quizcard"><h2>Check yourself 🎯</h2><div id="quizbox"></div></section>' +
    '<div class="lnav">' + (prev ? '<a class="btn sec" href="#/lesson/' + prev.id + '">← ' + prev.title + '</a>' : '<span></span>') + (next ? '<a class="btn sec" href="#/lesson/' + next.id + '">' + next.title + ' →</a>' : '<a class="btn sec" href="#/lab">Code Lab</a>') + '</div>';
  initWidgets(main);
  const box = $('#quizbox');
  startLessonQuiz(L, box, next);
}

function startLessonQuiz(L: any, box: any, next: any) {
  runQuiz(box, L.quiz, {
    onAnswer(ok: boolean) {
      if (ok) { Celler.say('Spot on! You are mastering this.', 'cheer', 3500); award(5); }
      else Celler.say('Not quite, read the explanation and keep going!', 'oops', 6000);
    },
    onFinish(res: boolean[]) {
      const sc = res.filter(Boolean).length;
      S.lessons[L.id] = { done: true, score: sc, total: res.length }; save();
      award(25, 'lesson complete');
      box.innerHTML = '<div class="score">' + sc + '/' + res.length + '</div><p>' + (sc === res.length ? 'Perfect score!' : 'Good effort! Review the cards and test again anytime.') + '</p><div class="row">' + (next ? '<a class="btn" href="#/lesson/' + next.id + '">Next: ' + next.title + '</a>' : '<a class="btn" href="#/questions">Solved questions</a>') + '</div>';
    }
  });
}

/* ===== WIDGETS ===== */
function initWidgets(root: any) {
  $$('[data-widget="idcheck"]', root).forEach((w: any) => {
    w.innerHTML = '<label for="idin"><b>Identifier checker.</b> Is this a valid C name?</label><input type="text" id="idin" value="total_marks" autocomplete="off" spellcheck="false"><div class="chips" id="idex"></div><div class="res" id="idres"></div>';
    const inp = $('#idin', w), res = $('#idres', w);
    const upd = () => {
      const v = inp.value.trim();
      const valid = /^[A-Za-z_]\w*$/.test(v) && !['int', 'void', 'float', 'char', 'if', 'else', 'while', 'for', 'switch'].includes(v);
      res.className = 'res ' + (valid ? 'ok' : 'no');
      res.textContent = valid ? '✅ Valid C identifier.' : '❌ Invalid identifier (no spaces, cannot start with digits, no keywords).';
    };
    $('#idex', w).innerHTML = ['sum', '2total', 'total_marks', 'int', '_count'].map((x) => '<button class="fchip" type="button">' + x + '</button>').join('');
    $('#idex', w).onclick = (e: any) => { if (e.target.matches('button')) { inp.value = e.target.textContent; upd(); } };
    inp.oninput = upd; upd();
  });

  $$('[data-widget="exprplay"]', root).forEach((w: any) => {
    w.innerHTML = '<label for="exin"><b>Expression playground</b></label><input type="text" id="exin" value="7 / 2 + 7 % 2" autocomplete="off" spellcheck="false"><div class="chips" id="exex"></div><div class="res" id="exres"></div>';
    const inp = $('#exin', w), res = $('#exres', w);
    const upd = () => {
      const r = CInterp.evalExpr(inp.value, [{ name: 'a', type: 'int', v: 7 }, { name: 'b', type: 'int', v: 2 }]);
      if (r.ok) { res.className = 'res ok'; res.textContent = '= ' + r.value + ' (' + r.type + ')'; }
      else { res.className = 'res no'; res.textContent = '⚠ ' + r.msg; }
    };
    $('#exex', w).innerHTML = ['7 / 2', '7 % 2', '5 / 9', '5.0 / 9'].map((x) => '<button class="fchip" type="button">' + escH(x) + '</button>').join('');
    $('#exex', w).onclick = (e: any) => { if (e.target.matches('button')) { inp.value = e.target.textContent; upd(); } };
    inp.oninput = upd; upd();
  });
}

/* ===== QUESTIONS VIEW ===== */
const ALLQ = ALGOS.map((a) => Object.assign({}, a, { kind: 'algo', tag: 'Algorithms' })).concat(PROGS.map((p) => Object.assign({}, p, { kind: 'prog', tag: p.topic })));
let QF = { f: 'all', s: '' };

function viewQuestions(main: any, arg?: string) {
  Celler.ctx = { view: 'questions' };
  const topics = ['all', 'Algorithms', 'Basics', 'if-else', 'switch', 'Loops'];
  main.innerHTML = '<h1>Solved Questions (with void main())</h1><p>Every algorithm and program from the curriculum, implemented strictly with <b>void main()</b>.</p>' +
    '<input class="search" id="qsearch" type="search" placeholder="Search questions (e.g. prime, loop, switch)..." value="' + escH(QF.s) + '"><div class="filters" id="qfilters">' +
    topics.map((t) => '<button class="fchip" data-f="' + t + '" aria-pressed="' + (QF.f === t) + '">' + (t === 'all' ? 'All' : t) + '</button>').join('') + '</div><div id="qlist"></div>';

  const list = () => {
    const s = QF.s.toLowerCase();
    const items = ALLQ.filter((it) => (QF.f === 'all' || it.tag === QF.f) && (!s || (it.title + ' ' + it.q).toLowerCase().includes(s)));
    $('#qlist').innerHTML = items.length ? items.map((it) => {
      const isAlgo = it.kind === 'algo';
      const body = isAlgo
        ? '<div class="row"><button class="btn sm sec" data-sol="' + it.id + '">Show solution</button></div><div class="sol" id="sol-' + it.id + '"><h4>Algorithm</h4><ol class="steps">' + it.steps.map((st: string) => '<li><span>' + st + '</span></li>').join('') + '</ol><h4>Flowchart</h4>' + flow(it.flow) + '</div>'
        : '<div class="row"><button class="btn sm" data-try="' + it.id + '">✍️ Run in Code Lab</button><button class="btn sm sec" data-sol="' + it.id + '">Show solution</button></div><div class="sol" id="sol-' + it.id + '">' + code(it.code, { input: it.input, title: it.title }) + '<p>' + it.walk + '</p></div>';
      return '<details class="qitem' + (S.qs[it.id] ? ' done' : '') + '" id="q-' + it.id + '"><summary><span class="tag">' + it.tag + '</span><span class="tt">' + it.title + '</span><span class="ck">✓</span></summary><div class="qbody"><div class="qq">' + it.q + '</div>' + body + '<div class="row" style="margin-top:12px"><button class="btn sm good" data-mast="' + it.id + '">' + (S.qs[it.id] ? '✓ Mastered' : '✓ Mark as understood') + '</button></div></div></details>';
    }).join('') : '<div class="card">No matching questions found.</div>';
  };
  list();
  $('#qsearch').oninput = (e: any) => { QF.s = e.target.value; list(); };
  $('#qfilters').onclick = (e: any) => {
    const b = e.target.closest('button'); if (!b) return;
    QF.f = b.dataset.f; $$('#qfilters button').forEach((x: any) => x.setAttribute('aria-pressed', String(x === b))); list();
  };
}

/* ===== THEORY VIEW ===== */
function viewTheory(main: any) {
  Celler.ctx = { view: 'theory' };
  main.innerHTML = '<h1>Theory Q&amp;A</h1><p>Model answers aligned with the <b>void main()</b> syllabus.</p>' +
    THEORY.map((t, i) => '<details class="qitem' + (S.th[i] ? ' done' : '') + '"><summary><span class="tag">Q' + (i + 1) + '</span><span class="tt">' + t.q + '</span><span class="ck">✓</span></summary><div class="qbody"><div style="margin-top:14px">' + t.a + '</div><div class="row" style="margin-top:14px"><button class="btn sm good" data-th="' + i + '">' + (S.th[i] ? '✓ Understood' : '✓ Mark as known') + '</button></div></div></details>').join('');
}

/* ===== CODE LAB VIEW ===== */
const Lab = {
  preload: null as any,
  ch: null as any,
  last: null as any,
  src: '',
  ti: 0,
  timer: null as any,
  stopPlay() { clearInterval(this.timer); this.timer = null; }
};

function viewLab(main: any, arg?: string) {
  const ch = CHALLENGES.find((c) => c.id === arg) || null;
  Lab.ch = ch; Lab.stopPlay();
  Celler.ctx = { view: 'lab', challenge: ch ? ch.id : null };

  const slot = ch ? ch.id : 'free';
  let initCode = STARTER, initIn = '';
  if (Lab.preload) {
    initCode = Lab.preload.code; initIn = Lab.preload.input || '';
  } else {
    const sv = store.get('lab:' + slot);
    initCode = sv ? sv.code : (ch ? STARTER : HELLO_STARTER);
    initIn = sv ? sv.input : (ch ? ch.tests[0].in : '');
  }
  Lab.preload = null;

  main.innerHTML = '<h1>Code Lab 💻</h1><p class="small">Write and test C programs with <b>void main()</b>. Click <b>Run</b> or press <b>Ctrl+Enter</b>.</p>' +
    '<div class="row"><select class="sel" id="labsel"><option value="">Free play</option>' +
    CHALLENGES.map((c, i) => '<option value="' + c.id + '"' + (ch && ch.id === c.id ? ' selected' : '') + '>Challenge ' + (i + 1) + ': ' + c.title + (S.ch[c.id] && S.ch[c.id].done ? ' ✓' : '') + '</option>').join('') +
    '</select><select class="sel" id="exsel"><option value="">Load syllabus example...</option>' + PROGS.map((p, i) => '<option value="' + i + '">' + (i + 1) + '. ' + p.title + '</option>').join('') + '</select><button class="btn sm sec" id="reset">Reset</button></div>' +
    (ch ? '<div class="task" style="margin-top:14px"><b>Challenge: ' + ch.title + '</b><p>' + ch.task + '</p><div class="row"><button class="btn sm sec" id="solbtn">Show solution</button></div><div id="solbox"></div></div>' : '') +
    '<div class="labgrid" style="margin-top:14px"><div><div class="editor"><div class="gut" id="gut"></div><div class="ew"><pre id="hlpre"></pre><textarea id="code" spellcheck="false" wrap="off"></textarea></div></div>' +
    '<div class="row" style="margin-top:12px"><button class="btn" id="run">▶ Run</button>' + (ch ? '<button class="btn good" id="check">✅ Check answer</button>' : '') + '<button class="btn sec" id="stepbtn" hidden>🔍 Step through</button></div></div>' +
    '<div><div class="lbl">Input (Keyboard stdin)</div><textarea id="stdin" class="stdin" placeholder="e.g. 7 5"></textarea><div class="lbl">Output (Screen stdout)</div><div class="console" id="out"><span class="dim">Output appears here...</span></div><div id="feedback"></div><div id="varsbox"></div></div></div><div id="stepper"></div>';

  const ta = $('#code') as HTMLTextAreaElement;
  const pre = $('#hlpre');
  const gut = $('#gut');
  const stdin = $('#stdin') as HTMLTextAreaElement;
  const out = $('#out');
  const fb = $('#feedback');

  ta.value = initCode; stdin.value = initIn;
  const sync = () => { pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; gut.scrollTop = ta.scrollTop; };
  const updEd = (errLine?: number) => {
    const lines = ta.value.split('\n');
    pre.innerHTML = lines.map((l, i) => '<div class="ln' + (i + 1 === errLine ? ' err' : '') + '">' + (hl(l) || ' ') + '</div>').join('');
    gut.innerHTML = lines.map((_, i) => '<div class="' + (i + 1 === errLine ? 'err' : '') + '">' + (i + 1) + '</div>').join('');
    sync();
  };
  const persist = () => store.set('lab:' + slot, { code: ta.value, input: stdin.value });
  updEd();

  ta.addEventListener('input', () => { updEd(); persist(); });
  ta.addEventListener('scroll', sync);
  stdin.addEventListener('input', persist);

  ta.addEventListener('keydown', (e: any) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); doRun(); }
  });

  function doRun() {
    Lab.stopPlay(); $('#stepper').innerHTML = '';
    const r = CInterp.run(ta.value, { stdin: stdin.value, trace: true });
    Lab.last = r; Lab.src = ta.value;
    updEd(r.error && r.error.line);
    out.innerHTML = r.output ? escH(r.output) : (r.error ? '' : '<span class="dim">(program ran but printed nothing)</span>');
    let h = '';
    if (r.error) {
      h += '<div class="msg err"><b>' + r.error.msg + '</b>' + (r.error.line ? ' on line ' + r.error.line : '') + '<div style="margin-top:6px">🧬 <b>Celler:</b> Make sure you are using <code>void main()</code> and all brackets/semicolons match.</div></div>';
    }
    r.warnings.forEach((w: any) => { h += '<div class="msg warn"><b>Warning:</b> ' + escH(w.msg) + '</div>'; });
    fb.innerHTML = h;
    $('#varsbox').innerHTML = r.vars.length ? '<div class="lbl">Variables</div><div class="vars">' + r.vars.map((v: any) => '<div class="var">' + v.name + ' = ' + escH(v.value) + '</div>').join('') + '</div>' : '';
    $('#stepbtn').hidden = !(r.trace && r.trace.length > 1);
  }

  $('#run').onclick = doRun;
  $('#reset').onclick = () => {
    ta.value = ch ? STARTER : HELLO_STARTER;
    stdin.value = ch ? ch.tests[0].in : '';
    updEd(); persist(); fb.innerHTML = ''; out.innerHTML = '';
  };

  $('#labsel').onchange = (e: any) => { go(e.target.value ? '#/lab/' + e.target.value : '#/lab'); };
  $('#exsel').onchange = (e: any) => {
    if (e.target.value === '') return;
    const p = PROGS[+e.target.value];
    ta.value = p.code; stdin.value = p.input;
    updEd(); persist(); fb.innerHTML = ''; out.innerHTML = '';
    e.target.value = '';
  };

  if (ch) {
    $('#solbtn').onclick = () => {
      $('#solbox').innerHTML = '<div class="codebox"><pre><code>' + hl(ch.sol.trim()) + '</code></pre></div>';
    };
    $('#check').onclick = () => {
      let pass = true;
      for (const t of ch.tests) {
        const r = CInterp.run(ta.value, { stdin: t.in });
        if (r.error) { pass = false; break; }
        for (const tok of t.out) {
          if (!r.output.toLowerCase().includes(tok.toLowerCase())) { pass = false; break; }
        }
      }
      if (pass) {
        S.ch[ch.id] = { done: true }; save(); award(30, 'challenge passed');
        confetti(60);
        fb.innerHTML = '<div class="msg ok"><b>🎉 All tests passed!</b> Solution strictly follows void main().</div>';
      } else {
        fb.innerHTML = '<div class="msg err"><b>Tests not passed yet.</b> Verify your logic or check with Celler AI tutor!</div>';
      }
    };
  }
}

/* ===== BOSS QUIZ VIEW ===== */
function viewQuiz(main: any) {
  Celler.ctx = { view: 'quiz' };
  main.innerHTML = '<h1>Boss Quiz 🎯</h1><p>Test your C knowledge across all lessons. Score tracked for exam readiness.</p><div class="card" id="qbox"><button class="btn" id="startquiz">Start 10-Question Quiz</button></div>';
  $('#startquiz').onclick = () => {
    const allQuiz: any[] = [];
    LESSONS.forEach((l) => l.quiz.forEach((q) => allQuiz.push(Object.assign({}, q, { tag: l.title }))));
    const items = allQuiz.sort(() => 0.5 - Math.random()).slice(0, 10);
    runQuiz($('#qbox'), items, {
      onAnswer(ok: boolean) { if (ok) award(5); },
      onFinish(res: boolean[]) {
        const sc = res.filter(Boolean).length;
        const pct = Math.round(100 * sc / res.length);
        if (pct > (S.quizBest || 0)) { S.quizBest = pct; save(); }
        $('#qbox').innerHTML = '<div class="score">' + sc + '/' + res.length + ' (' + pct + '%)</div><p>' + (pct >= 80 ? 'Excellent! You are exam ready.' : 'Keep practicing with void main()!') + '</p><div class="row"><button class="btn" onclick="location.reload()">Try again</button></div>';
      }
    });
  };
}

/* ===== CHEAT SHEET VIEW ===== */
function viewCheat(main: any) {
  Celler.ctx = { view: 'cheat' };
  main.innerHTML = '<h1>Cheat Sheet ⚡</h1><p>Quick reference guide for the <b>void main()</b> syllabus.</p><div class="cgrid">' +
    '<div class="card"><h3>C Program Template</h3>' + code(R`
#include <stdio.h>

void main()
{
    int a, b;
    printf("Enter two numbers: ");
    scanf("%d %d", &a, &b);
    printf("Sum = %d", a + b);
}`, { title: 'Template' }) + '</div>' +
    '<div class="card"><h3>Format Specifiers</h3><table class="tbl"><tr><th>Type</th><th>printf</th><th>scanf</th></tr><tr><td>int</td><td>%d</td><td>%d</td></tr><tr><td>float</td><td>%f</td><td>%f</td></tr><tr><td>char</td><td>%c</td><td>" %c"</td></tr></table></div>' +
    '<div class="card"><h3>Common Exam Mistakes</h3><ul><li>Using single <code>=</code> in <code>if (x == 5)</code></li><li>Forgetting <code>&amp;</code> in <code>scanf("%d", &amp;x)</code></li><li>Missing <code>break;</code> in switch cases</li><li>Missing semicolon <code>;</code></li><li>Integer division: <code>5 / 9 = 0</code></li></ul></div>' +
    '<div class="card"><h3>Exam Checklist</h3><ol class="steps"><li>Include <code>#include &lt;stdio.h&gt;</code></li><li>Write <code>void main()</code></li><li>Declare variables with proper data types</li><li>End statements with semicolon <code>;</code></li></ol></div></div>';
}

/* ===== GLOBAL EVENT DELEGATION ===== */
document.addEventListener('click', (e: any) => {
  const t = e.target;
  const snip = t.closest('[data-snip]');
  if (snip) { const s = SNIPS[+snip.dataset.snip]; openLab({ code: s.code, input: s.input }); return; }
  if (t.closest('[data-theme-toggle]')) { toggleTheme(); return; }
  const sol = t.closest('[data-sol]');
  if (sol) {
    const box = $('#sol-' + sol.dataset.sol);
    if (box) box.classList.toggle('show');
    return;
  }
  const tryBtn = t.closest('[data-try]');
  if (tryBtn) {
    const p = PROGS.find((x) => x.id === tryBtn.dataset.try);
    if (p) openLab({ code: p.code, input: p.input });
    return;
  }
  const mast = t.closest('[data-mast]');
  if (mast) {
    const id = mast.dataset.mast;
    S.qs[id] = true; save(); award(10, 'mastered');
    mast.textContent = '✓ Mastered';
    const itm = mast.closest('.qitem'); if (itm) itm.classList.add('done');
    return;
  }
  const th = t.closest('[data-th]');
  if (th) {
    const i = th.dataset.th;
    S.th[i] = true; save(); award(5, 'theory known');
    th.textContent = '✓ Understood';
    const itm = th.closest('.qitem'); if (itm) itm.classList.add('done');
  }
});

function init() {
  applyTheme();
  buildShell();
  Celler.init();
  window.addEventListener('hashchange', route);
  route();
}

init();
