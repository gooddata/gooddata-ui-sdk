// (C) 2025-2026 GoodData Corporation

import { HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

/**
 * Token colors use only the complementary scale and the semantic palette.
 * Both invert with the theme, so tokens stay legible on dark surfaces.
 *
 * @internal
 */
export const defaultSyntaxHighlightStyle = HighlightStyle.define([
    { tag: [t.punctuation, t.bracket], color: "var(--gd-palette-complementary-6)" },
    { tag: t.variableName, color: "var(--gd-palette-complementary-8)" },
    { tag: t.string, color: "var(--gd-palette-primary-base)" },
    {
        tag: t.special(t.variableName),
        color: "var(--gd-palette-primary-base)",
        fontWeight: "bold",
    },
    {
        tag: t.standard(t.variableName),
        color: "var(--gd-palette-success-base)",
        fontWeight: "bold",
    },
    { tag: t.keyword, color: "var(--gd-palette-warning-base)", fontWeight: "bold" },
]);
