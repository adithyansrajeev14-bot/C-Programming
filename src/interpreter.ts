// @ts-nocheck
/* ===== Mini C interpreter for the Code Lab ===== */
export class CErr extends Error {
  line: number;
  kind: string;
  phase: string;
  constructor(msg: string, line?: number, kind?: string, phase?: string) {
    super(msg);
    this.line = line || 0;
    this.kind = kind || 'syntax';
    this.phase = phase || 'compile';
  }
}

const TYPEKW = new Set(['int', 'float', 'double', 'char', 'void', 'long', 'short', 'unsigned', 'signed', 'const']);
const KW = new Set([...TYPEKW, 'if', 'else', 'while', 'do', 'for', 'switch', 'case', 'default', 'break', 'continue', 'return', 'sizeof', 'struct', 'typedef', 'enum', 'static', 'goto']);
const OPS2 = ['++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '==', '!=', '<=', '>=', '&&', '||', '<<', '>>', '->'];
const OPS1 = '+-*/%=<>!&|^~?:;,(){}[].';
const ESC: Record<string, string> = { n: '\n', t: '\t', r: '\r', '0': '\0', a: '\x07', b: '\b', '\\': '\\', "'": "'", '"': '"' };
const esc = (c: string) => (ESC[c] !== undefined ? ESC[c] : c);

export function lex(src: string, defines: Record<string, string>, line0?: number, meta?: any) {
  const toks: any[] = [];
  let i = 0, line = line0 || 1;
  const n = src.length;
  const P = (t: string, v: any, x?: any) => toks.push(Object.assign({ t, v, line }, x || {}));

  while (i < n) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') {
      const s = line; i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; }
      if (i >= n) throw new CErr('unterminated /* comment', s);
      i += 2; continue;
    }
    if (c === '#') {
      let j = i; while (j < n && src[j] !== '\n') j++;
      const text = src.slice(i, j).trim();
      let m = /^#\s*define\s+([A-Za-z_]\w*)\s+(.*)$/.exec(text);
      if (m && defines) defines[m[1]] = m[2].trim();
      m = /^#\s*include\s*[<"]([^>"]+)[>"]/.exec(text);
      if (m && meta) meta.includes.add(m[1]);
      i = j; continue;
    }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
      let j = i, isF = false;
      if (c === '0' && /[xX]/.test(src[i + 1] || '')) {
        j = i + 2; while (j < n && /[0-9a-fA-F]/.test(src[j])) j++;
        P('num', parseInt(src.slice(i, j), 16), { f: false }); i = j;
        while (i < n && /[uUlL]/.test(src[i])) i++;
        continue;
      }
      while (j < n && /[0-9]/.test(src[j])) j++;
      if (src[j] === '.') { isF = true; j++; while (j < n && /[0-9]/.test(src[j])) j++; }
      if (/[eE]/.test(src[j] || '') && /[0-9+\-]/.test(src[j + 1] || '')) { isF = true; j += 2; while (j < n && /[0-9]/.test(src[j])) j++; }
      const v = parseFloat(src.slice(i, j)); i = j;
      if (/[fF]/.test(src[i] || '') && isF) i++; else while (i < n && /[uUlL]/.test(src[i])) i++;
      P('num', v, { f: isF }); continue;
    }
    if (c === "'") {
      let j = i + 1, ch;
      if (src[j] === '\\') { ch = esc(src[j + 1]); j += 2; } else { ch = src[j]; j++; }
      if (ch === undefined || src[j] !== "'") throw new CErr('malformed character constant', line);
      P('num', ch.charCodeAt(0), { f: false, ch: true }); i = j + 1; continue;
    }
    if (c === '"') {
      let j = i + 1, s = '';
      while (j < n && src[j] !== '"') {
        if (src[j] === '\n') throw new CErr('missing terminating " character', line);
        if (src[j] === '\\') { s += esc(src[j + 1]); j += 2; } else { s += src[j]; j++; }
      }
      if (j >= n) throw new CErr('missing terminating " character', line);
      P('str', s); i = j + 1; continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i; while (j < n && /\w/.test(src[j])) j++;
      const w = src.slice(i, j); i = j;
      if (defines && Object.prototype.hasOwnProperty.call(defines, w)) {
        const d2 = Object.assign({}, defines); delete d2[w];
        lex(defines[w], d2, line, meta).forEach((t) => { t.line = line; toks.push(t); });
        continue;
      }
      P(KW.has(w) ? 'kw' : 'id', w); continue;
    }
    let op = src.substr(i, 3);
    if (op === '<<=' || op === '>>=') { P('op', op); i += 3; continue; }
    op = src.substr(i, 2);
    if (OPS2.includes(op)) { P('op', op); i += 2; continue; }
    if (OPS1.includes(c)) { P('op', c); i++; continue; }
    throw new CErr("stray '" + c + "' in program", line);
  }
  return toks;
}

