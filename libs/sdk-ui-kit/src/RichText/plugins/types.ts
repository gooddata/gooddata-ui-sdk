// (C) 2022-2026 GoodData Corporation

import { type Parent } from "unist";

export type HtmlNode = Parent & {
    type: string;
    tagName: string;
    properties: Record<string, string>;
};
export type TextNode = HtmlNode & { value: string };

/**
 * A computed attribute has no labels on the backend, so it cannot be named by the `label` prefix
 * and carries a prefix of its own. It is spelled the MAQL way, `computed_attribute` - as every
 * prefix here is a MAQL object type, and as drill URL placeholders and the YAML convertors spell
 * it too. The REST form of the type, `computedAttribute`, is deliberately not accepted: one
 * spelling per object keeps stored content comparable across all of them.
 *
 * Prefixes are matched case-insensitively; identifiers are not, LDM identifiers being
 * case-sensitive.
 *
 * @internal
 */
export const REFERENCE_REGEX_SPLIT = /(\{(?:label|metric|computed_attribute|parameter)\/[a-z0-9._-]*\})/gi;

/**
 * Capture groups, relied on by every consumer: 1 = the whole `{…}`, 2 = `prefix/identifier`,
 * 3 = the prefix, 4 = the identifier. Keep the group structure when adding a prefix.
 *
 * @internal
 */
export const REFERENCE_REGEX_MATCH = /(\{((label|metric|computed_attribute|parameter)\/([a-z0-9._-]*))\})/gi;

/**
 * The element the reference plugin leaves in place of a value the user may not read. It has a tag
 * of its own, so the renderer maps it to a component by name rather than telling it apart from
 * other markup by what it looks like.
 *
 * @internal
 */
export const RESTRICTED_MARKER_TAG = "gd-restricted-reference";
