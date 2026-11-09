// (C) 2026 GoodData Corporation

/*!
 * Portions of this file are derived from Lodash.
 * https://github.com/lodash/lodash
 *
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 *
 * Based on Underscore.js, copyright Jeremy Ashkenas,
 * DocumentCloud and Investigative Reporters & Editors <http://underscorejs.org/>
 *
 * Modifications Copyright (c) 2026 GoodData Corporation
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/** Used to compose unicode character classes. */
const RS_ASTRAL_RANGE = "\\ud800-\\udfff";
const RS_COMBO_RANGE = "\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff";
const RS_DINGBAT_RANGE = "\\u2700-\\u27bf";
const RS_LOWER_RANGE = "a-z\\xdf-\\xf6\\xf8-\\xff";
const RS_MATH_OP_RANGE = "\\xac\\xb1\\xd7\\xf7";
const RS_NON_CHAR_RANGE = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf";
const RS_PUNCTUATION_RANGE = "\\u2000-\\u206f";
const RS_SPACE_RANGE =
    " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000";
const RS_UPPER_RANGE = "A-Z\\xc0-\\xd6\\xd8-\\xde";
const RS_VAR_RANGE = "\\ufe0e\\ufe0f";
const RS_BREAK_RANGE = RS_MATH_OP_RANGE + RS_NON_CHAR_RANGE + RS_PUNCTUATION_RANGE + RS_SPACE_RANGE;

/** Used to compose unicode capture groups. */
const RS_APOS = "['’]";
const RS_ASTRAL = `[${RS_ASTRAL_RANGE}]`;
const RS_BREAK = `[${RS_BREAK_RANGE}]`;
const RS_COMBO = `[${RS_COMBO_RANGE}]`;
const RS_DIGITS = "\\d+";
const RS_DINGBAT = `[${RS_DINGBAT_RANGE}]`;
const RS_LOWER = `[${RS_LOWER_RANGE}]`;
const RS_MISC = `[^${RS_ASTRAL_RANGE}${RS_BREAK_RANGE}${RS_DIGITS}${RS_DINGBAT_RANGE}${RS_LOWER_RANGE}${RS_UPPER_RANGE}]`;
const RS_FITZ = "\\ud83c[\\udffb-\\udfff]";
const RS_MODIFIER = `(?:${RS_COMBO}|${RS_FITZ})`;
const RS_NON_ASTRAL = `[^${RS_ASTRAL_RANGE}]`;
const RS_REGIONAL = "(?:\\ud83c[\\udde6-\\uddff]){2}";
const RS_SURR_PAIR = "[\\ud800-\\udbff][\\udc00-\\udfff]";
const RS_UPPER = `[${RS_UPPER_RANGE}]`;
const RS_ZWJ = "\\u200d";

/** Used to compose unicode regexes. */
const RS_MISC_LOWER = `(?:${RS_LOWER}|${RS_MISC})`;
const RS_MISC_UPPER = `(?:${RS_UPPER}|${RS_MISC})`;
const RS_OPT_CONTR_LOWER = `(?:${RS_APOS}(?:d|ll|m|re|s|t|ve))?`;
const RS_OPT_CONTR_UPPER = `(?:${RS_APOS}(?:D|LL|M|RE|S|T|VE))?`;
const RE_OPT_MOD = `${RS_MODIFIER}?`;
const RS_OPT_VAR = `[${RS_VAR_RANGE}]?`;
const RS_OPT_JOIN = `(?:${RS_ZWJ}(?:${[RS_NON_ASTRAL, RS_REGIONAL, RS_SURR_PAIR].join("|")})${RS_OPT_VAR}${RE_OPT_MOD})*`;
const RS_ORD_LOWER = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])";
const RS_ORD_UPPER = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])";
const RS_SEQ = RS_OPT_VAR + RE_OPT_MOD + RS_OPT_JOIN;
const RS_EMOJI = `(?:${[RS_DINGBAT, RS_REGIONAL, RS_SURR_PAIR].join("|")})${RS_SEQ}`;
const RS_NON_ASTRAL_COMBO = `${RS_NON_ASTRAL}${RS_COMBO}?`;
const RS_SYMBOL = `(?:${[RS_NON_ASTRAL_COMBO, RS_COMBO, RS_REGIONAL, RS_SURR_PAIR, RS_ASTRAL].join("|")})`;

/** Used to detect strings with zero-width joiners or code points from the astral planes. */
const RE_HAS_UNICODE = new RegExp(`[${RS_ZWJ}${RS_ASTRAL_RANGE}${RS_COMBO_RANGE}${RS_VAR_RANGE}]`);

/** Used to match string symbols, that is, what a user would perceive as one character. */
const RE_UNICODE = new RegExp(`${RS_FITZ}(?=${RS_FITZ})|${RS_SYMBOL}${RS_SEQ}`, "g");

/** Used to match complex or compound words. */
const RE_UNICODE_WORD = new RegExp(
    [
        `${RS_UPPER}?${RS_LOWER}+${RS_OPT_CONTR_LOWER}(?=${[RS_BREAK, RS_UPPER, "$"].join("|")})`,
        `${RS_MISC_UPPER}+${RS_OPT_CONTR_UPPER}(?=${[RS_BREAK, RS_UPPER + RS_MISC_LOWER, "$"].join("|")})`,
        `${RS_UPPER}?${RS_MISC_LOWER}+${RS_OPT_CONTR_LOWER}`,
        `${RS_UPPER}+${RS_OPT_CONTR_UPPER}`,
        RS_ORD_UPPER,
        RS_ORD_LOWER,
        RS_DIGITS,
        RS_EMOJI,
    ].join("|"),
    "g",
);

/**
 * Checks if `string` contains Unicode symbols: zero-width joiners, combining marks, variation selectors or
 * code points from the astral planes.
 *
 * @param string - The string to inspect.
 * @returns Returns `true` if a symbol is found, else `false`.
 * @internal
 */
export function _hasUnicode(string: string): boolean {
    return RE_HAS_UNICODE.test(string);
}

/**
 * Splits a Unicode `string` into an array of its symbols, keeping surrogate pairs, combining marks and
 * joined emoji sequences together.
 *
 * @param string - The string to convert.
 * @returns Returns the converted array.
 * @internal
 */
export function _unicodeToArray(string: string): string[] {
    return string.match(RE_UNICODE) ?? [];
}

/**
 * Splits a Unicode `string` into an array of its words.
 *
 * @param string - The string to inspect.
 * @returns Returns the words of `string`.
 * @internal
 */
export function _unicodeWords(string: string): string[] {
    return string.match(RE_UNICODE_WORD) ?? [];
}