export function parse(toks: any[], exprOnly?: boolean) {
  let p = 0;
  const eof = { t: 'eof', v: 'end of file', line: toks.length ? toks[toks.length - 1].line : 1 };
  const peek = (k?: number) => toks[p + (k || 0)] || eof;
  const prevLine = () => (p > 0 ? toks[p - 1].line : 1);
  const isOp = (v: string, k?: number) => { const t = peek(k); return t.t === 'op' && t.v === v; };
  const isKw = (v: string, k?: number) => { const t = peek(k); return t.t === 'kw' && t.v === v; };
  const err = (msg: string, line?: number, kind?: string) => { throw new CErr(msg, line || peek().line, kind); };

  function expectOp(v: string, ctx?: string) {
    if (isOp(v)) return toks[p++];
    const f = peek();
    if (v === ';') err("expected ';' " + (ctx || 'at the end of the statement'), f.t === 'eof' ? f.line : prevLine(), 'semicolon');
    if (v === ')') err("expected ')' but found '" + f.v + "' " + (ctx || ''), prevLine(), 'paren');
    err("expected '" + v + "' but found '" + f.v + "'", f.line, 'expect');
  }

  const atType = () => peek().t === 'kw' && TYPEKW.has(peek().v);
  function parseType() {
    const ws: string[] = []; while (atType()) ws.push(toks[p++].v);
    if (ws.includes('double')) return 'double';
    if (ws.includes('float')) return 'float';
    if (ws.includes('char')) return 'char';
    if (ws.includes('void')) return 'void';
    if (ws.includes('long')) return 'long';
    return 'int';
  }
  const unsupported = (what: string, line: number) => err(what + ' are not supported in the Code Lab yet', line, 'unsupported');

  function parseDeclRest(type: string, name: string, line: number) {
    const items: any[] = [];
    for (;;) {
      if (isOp('[')) unsupported('Arrays', peek().line);
      let init = null;
      if (isOp('=')) { p++; init = parseAssign(); }
      items.push({ name, init, line });
      if (isOp(',')) {
        p++; if (isOp('*')) unsupported('Pointers', peek().line);
        const nt = peek(); if (nt.t !== 'id') err("expected a variable name but found '" + nt.v + "'", nt.line);
        name = toks[p++].v; continue;
      }
      break;
    }
    expectOp(';');
    return { k: 'decl', type, items, line };
  }

  function parseBlock(): any {
    const line = peek().line; expectOp('{'); const body: any[] = [];
    while (!isOp('}')) {
      if (peek().t === 'eof') err("expected '}' before the end of the file", peek().line, 'brace');
      body.push(parseStmt());
    }
    p++; return { k: 'block', body, line };
  }

  function parseStmt(): any {
    const t = peek(), line = t.line;
    if (t.t === 'op') {
      if (t.v === '{') return parseBlock();
      if (t.v === ';') { p++; return { k: 'empty', line }; }
    }
    if (t.t === 'kw') {
      switch (t.v) {
        case 'if': { p++; expectOp('('); const c = parseExpr(); expectOp(')', 'after the if condition'); const th = parseStmt(); let el = null; if (isKw('else')) { p++; el = parseStmt(); } return { k: 'if', c, th, el, line }; }
        case 'while': { p++; expectOp('('); const c = parseExpr(); expectOp(')', 'after the while condition'); const body = parseStmt(); return { k: 'while', c, body, line }; }
        case 'do': { p++; const body = parseStmt(); if (!isKw('while')) err("expected 'while' after the body of do", peek().line); p++; expectOp('('); const c = parseExpr(); expectOp(')'); expectOp(';'); return { k: 'dowhile', c, body, line }; }
        case 'for': {
          p++; expectOp('('); let init = null;
          if (isOp(';')) { p++; }
          else if (atType()) { const ty = parseType(); const nt = peek(); if (nt.t !== 'id') err('expected a variable name', nt.line); p++; init = parseDeclRest(ty, nt.v, line); }
          else { const e = parseExpr(); expectOp(';', 'inside the for(...) header'); init = { k: 'expr', e, line }; }
          let c = null; if (!isOp(';')) c = parseExpr(); expectOp(';', 'inside the for(...) header');
          let upd = null; if (!isOp(')')) upd = parseExpr(); expectOp(')', 'at the end of the for(...) header');
          const body = parseStmt(); return { k: 'for', init, c, upd, body, line };
        }
        case 'switch': {
          p++; expectOp('('); const e = parseExpr(); expectOp(')'); expectOp('{');
          const cases: any[] = []; let cur: any = null;
          while (!isOp('}')) {
            if (peek().t === 'eof') err("expected '}' before the end of the file", peek().line, 'brace');
            if (isKw('case')) { p++; const v = parseTernary(); expectOp(':'); cur = { test: v, body: [] }; cases.push(cur); }
            else if (isKw('default')) { p++; expectOp(':'); cur = { test: null, body: [] }; cases.push(cur); }
            else { if (!cur) err('a statement inside switch must come after a case label', peek().line); cur.body.push(parseStmt()); }
          }
          p++; return { k: 'switch', e, cases, line };
        }
        case 'break': p++; expectOp(';'); return { k: 'break', line };
        case 'continue': p++; expectOp(';'); return { k: 'continue', line };
        case 'return': { p++; let e = null; if (!isOp(';')) e = parseExpr(); expectOp(';'); return { k: 'return', e, line }; }
        case 'else': err("'else' without a matching 'if'", line, 'else');
        case 'struct': case 'typedef': case 'enum': case 'static': case 'goto': unsupported("'" + t.v + "'", line);
      }
      if (TYPEKW.has(t.v)) {
        const ty = parseType();
        if (isOp('*')) unsupported('Pointers', peek().line);
        const nt = peek(); if (nt.t !== 'id') err("expected a variable name but found '" + nt.v + "'", nt.line);
        p++; return parseDeclRest(ty, nt.v, line);
      }
    }
    const e = parseExpr(); expectOp(';'); return { k: 'expr', e, line };
  }

  function parseExpr(): any {
    let e = parseAssign();
    while (isOp(',')) { const line = peek().line; p++; const r = parseAssign(); e = { k: 'comma', a: e, b: r, line }; }
    return e;
  }

  const ASSIGN = new Set(['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=']);
  function parseAssign(): any {
    const l = parseTernary(); const t = peek();
    if (t.t === 'op' && ASSIGN.has(t.v)) {
      if (l.k !== 'id') err('the left side of = must be a variable', t.line, 'lvalue');
      p++; const r = parseAssign(); return { k: 'assign', op: t.v, name: l.name, r, line: t.line };
    }
    return l;
  }

  function parseTernary(): any {
    const c = parseBin(1);
    if (isOp('?')) { const line = peek().line; p++; const a = parseExpr(); expectOp(':'); const b = parseTernary(); return { k: 'cond', c, a, b, line }; }
    return c;
  }

  const PREC: Record<string, number> = { '||': 1, '&&': 2, '|': 3, '^': 4, '&': 5, '==': 6, '!=': 6, '<': 7, '>': 7, '<=': 7, '>=': 7, '<<': 8, '>>': 8, '+': 9, '-': 9, '*': 10, '/': 10, '%': 10 };
  function parseBin(minP: number): any {
    let l = parseUnary();
    for (;;) {
      const t = peek();
      if (t.t !== 'op' || !PREC[t.v] || PREC[t.v] < minP) break;
      p++; const r = parseBin(PREC[t.v] + 1);
      l = { k: 'bin', op: t.v, l, r, line: t.line };
    }
    return l;
  }

  function parseUnary(): any {
    const t = peek();
    if (t.t === 'op') {
      if (t.v === '-' || t.v === '+' || t.v === '!' || t.v === '~') { p++; return { k: 'un', op: t.v, e: parseUnary(), line: t.line }; }
      if (t.v === '++' || t.v === '--') { p++; const e = parseUnary(); if (e.k !== 'id') err('++ and -- need a variable', t.line, 'lvalue'); return { k: 'incdec', op: t.v, pre: true, name: e.name, line: t.line }; }
      if (t.v === '&') { p++; return { k: 'addr', e: parseUnary(), line: t.line }; }
      if (t.v === '*') unsupported('Pointers', t.line);
      if (t.v === '(' && peek(1).t === 'kw' && TYPEKW.has(peek(1).v)) { p++; const ty = parseType(); expectOp(')'); return { k: 'cast', type: ty, e: parseUnary(), line: t.line }; }
    }
    if (t.t === 'kw' && t.v === 'sizeof') {
      p++;
      if (isOp('(') && peek(1).t === 'kw' && TYPEKW.has(peek(1).v)) { p++; const ty = parseType(); expectOp(')'); return { k: 'sizeof', type: ty, line: t.line }; }
      return { k: 'sizeof', e: parseUnary(), line: t.line };
    }
    return parsePostfix();
  }

  function parsePostfix(): any {
    let e = parsePrimary();
    for (;;) {
      const t = peek();
      if (t.t === 'op' && (t.v === '++' || t.v === '--')) { if (e.k !== 'id') err('++ and -- need a variable', t.line, 'lvalue'); p++; e = { k: 'incdec', op: t.v, pre: false, name: e.name, line: t.line }; }
      else if (t.t === 'op' && t.v === '(' && e.k === 'id') {
        p++; const args: any[] = [];
        if (!isOp(')')) { do { args.push(parseAssign()); } while (isOp(',') && (p++, true)); }
        expectOp(')', 'after the function arguments'); e = { k: 'call', name: e.name, args, line: t.line };
      }
      else if (t.t === 'op' && t.v === '[') unsupported('Arrays', t.line);
      else break;
    }
    return e;
  }

  function parsePrimary(): any {
    const t = peek();
    if (t.t === 'num') { p++; return { k: 'num', v: t.v, f: t.f, line: t.line }; }
    if (t.t === 'str') { p++; let s = t.v; while (peek().t === 'str') s += toks[p++].v; return { k: 'str', v: s, line: t.line }; }
    if (t.t === 'id') { p++; return { k: 'id', name: t.v, line: t.line }; }
    if (t.t === 'op' && t.v === '(') { p++; const e = parseExpr(); expectOp(')', 'to close the bracket'); return e; }
    if (t.t === 'eof') err('the program ended unexpectedly', t.line, 'eof');
    err("expected a value or variable but found '" + t.v + "'", t.line, 'expr');
  }

  if (exprOnly) { const e = parseExpr(); if (peek().t !== 'eof') err("unexpected '" + peek().v + "'", peek().line); return e; }

  const funcs: Record<string, any> = {}, globals: any[] = [];
  while (peek().t !== 'eof') {
    let ty;
    if (atType()) ty = parseType();
    else if (peek().t === 'id' && isOp('(', 1)) ty = 'void';
    else err("expected a type like void or int but found '" + peek().v + "'", peek().line, 'type');
    if (isOp('*')) unsupported('Pointers', peek().line);
    const nt = peek(); if (nt.t !== 'id') err("expected a name but found '" + nt.v + "'", nt.line);
    p++;
    if (isOp('(')) {
      p++; const params: any[] = [];
      if (isKw('void') && isOp(')', 1)) p += 2;
      else if (isOp(')')) p++;
      else {
        do {
          if (!atType()) err('expected a parameter type', peek().line);
          const pt = parseType(); const pn = peek(); if (pn.t !== 'id') err('expected a parameter name', pn.line);
          p++; params.push({ type: pt, name: pn.v });
        } while (isOp(',') && (p++, true));
        expectOp(')');
      }
      const body = parseBlock(); funcs[nt.v] = { name: nt.v, ret: ty, params, body, line: nt.line };
    } else globals.push(parseDeclRest(ty, nt.v, nt.line));
  }
  return { funcs, globals };
}

