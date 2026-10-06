// (C) 2026 GoodData Corporation

import { HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

/**
 * Token colors expressed as theme variables, so the editor stays legible on a dark theme.
 * Only the complementary scale and the semantic palette are safe to lean on here: both invert with
 * the theme, so foreground stays foreground.
 */
export const themedHighlightStyle = HighlightStyle.define([
    // Keys read as the primary content of a config file, so they take the foreground colour.
    {
        tag: [t.propertyName, t.definition(t.propertyName), t.variableName],
        color: "var(--gd-palette-complementary-8)",
    },
    { tag: [t.string, t.special(t.string)], color: "var(--gd-palette-primary-base)" },
    {
        tag: [t.number, t.bool, t.null, t.atom, t.keyword],
        color: "var(--gd-palette-warning-base)",
    },
    { tag: [t.punctuation, t.separator, t.bracket, t.meta], color: "var(--gd-palette-complementary-6)" },
    { tag: t.comment, color: "var(--gd-palette-complementary-6)", fontStyle: "italic" },
]);
