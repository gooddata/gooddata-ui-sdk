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

import { _hasUnicode, _unicodeToArray } from "./_unicode.js";
import { _deburr } from "./deburr.js";
import { _words } from "./words.js";

/** Used to match apostrophes. */
const RE_APOS = /['’]/g;

/**
 * Converts `string` to camel case: the string is deburred, split into words (on separators, case changes,
 * digits and Unicode boundaries, as lodash does), each word is lower-cased and every word but the first is
 * capitalised.
 *
 * @param string - The string to convert.
 * @returns Returns the camel cased string.
 * @internal
 */
export function _camelCase(string?: string): string {
    return _words(_deburr(string).replace(RE_APOS, "")).reduce((result, word, index) => {
        const lower = word.toLowerCase();

        return result + (index ? _upperFirst(lower) : lower);
    }, "");
}

/** Upper-cases the first symbol of `string`, keeping a surrogate pair or joined emoji sequence whole. */
function _upperFirst(string: string): string {
    const first = (_hasUnicode(string) ? _unicodeToArray(string)[0] : string.charAt(0)) ?? "";

    return first.toUpperCase() + string.slice(first.length);
}
