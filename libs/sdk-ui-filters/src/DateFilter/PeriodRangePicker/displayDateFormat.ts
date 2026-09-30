// (C) 2026 GoodData Corporation

// date-fns patterns: a token is a run of one letter; '…' is literal text ('' escapes a quote)
const LITERAL_OR_YEAR = /''|'(?:''|[^'])*(?:'|$)|y+/g;

/**
 * Rewrites a date-fns pattern into the spelling shown to the user: year runs become `YYYY` (`yy`
 * stays two letters as `YY`) and quoted literals become the plain text the field expects. Every
 * other token is left untouched.
 *
 * @remarks
 * Display-only: the pattern handed to date-fns `format`/`parse` stays the original one.
 */
export function toDisplayDateFormat(pattern: string): string {
    return pattern.replace(LITERAL_OR_YEAR, (m) => {
        if (m === "''") {
            return "'";
        }
        if (m.startsWith("'")) {
            return m.replace(/^'|'$/g, "").replace(/''/g, "'");
        }
        return m.length === 2 ? "YY" : "YYYY";
    });
}