const I = (v: number) => ({ v, f: false });
const F = (v: number) => ({ v, f: true });
function coerce(type: string, x: any) {
  const v = x.v;
  switch (type) {
    case 'int': return { v: (Number.isFinite(v) ? Math.trunc(v) : 0) | 0, f: false };
    case 'long': return { v: Number.isFinite(v) ? Math.trunc(v) : 0, f: false, l: true };
    case 'char': return { v: ((v | 0) << 24) >> 24, f: false };
    case 'float': return { v: Math.fround(v), f: true };
    case 'double': return { v: v, f: true };
  }
  return x;
}
const SIZES: Record<string, number> = { char: 1, int: 4, long: 8, float: 4, double: 8, void: 1 };
function bigStr(v: number) { v = Math.trunc(v); return Math.abs(v) < 1e21 ? String(v) : BigInt(v).toString(); }
function fmtVal(c: any) {
  const v = c.val.v;
  if (c.type === 'float' || c.type === 'double') return Number.isFinite(v) ? String(+v.toFixed(5)) : String(v);
  if (c.type === 'char') return v + (v >= 32 && v < 127 ? " ('" + String.fromCharCode(v) + "')" : '');
  return bigStr(v);
}
function fixed(v: number, d: number) {
  if (Number.isNaN(v)) return 'nan'; if (!Number.isFinite(v)) return v < 0 ? '-inf' : 'inf';
  return v.toFixed(Math.min(d, 100));
}
function expo(v: number, d: number, up?: boolean) {
  if (!Number.isFinite(v)) return fixed(v, 0);
  let s = v.toExponential(d).replace(/e([+-])(\d)$/, 'e$10$2');
  return up ? s.toUpperCase() : s;
}
function fmtG(v: number, prec: number) {
  if (!Number.isFinite(v)) return fixed(v, 0);
  if (prec === 0) prec = 1;
  if (v === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(v)));
  let s;
  if (e < -4 || e >= prec) s = v.toExponential(prec - 1).replace(/\.?0+e/, 'e').replace(/e([+-])(\d)$/, 'e$10$2');
  else s = String(+v.toPrecision(prec));
  return s;
}

