/**
 * Template renderer (V8 / GAS)
 * string literal supports " and '
 */
class Template {
  /* =========================
   * Static facade
   * ========================= */
  static render(template, data) {
    return new Template(template).render(data);
  }

  /* =========================
   * Built-in & user filters
   * ========================= */
  static filters = {
    number(v) {
      if (typeof v !== "number") return v;
      return v.toLocaleString("en-US");
    },

    json(v) {
      try {
        return JSON.stringify(v);
      } catch {
        return "";
      }
    },

    string(v) {
      return v == null ? "" : String(v);
    },
  };

  static registerFilter(name, fn) {
    if (
      typeof name !== "string" ||
      !name ||
      typeof fn !== "function"
    ) {
      return;
    }
    this.filters[name] = fn;
  }

  /* =========================
   * Constructor
   * ========================= */
  constructor(template) {
    this.template = template;
    this.cache = new Map();
    this.parts = this.parse(template);
  }

  /* =========================
   * Patterns
   * ========================= */
  static placeholderPattern = /(\\*)\{\{\{([\s\S]*?)\}\}\}/g;

  // "string" | 'string' | || | | | any char
  static operatorOrTokenPattern =
    /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\|\||\||[\s\S]/g;

  // identifier | ["string"] | ['string'] | [number]
  static keySegmentPattern =
    /(?:^|\.)([^\s.\[\]]+)|\[\s*(("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|-?(?:0|[1-9]\d*)(?:\.\d+)?)\s*)\]/g;

  static numberLiteralPattern =
    /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;

  /* =========================
   * Parse template
   * ========================= */
  parse(template) {
    const parts = [];
    let last = 0;

    for (const m of template.matchAll(Template.placeholderPattern)) {
      if (m.index > last) {
        parts.push({ type: "text", value: template.slice(last, m.index) });
      }
      parts.push({
        type: "placeholder",
        backslashes: m[1],
        expression: m[2].trim(),
      });
      last = m.index + m[0].length;
    }

    if (last < template.length) {
      parts.push({ type: "text", value: template.slice(last) });
    }

    return parts;
  }

  /* =========================
   * Compile (cached)
   * ========================= */
  compile(expression) {
    if (this.cache.has(expression)) return this.cache.get(expression);
    const fn = this.buildExpression(expression);
    this.cache.set(expression, fn);
    return fn;
  }

  /* =========================
   * Helpers
   * ========================= */
  parseStringLiteral(token) {
    if (token.startsWith('"')) {
      try {
        return JSON.parse(token);
      } catch {
        return undefined;
      }
    }

    if (token.startsWith("'")) {
      const inner = token.slice(1, -1);
      const json = `"${inner
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')}"`;

      try {
        return JSON.parse(json);
      } catch {
        return undefined;
      }
    }

    return undefined;
  }

  applyFilters(value, filterNames) {
    let v = value;
    for (const f of filterNames) {
      const fn = Template.filters[f];
      if (typeof fn === "function") {
        v = fn(v);
      }
    }
    return v;
  }

  /* =========================
   * Build expression
   * ========================= */
  buildExpression(expression) {
    /* ---- split by || ---- */
    const terms = [];
    let buffer = "";

    for (const m of expression.matchAll(
      Template.operatorOrTokenPattern
    )) {
      const t = m[0];
      if (t === "||") {
        const s = buffer.trim();
        if (s) terms.push(s);
        buffer = "";
      } else {
        buffer += t;
      }
    }
    {
      const s = buffer.trim();
      if (s) terms.push(s);
    }

    /* ---- compile terms ---- */
    const compiled = terms.map((rawTerm) => {
      /* ---- split by | (filters) ---- */
      const segments = rawTerm.split("|").map(s => s.trim());
      const term = segments.shift();
      const filters = segments;

      /* number literal */
      if (Template.numberLiteralPattern.test(term)) {
        const n = Number(term);
        return () => this.applyFilters(n, filters);
      }

      /* string literal */
      if (term.startsWith('"') || term.startsWith("'")) {
        const v = this.parseStringLiteral(term);
        return () => this.applyFilters(v, filters);
      }

      /* key reference */
      const path = [];
      let valid = true;

      for (const m of term.matchAll(Template.keySegmentPattern)) {
        const identifier = m[1];
        const bracket = m[2];

        if (identifier) {
          path.push(identifier);
        } else {
          let key;
          if (bracket.startsWith('"') || bracket.startsWith("'")) {
            key = this.parseStringLiteral(bracket);
          } else {
            key = Number(bracket);
          }

          if (key === undefined) {
            valid = false;
            break;
          }

          path.push(key);
        }
      }

      if (valid) {
        const rest = term
          .replace(Template.keySegmentPattern, "")
          .replace(/[.\s]/g, "");
        if (rest.length !== 0) valid = false;
      }

      if (!valid || path.length === 0) {
        return () => undefined;
      }

      return (data) => {
        let acc = data;
        for (const key of path) {
          if (acc == null) return undefined;

          const t = typeof acc;
          if (t !== "object" && t !== "function") {
            return undefined;
          }

          const v = acc[key];
          if (v === undefined) return undefined;
          acc = v;
        }

        return this.applyFilters(acc, filters);
      };
    });

    /* ---- fallback evaluation ---- */
    return (data) => {
      for (const fn of compiled) {
        const v = fn(data);

        if (v === undefined || v === null || v === "") {
          continue;
        }

        return v;
      }
      return "";
    };
  }

  /* =========================
   * Render
   * ========================= */
  render(data) {
    let out = "";

    for (const p of this.parts) {
      if (p.type === "text") {
        out += p.value;
        continue;
      }

      if (p.backslashes.length % 2 === 1) {
        out += p.backslashes.slice(1) + "{{{" + p.expression + "}}}";
      } else {
        out +=
          p.backslashes +
          String(this.compile(p.expression)(data));
      }
    }

    return out;
  }
}
