// (C) 2026 GoodData Corporation

import { getReferenceRegex } from "../utils.js";

// Private-use-area sentinels: never produced by normal chat text, and contain
// none of the characters (`_`, `*`, backtick, ...) CommonMark treats as inline
// syntax, so a placeholder can never be mis-tokenized as Markdown.
export const PLACEHOLDER_START = "\ue000";
const PLACEHOLDER_END = "\ue001";

export interface IExtractedReferences {
    /** Original text with every `{type/id}` token replaced by a placeholder. */
    text: string;
    /** Original `{type/id}` tokens, indexed by the number embedded in their placeholder. */
    tokens: string[];
}

/**
 * `split`'s capture group wraps the whole placeholder, for use with `String.split`
 * so the placeholder survives as its own array entry. The default form's capture
 * group is just the numeric index, for an `exec()` loop that resolves it against
 * `tokens`.
 */
export function getPlaceholderRegex(split?: boolean): RegExp {
    if (split) {
        return new RegExp(`(${PLACEHOLDER_START}\\d+${PLACEHOLDER_END})`, "g");
    }
    return new RegExp(`${PLACEHOLDER_START}(\\d+)${PLACEHOLDER_END}`, "g");
}

/**
 * Replaces `{type/id}` reference tokens with placeholders before Markdown parsing.
 * CommonMark's emphasis rule treats `_word_`-shaped substrings inside an id as
 * legal italic markup and strips the underscores — extracting first avoids that.
 */
export function extractReferences(text: string): IExtractedReferences {
    const tokens: string[] = [];
    const replacedText = text.replace(getReferenceRegex(), (match) => {
        const index = tokens.length;
        tokens.push(match);
        return `${PLACEHOLDER_START}${index}${PLACEHOLDER_END}`;
    });
    return { text: replacedText, tokens };
}
