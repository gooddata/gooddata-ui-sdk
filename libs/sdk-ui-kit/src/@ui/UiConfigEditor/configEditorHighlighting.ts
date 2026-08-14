// (C) 2026 GoodData Corporation

import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { Prec } from "@codemirror/state";
import { tags as t } from "@lezer/highlight";

/**
 * Token colors expressed as theme variables, so the editor stays legible on a dark theme.
 *
 * The shared highlight style in `useCodemirror` hardcodes light-theme hex colors, which leaves dark
 * strings on a dark background once a theme flips the surface (the editor's background is itself
 * theme-driven). Only the complementary scale and the semantic palette are safe to lean on here:
 * both invert with the theme, so foreground stays foreground.
 */
const themedHighlightStyle = HighlightStyle.define([
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

/**
 * `Prec.highest` so this wins over the shared highlight style that `useCodemirror` installs: with
 * equal precedence the earlier extension takes effect, and that one is added first.
 */
export const themedHighlighting = Prec.highest(syntaxHighlighting(themedHighlightStyle));
