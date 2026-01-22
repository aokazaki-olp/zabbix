/**
 * Template renderer (V8 / GAS)
 * string literal supports " and '
 */
class Template {
  /* =========================
   * Static facade
   * ========================= */
  static render(template, data, filters) {
    return new Template(template, filters).render(data);
  }

  /* =========================
   * Constructor
   * ========================= */
  constructor(template, filters = {}) {
    this.template = template;
    this.cache = new Map();
    this.parts = this.parse(template);

    // primitive filters (always available)
    this.filters = {
      string(v) {
        return v == null ? "" : String(v);
      },

      number(v) {
        if (typeof v !== "number") return v;
        return v.toLocaleString("en-US");
      },

      json(v) {
        try {
          return JSON.stringify(v);
        } catch {
          return "{}";
        }
      },

      // user / common filters
      ...filters,
    };
  }

  /* =========================
   * Register filter (instance)
   * ========================= */
  registerFilter(name, fn) {
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
   * Normalize (for cache key)
   * ========================= */
  normalizeExpression(expr) {
    return expr
      .trim()
      .replace(/\s+/g, " ");
  }

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
   * Compile (cached, minified)
   * ========================= */
  compile(expression) {
    const key = this.normalizeExpression(expression);

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const fn = this.buildExpression(expression);
    this.cache.set(key, fn);
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
      const fn = this.filters[f];
      if (typeof fn === "function") {
        v = fn(v);
      }
    }
    return v;
  }

  /* =========================
   * Safe split for filters
   * ========================= */
  splitByFilter(rawTerm) {
    const segments = [];
    let buffer = "";

    for (const m of rawTerm.matchAll(
      Template.operatorOrTokenPattern
    )) {
      const t = m[0];

      if (t === "|") {
        segments.push(buffer.trim());
        buffer = "";
      } else {
        buffer += t;
      }
    }

    if (buffer.trim()) {
      segments.push(buffer.trim());
    }

    return segments;
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
      const segments = this.splitByFilter(rawTerm);
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
