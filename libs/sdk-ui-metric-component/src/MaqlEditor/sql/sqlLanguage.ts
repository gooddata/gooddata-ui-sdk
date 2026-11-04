// (C) 2026 GoodData Corporation

import { sql } from "@codemirror/lang-sql";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { type Extension } from "@codemirror/state";
import { tags } from "@lezer/highlight";

/**
 * The light palette of the former editor, for the read-only SQL preview.
 */
const sqlHighlightStyle = HighlightStyle.define([
    { tag: tags.keyword, color: "#0000FF" },
    { tag: tags.operator, color: "#000000" },
    { tag: [tags.string, tags.special(tags.string)], color: "#A31515" },
    { tag: tags.number, color: "#098658" },
    { tag: tags.comment, color: "#008000" },
    { tag: [tags.function(tags.variableName), tags.standard(tags.name)], color: "#795E26" },
    { tag: tags.typeName, color: "#267F99" },
]);

export function sqlLanguageSupport(): Extension {
    return [sql(), syntaxHighlighting(sqlHighlightStyle)];
}
