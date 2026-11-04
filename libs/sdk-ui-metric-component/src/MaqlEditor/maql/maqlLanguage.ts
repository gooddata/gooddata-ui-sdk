// (C) 2026 GoodData Corporation

import { HighlightStyle, LanguageSupport, StreamLanguage, syntaxHighlighting } from "@codemirror/language";
import { type Extension } from "@codemirror/state";
import { Tag } from "@lezer/highlight";

import { TOKEN_CLASS_PREFIX } from "../codemirror/CodeEditor.styles.js";

import { LANGUAGE } from "./constants.js";

/**
 * Token types of the regular-expression tokenizer. They cover the editor until the language
 * service's semantic tokens arrive, and the code blocks the language service renders in markdown.
 */
export const maqlTokenTypes = [
    "fact",
    "metric",
    "dataset",
    "attribute",
    "label",
    "variable",
    "keyword",
    "string",
    "comment",
    "bracket",
] as const;

export type MaqlTokenType = (typeof maqlTokenTypes)[number];

const tags = Object.fromEntries(maqlTokenTypes.map((type) => [type, Tag.define()])) as Record<
    MaqlTokenType,
    Tag
>;

export const maqlLanguage = StreamLanguage.define<Record<string, never>>({
    name: LANGUAGE,
    token(stream): MaqlTokenType | null {
        if (stream.match(/^\{fact\/[^}]*\}/i)) {
            return "fact";
        }
        if (stream.match(/^\{metric\/[^}]*\}/i)) {
            return "metric";
        }
        if (stream.match(/^\{dataset\/[^}]*\}/i)) {
            return "dataset";
        }
        if (stream.match(/^\{(?:attribute|computed_attribute)\/[^}]*\}/i)) {
            return "attribute";
        }
        if (stream.match(/^\{label\/[^}]*\}/i)) {
            return "label";
        }
        if (stream.match(/^\{[^}]*\}/)) {
            return "variable";
        }
        if (stream.match(/^\w+/)) {
            return "keyword";
        }
        if (stream.match(/^"(?:[^"\\]|\\.)*"/)) {
            return "string";
        }
        if (stream.match(/^#[^\n]*/)) {
            return "comment";
        }
        if (stream.match(/^[()]/)) {
            return "bracket";
        }
        stream.next();
        return null;
    },
    tokenTable: tags,
    languageData: {
        commentTokens: { line: "#" },
        closeBrackets: { brackets: ["(", "{", '"'] },
    },
});

/**
 * Every token type maps to a fixed class, so the colors live in the editor styles next to the
 * semantic token colors and the end-to-end tests can address the tokens.
 */
export const maqlHighlightStyle = HighlightStyle.define(
    maqlTokenTypes.map((type) => ({ tag: tags[type], class: `${TOKEN_CLASS_PREFIX}${type}` })),
);

export function maqlLanguageSupport(): Extension {
    return [new LanguageSupport(maqlLanguage), syntaxHighlighting(maqlHighlightStyle)];
}
