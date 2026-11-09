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

import { _unicodeWords } from "./_unicode.js";

/** Used to match words composed of alphanumeric characters. */
// oxlint-disable-next-line no-control-regex -- the word class deliberately excludes the control characters
const RE_ASCII_WORD = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;

/** Used to detect strings that need a more robust regexp to match words. */
const RE_HAS_UNICODE_WORD = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;

/**
 * Splits `string` into an array of its words.
 *
 * @param string - The string to inspect.
 * @returns Returns the words of `string`.
 * @internal
 */
export function _words(string: string): string[] {
    if (RE_HAS_UNICODE_WORD.test(string)) {
        return _unicodeWords(string);
    }

    return string.match(RE_ASCII_WORD) ?? [];
}
