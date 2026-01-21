/**
 * Template renderer (V8/GAS)
 *
 * Placeholder:
 *   - {{{ ... }}}  : evaluated
 *   - \{{{ ... }}} : NOT evaluated, rendered as literal {{{ ... }}}
 *
 * Expression:
 *   - key reference: dot + bracket (nestable)
 *       user.profile.name
 *       user["profile"].name
 *       ["売上\n前年差"]["合計"]
 *   - string literal: JSON string syntax
 *       "text", "a\nb", "\"quote\""
 *   - default: A || B || "x"
 *       (fallback only when value is undefined or null)
 *
 * Naming rule applied:
 *   - local variables: 1-letter, must be the initial of the full intended name
 *   - no abbreviations for the full intended name (e.g., no "expr", "seg", "tmp")
 */
const render = (() => {
  // Patterns (named clearly; not “RE_*” abbreviations)
  const placeholderPattern = /(?<!\\)\{\{\{([\s\S]*?)\}\}\}/g;
  const operatorOrTokenPattern = /"(?:\\.|[^"\\])*"|\|\||[\s\S]/g;
  const keySegmentPattern = /(?:^|\.)([^\s.\[\]]+)|\[\s*("(?:\\.|[^"\\])*")\s*\]/g;

  // Cache compiled expression functions by expression text
  const compilationCache = new Map();

  const compileExpression = (e) => {
    if (compilationCache.has(e)) return compilationCache.get(e);

    // Split by || outside string literals (regex-first tokenization)
    const t = [];
    let b = "";
    for (const m of e.matchAll(operatorOrTokenPattern)) {
      const o = m[0];
      if (o === "||") {
        const s = b.trim();
        if (s) t.push(s);
        b = "";
      } else {
        b += o;
      }
    }
    {
      const s = b.trim();
      if (s) t.push(s);
    }

    // Compile each term to a function(data) => value
    const f = t.map((s) => {
      // string literal (JSON string)
      if (s.startsWith('"')) {
        let v;
        try {
          v = JSON.parse(s);
        } catch {
          // invalid string literal => treat as undefined
          v = undefined;
        }
        return () => v;
      }

      // key reference => pre-parse path
      const k = [];
      let g = true; // goodSyntax

      for (const m of s.matchAll(keySegmentPattern)) {
        const i = m[1]; // identifier
        const j = m[2]; // jsonString
        if (i) {
          k.push(i);
        } else {
          try {
            k.push(JSON.parse(j));
          } catch {
            g = false;
            break;
          }
        }
      }

      // Validate: after removing key segments, only dots/whitespace should remain
      if (g) {
        const r = s.replace(keySegmentPattern, "").replace(/[.\s]/g, "");
        if (r.length !== 0) g = false;
      }

      if (!g || k.length === 0) return () => undefined;

      return (d) => {
        let a = d; // accumulator
        for (const p of k) {
          if (a == null) return undefined;
          const v = a[p];
          if (v === undefined) return undefined;
          a = v;
        }
        return a;
      };
    });

    // Build final expression function with nullish fallback (undefined/null only)
    const c = (d) => {
      for (const x of f) {
        const v = x(d);
        if (v !== undefined && v !== null) return v;
      }
      return "";
    };

    compilationCache.set(e, c);
    return c;
  };

  return (template, data) =>
    template
      .replace(placeholderPattern, (_, e) => String(compileExpression(e.trim())(data)))
      // unescape escaped placeholders: \{{{ -> {{{
      .replace(/\\\{\{\{/g, "{{{");
})();

/* ===========================
 * Example
 * ===========================
 *
 * const data = {
 *   user: { profile: { name: "Alice" } },
 *   "売上\n前年差": { "合計": 120 },
 *   "A||B": "OK"
 * };
 *
 * const template = `
 * 名前: {{{user.profile.name || "N/A"}}}
 * 売上: {{{["売上\\n前年差"]["合計"] || "0"}}}
 * キー: {{{["A||B"] || "NG"}}}
 * エスケープ: \\{{{展開されない}}}
 * `;
 *
 * console.log(render(template, data));
 */