export class Interp {
  funcs: Record<string, any>;
  gdecl: any[];
  meta: any;
  outStr: string;
  stdin: string;
  ip: number;
  steps: number;
  maxSteps: number;
  warnings: any[];
  warned: Set<string>;
  trace: any[];
  traceOn: boolean;
  depth: number;
  inputRanOut: boolean;
  scope: any;
  gscope: any;
  mainScope: any;

  constructor(prog: any, opts: any, meta?: any) {
    this.funcs = prog.funcs; this.gdecl = prog.globals; this.meta = meta || { includes: new Set(['stdio.h', 'math.h']) };
    this.outStr = ''; this.stdin = opts.stdin || ''; this.ip = 0; this.steps = 0; this.maxSteps = opts.maxSteps || 3000000;
    this.warnings = []; this.warned = new Set(); this.trace = []; this.traceOn = !!opts.trace; this.depth = 0; this.inputRanOut = false;
    this.scope = null; this.gscope = { vars: new Map(), parent: null }; this.mainScope = null;
  }
  warn(msg: string, line: number, key?: string) {
    const k = key || (msg + line); if (this.warned.has(k)) return; this.warned.add(k);
    this.warnings.push({ msg, line });
  }
  lookup(name: string, line: number) {
    for (let s = this.scope; s; s = s.parent) { const c = s.vars.get(name); if (c) return c; }
    throw new CErr("'" + name + "' is not declared (first use in this function). Declare it, for example: int " + name + ";", line, 'undeclared', 'runtime');
  }
  snap(line: number) {
    if (!this.traceOn || this.trace.length >= 600) return;
    const chain: any[] = []; for (let s = this.scope; s; s = s.parent) chain.push(s);
    const vars: Record<string, string> = {};
    for (let i = chain.length - 1; i >= 0; i--) for (const [k, c] of chain[i].vars) vars[k] = c.init ? fmtVal(c) : '?';
    this.trace.push({ line, vars, out: this.outStr.length });
  }
  tick(line: number) {
    if (++this.steps > this.maxSteps) throw new CErr('The program was stopped because it ran for too long (infinite loop?).', line, 'loop', 'runtime');
  }
  declare(name: string, type: string, val: any, init: boolean, line: number) {
    if (this.scope.vars.has(name)) throw new CErr("redeclaration of '" + name + "'", line, 'redecl');
    this.scope.vars.set(name, { type, val: val || coerce(type, I(0)), init });
  }
  ev(n: any): any {
    this.tick(n.line);
    switch (n.k) {
      case 'num': return { v: n.v, f: !!n.f };
      case 'str': return { s: n.v, v: 0, f: false };
      case 'id': { const c = this.lookup(n.name, n.line); if (!c.init) this.warn("'" + n.name + "' is used before it has a value", n.line, 'init' + n.name); return c.val; }
      case 'assign': {
        const c = this.lookup(n.name, n.line); const r = this.ev(n.r); let val = r;
        if (r.s !== undefined) throw new CErr('you cannot store a string in a ' + c.type + ' variable', n.line, 'strassign', 'runtime');
        if (n.op !== '=') { if (!c.init) this.warn("'" + n.name + "' is used before it has a value", n.line, 'init' + n.name); val = this.binop(n.op.slice(0, -1), c.val, r, n); }
        val = coerce(c.type, val); c.val = val; c.init = true; return val;
      }
      case 'incdec': {
        const c = this.lookup(n.name, n.line); if (!c.init) this.warn("'" + n.name + "' is used before it has a value", n.line, 'init' + n.name);
        const old = c.val; const nv = coerce(c.type, { v: old.v + (n.op === '++' ? 1 : -1), f: old.f }); c.val = nv; c.init = true; return n.pre ? nv : old;
      }
      case 'un': {
        const x = this.ev(n.e);
        switch (n.op) {
          case '-': return x.l ? { v: -x.v, f: false, l: true } : { v: x.f ? -x.v : (-x.v) | 0, f: x.f };
          case '+': return x;
          case '!': return I(x.v ? 0 : 1);
          case '~': return I(~x.v);
        }
        break;
      }
      case 'bin': {
        if (n.op === '&&') { const a = this.ev(n.l); if (!a.v) return I(0); return I(this.ev(n.r).v ? 1 : 0); }
        if (n.op === '||') { const a = this.ev(n.l); if (a.v) return I(1); return I(this.ev(n.r).v ? 1 : 0); }
        return this.binop(n.op, this.ev(n.l), this.ev(n.r), n);
      }
      case 'cond': return this.ev(n.c).v ? this.ev(n.a) : this.ev(n.b);
      case 'comma': this.ev(n.a); return this.ev(n.b);
      case 'cast': { const x = this.ev(n.e); return n.type === 'void' ? I(0) : coerce(n.type, x); }
      case 'sizeof': {
        if (n.type) return I(SIZES[n.type] || 4);
        if (n.e.k === 'id') { const c = this.lookup(n.e.name, n.line); return I(SIZES[c.type] || 4); }
        const x = this.ev(n.e); return I(x.f ? 8 : x.l ? 8 : 4);
      }
      case 'addr': throw new CErr("'&' can only be used inside scanf in the Code Lab", n.line, 'addr', 'runtime');
      case 'call': return this.call(n);
    }
    throw new CErr('cannot understand this expression', n.line);
  }
  binop(op: string, a: any, b: any, n: any) {
    if (a.s !== undefined || b.s !== undefined) throw new CErr('you cannot calculate with a string here', n.line, 'strop', 'runtime');
    const fl = a.f || b.f, lg = a.l || b.l, x = a.v, y = b.v;
    const R = (v: number) => (lg ? { v, f: false, l: true } : { v: v | 0, f: false });
    switch (op) {
      case '+': return fl ? F(x + y) : R(x + y);
      case '-': return fl ? F(x - y) : R(x - y);
      case '*': return fl ? F(x * y) : (lg ? R(x * y) : { v: Math.imul(x, y), f: false });
      case '/':
        if (fl) return F(x / y);
        if (y === 0) throw new CErr('Division by zero: dividing an integer by 0 crashes a C program.', n.line, 'divzero', 'runtime');
        return R(Math.trunc(x / y));
      case '%':
        if (fl) throw new CErr("the % operator works only with integers (int/char), not with float or double", n.line, 'modfloat', 'runtime');
        if (y === 0) throw new CErr('Division by zero: x % 0 crashes a C program.', n.line, 'divzero', 'runtime');
        return R((x % y) + 0);
      case '<': return I(x < y ? 1 : 0); case '>': return I(x > y ? 1 : 0);
      case '<=': return I(x <= y ? 1 : 0); case '>=': return I(x >= y ? 1 : 0);
      case '==': return I(x === y ? 1 : 0); case '!=': return I(x !== y ? 1 : 0);
      case '&': return I(x & y); case '|': return I(x | y); case '^': return I(x ^ y);
      case '<<': return I(x << y); case '>>': return I(x >> y);
    }
    throw new CErr('unknown operator ' + op, n.line);
  }
  out(s: string) { this.outStr += s; if (this.outStr.length > 200000) throw new CErr('The program printed too much output and was stopped.', 0, 'loop', 'runtime'); }
  call(n: any) {
    const nm = n.name;
    const need = (h: string) => { if (!this.meta.includes.has(h)) this.warn("'" + nm + "' needs #include <" + h + "> at the top of the program", n.line, 'inc' + nm); };
    switch (nm) {
      case 'printf': {
        const fa = n.args[0];
        if (!fa || fa.k !== 'str') throw new CErr('printf needs a format string in double quotes as its first argument', n.line, 'printf', 'runtime');
        need('stdio.h');
        const s = this.format(fa.v, n.args.slice(1).map((a: any) => this.ev(a)), n.line); this.out(s); return I(s.length);
      }
      case 'scanf': need('stdio.h'); return this.scanf(n);
      case 'getchar': { need('stdio.h'); if (this.ip >= this.stdin.length) { this.inputRanOut = true; return I(-1); } return I(this.stdin.charCodeAt(this.ip++)); }
      case 'putchar': { const a = this.ev(n.args[0]); this.out(String.fromCharCode(a.v & 255)); return a; }
      case 'puts': { const a = this.ev(n.args[0]); this.out((a.s !== undefined ? a.s : '') + '\n'); return I(1); }
    }
    const M1: Record<string, (x: number) => number> = { sqrt: Math.sqrt, fabs: Math.abs, floor: Math.floor, ceil: Math.ceil, sin: Math.sin, cos: Math.cos, tan: Math.tan, log: Math.log, log10: Math.log10, exp: Math.exp, round: (v) => (v < 0 ? -Math.round(-v) : Math.round(v)), asin: Math.asin, acos: Math.acos, atan: Math.atan, cbrt: Math.cbrt };
    if (M1[nm]) { need('math.h'); const a = this.ev(n.args[0]); return F(M1[nm](a.v)); }
    if (nm === 'pow') { need('math.h'); return F(Math.pow(this.ev(n.args[0]).v, this.ev(n.args[1]).v)); }
    if (nm === 'fmod') { need('math.h'); return F(this.ev(n.args[0]).v % this.ev(n.args[1]).v); }
    if (nm === 'abs') { need('stdlib.h'); return I(Math.abs(this.ev(n.args[0]).v) | 0); }
    const f = this.funcs[nm];
    if (!f) throw new CErr("the function '" + nm + "' does not exist", n.line, 'nofunc', 'runtime');
    if (n.args.length !== f.params.length) throw new CErr("function '" + nm + "' needs " + f.params.length + ' argument(s) but you gave ' + n.args.length, n.line, 'argcount', 'runtime');
    const vals = n.args.map((a: any) => this.ev(a));
    return this.callUser(f, vals);
  }
  callUser(f: any, vals: any[]) {
    if (++this.depth > 1500) throw new CErr('Stack overflow: infinite recursion', f.line, 'loop', 'runtime');
    const saved = this.scope; const sc = { vars: new Map(), parent: this.gscope }; this.scope = sc;
    if (f.name === 'main') this.mainScope = sc;
    f.params.forEach((pr: any, i: number) => this.declare(pr.name, pr.type, coerce(pr.type, vals[i]), true, f.line));
    let ret = null;
    try {
      for (const st of f.body.body) { const r = this.exec(st); if (r) { if (r.t === 'return') ret = r.v; break; } }
    } finally { this.scope = saved; this.depth--; }
    if (f.ret === 'void' || !ret) return I(0);
    return coerce(f.ret, ret);
  }
  format(f: string, args: any[], line: number) {
    let ai = 0, out = '', last = 0, m;
    const re = /%([-+ 0#]*)(\d+)?(?:\.(\d+))?(hh|h|ll|l|L|z)?([diuoxXfFeEgGcsp%])/g;
    while ((m = re.exec(f))) {
      out += f.slice(last, m.index); last = re.lastIndex;
      const conv = m[5]; if (conv === '%') { out += '%'; continue; }
      const flags = m[1] || '', width = m[2] ? +m[2] : 0, prec = m[3] !== undefined ? +m[3] : undefined;
      let a;
      if (ai >= args.length) { this.warn("printf has '%" + conv + "' but no value was given for it", line, 'pf' + line + conv + ai); a = I(0); } else a = args[ai++];
      let s = '';
      switch (conv) {
        case 'd': case 'i': {
          let v = a.v;
          if (a.f) { this.warn("'%" + conv + "' expects an int, but a float was given. Use %f.", line, 'mm' + line + ai); v = Math.trunc(v); }
          s = bigStr(v); if (v >= 0 && flags.includes('+')) s = '+' + s; else if (v >= 0 && flags.includes(' ')) s = ' ' + s; break;
        }
        case 'u': s = String(a.v >>> 0); break;
        case 'x': s = (a.v >>> 0).toString(16); break;
        case 'X': s = (a.v >>> 0).toString(16).toUpperCase(); break;
        case 'o': s = (a.v >>> 0).toString(8); break;
        case 'f': case 'F': {
          let v = a.v;
          if (!a.f) { this.warn("'%f' expects a float/double, but an int was given. Use %d.", line, 'mm' + line + ai); v = 0; }
          s = fixed(v, prec === undefined ? 6 : prec); if (v >= 0 && flags.includes('+')) s = '+' + s; break;
        }
        case 'e': case 'E': s = expo(a.v, prec === undefined ? 6 : prec, conv === 'E'); break;
        case 'g': case 'G': s = fmtG(a.v, prec === undefined ? 6 : prec); break;
        case 'c': s = String.fromCharCode(a.v & 255); break;
        case 's': s = a.s !== undefined ? a.s : '(null)'; if (prec !== undefined) s = s.slice(0, prec); break;
        case 'p': s = '0x7ffd5c0a1b2c'; break;
      }
      if (s.length < width) {
        if (flags.includes('-')) s = s.padEnd(width);
        else if (flags.includes('0') && 'diufFeEgGxXo'.includes(conv)) { const sg = /^[+\- ]/.test(s) ? s[0] : ''; s = sg + s.slice(sg.length).padStart(width - sg.length, '0'); }
        else s = s.padStart(width);
      }
      out += s;
    }
    out += f.slice(last);
    if (ai < args.length) this.warn('printf was given more values than format % signs', line, 'extra' + line);
    return out;
  }
  scanf(n: any) {
    const fa = n.args[0];
    if (!fa || fa.k !== 'str') throw new CErr('scanf needs a format string in double quotes', n.line, 'scanf', 'runtime');
    const f = fa.v, targets = n.args.slice(1); let ti = 0, assigned = 0, i = 0;
    const ws = (c: string) => /\s/.test(c);
    while (i < f.length) {
      const ch = f[i];
      if (ws(ch)) { while (this.ip < this.stdin.length && ws(this.stdin[this.ip])) this.ip++; i++; continue; }
      if (ch !== '%') { if (this.stdin[this.ip] === ch) { this.ip++; i++; continue; } return I(assigned); }
      const m = /^%(\*)?(\d+)?(hh|h|ll|l|L)?([diufFeEgGcsxXo%])/.exec(f.slice(i));
      if (!m) break;
      i += m[0].length; const conv = m[4];
      if (conv === '%') { while (this.ip < this.stdin.length && ws(this.stdin[this.ip])) this.ip++; if (this.stdin[this.ip] === '%') this.ip++; continue; }
      if (conv !== 'c') while (this.ip < this.stdin.length && ws(this.stdin[this.ip])) this.ip++;
      if (this.ip >= this.stdin.length) { this.inputRanOut = true; return I(assigned === 0 ? -1 : assigned); }
      let val: any; const rest = this.stdin.slice(this.ip);
      if (conv === 'c') val = I(this.stdin.charCodeAt(this.ip++));
      else if ('diuxXo'.includes(conv)) { const mm = /^[+-]?\d+/.exec(rest); if (!mm) return I(assigned); this.ip += mm[0].length; val = I(parseInt(mm[0], 10)); }
      else if ('fFeEgG'.includes(conv)) { const mm = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(rest); if (!mm) return I(assigned); this.ip += mm[0].length; val = F(parseFloat(mm[0])); }
      else throw new CErr("%s is not supported in the Code Lab yet", n.line, 'unsupported', 'runtime');
      if (m[1] === '*') continue;
      const t = targets[ti++];
      if (!t) { this.warn('scanf has more % signs than variables', n.line, 'sc' + n.line); break; }
      if (t.k !== 'addr' || t.e.k !== 'id') throw new CErr("scanf needs an & before the variable name, e.g. scanf(\"%d\", &x);", n.line, 'scanfamp', 'runtime');
      const c = this.lookup(t.e.name, n.line);
      c.val = coerce(c.type, val); c.init = true; assigned++;
    }
    return I(assigned);
  }
  exec(s: any): any {
    this.tick(s.line);
    switch (s.k) {
      case 'block': {
        const saved = this.scope; this.scope = { vars: new Map(), parent: saved };
        try { for (const st of s.body) { const r = this.exec(st); if (r) return r; } } finally { this.scope = saved; }
        return;
      }
      case 'decl':
        for (const it of s.items) {
          if (it.init) { const v = this.ev(it.init); if (v.s !== undefined) throw new CErr('cannot store string in ' + s.type, s.line, 'strassign', 'runtime'); this.declare(it.name, s.type, coerce(s.type, v), true, s.line); }
          else this.declare(it.name, s.type, null, false, s.line);
        }
        this.snap(s.line); return;
      case 'expr': this.ev(s.e); this.snap(s.line); return;
      case 'empty': return;
      case 'if': if (this.ev(s.c).v) return this.exec(s.th); else if (s.el) return this.exec(s.el); return;
      case 'while':
        while (this.ev(s.c).v) { const r = this.exec(s.body); if (r) { if (r.t === 'break') break; if (r.t === 'continue') continue; return r; } }
        return;
      case 'dowhile':
        do { const r = this.exec(s.body); if (r) { if (r.t === 'break') break; if (r.t === 'continue') continue; return r; } } while (this.ev(s.c).v);
        return;
      case 'for': {
        const saved = this.scope; this.scope = { vars: new Map(), parent: saved };
        try {
          if (s.init) this.exec(s.init);
          while (s.c ? this.ev(s.c).v : true) {
            const r = this.exec(s.body);
            if (r) { if (r.t === 'break') break; if (r.t !== 'continue') return r; }
            if (s.upd) { this.ev(s.upd); this.snap(s.line); }
          }
        } finally { this.scope = saved; }
        return;
      }
      case 'switch': {
        const v = this.ev(s.e).v; let idx = -1;
        for (let i = 0; i < s.cases.length; i++) { const c = s.cases[i]; if (c.test && this.ev(c.test).v === v) { idx = i; break; } }
        if (idx < 0) idx = s.cases.findIndex((c: any) => c.test === null);
        if (idx < 0) return;
        const saved = this.scope; this.scope = { vars: new Map(), parent: saved };
        try {
          for (let i = idx; i < s.cases.length; i++) for (const st of s.cases[i].body) { const r = this.exec(st); if (r) { if (r.t === 'break') return; return r; } }
        } finally { this.scope = saved; }
        return;
      }
      case 'break': return { t: 'break' };
      case 'continue': return { t: 'continue' };
      case 'return': return { t: 'return', v: s.e ? this.ev(s.e) : null };
    }
  }
}

export function run(src: string, opts?: any) {
  opts = opts || {};
  const meta = { includes: new Set() }; let interp: any = null;
  const res: any = { output: '', warnings: [], error: null, vars: [], trace: [], inputRanOut: false, steps: 0 };
  try {
    const toks = lex(src, {}, 1, meta);
    const prog = parse(toks);
    if (!prog.funcs.main) throw new CErr("there is no main() function. Every C program starts running from void main()", 1, 'nomain');
    interp = new Interp(prog, opts, meta);
    interp.scope = interp.gscope;
    for (const g of prog.globals) interp.exec(g);
    interp.callUser(prog.funcs.main, []);
  } catch (e: any) {
    if (e instanceof CErr) res.error = { msg: e.message, line: e.line, kind: e.kind, phase: e.phase };
    else if (e instanceof RangeError) res.error = { msg: 'The program used too much memory or too many nested calls.', line: 0, kind: 'loop', phase: 'runtime' };
    else throw e;
  }
  if (interp) {
    res.output = interp.outStr; res.warnings = interp.warnings; res.trace = interp.trace; res.inputRanOut = interp.inputRanOut; res.steps = interp.steps;
    const sc = interp.mainScope || interp.gscope;
    for (const [k, c] of sc.vars) res.vars.push({ name: k, type: c.type, value: c.init ? fmtVal(c) : '(no value yet)' });
  }
  return res;
}

export function evalExpr(src: string, preset?: any[]) {
  try {
    const toks = lex(src, {}, 1, { includes: new Set(['math.h', 'stdio.h']) });
    const node = parse(toks, true);
    const it = new Interp({ funcs: {}, globals: [] }, {});
    it.scope = it.gscope;
    (preset || []).forEach((d) => it.declare(d.name, d.type, coerce(d.type, d.f ? F(d.v) : I(d.v)), true, 1));
    const r = it.ev(node);
    const type = r.l ? 'long' : r.f ? 'float/double' : 'int';
    let vs = r.f ? fixed(r.v, 6) : String(r.v);
    if (r.f && vs.indexOf('.') >= 0) { vs = vs.replace(/0+$/, ''); if (vs.endsWith('.')) vs += '0'; }
    return { ok: true, value: vs, type, raw: r.v };
  } catch (e: any) {
    if (e instanceof CErr) return { ok: false, msg: e.message };
    return { ok: false, msg: 'Could not evaluate that expression.' };
  }
}

export const CInterp = { run, evalExpr };
