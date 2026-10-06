// (C) 2025-2026 GoodData Corporation

import { HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

/**
 * @internal
 */
export const defaultSyntaxHighlightStyle = HighlightStyle.define([
    { tag: t.punctuation, color: "#94a1ad" },
    { tag: t.bracket, color: "#94a1ad" },
    { tag: t.variableName, color: "#464e56" },
    { tag: t.string, color: "#a11" },
    { tag: t.special(t.variableName), color: "#13b1e2", fontWeight: "bold" },
    { tag: t.standard(t.variableName), color: "#00c18e", fontWeight: "bold" },
    { tag: t.keyword, color: "#ab55a3", fontWeight: "bold" },
]);
