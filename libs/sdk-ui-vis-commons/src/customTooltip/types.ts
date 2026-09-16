// (C) 2026 GoodData Corporation

/**
 * Placement of the custom tooltip section relative to the default tooltip content.
 *
 * @alpha
 */
export type CustomTooltipPlacement = "above" | "below" | "replace";

/**
 * Custom tooltip configuration.
 *
 * @remarks
 * Allows users to define a custom section in the visualization tooltip using Markdown
 * with metric/attribute references that resolve dynamically per hovered data point.
 *
 * @alpha
 */
export interface ICustomTooltipConfig {
    /**
     * Whether the custom tooltip is enabled.
     */
    enabled?: boolean;
    /**
     * Markdown content for the custom tooltip section.
     *
     * @remarks
     * Supports a subset of Markdown:
     *
     * - Headings: `#` through `####`
     * - Bold (`**text**`), italic (`*text*`)
     * - Unordered lists (`- item`) and ordered lists (`1. item`) — not nested
     * - Images (`![alt](url)`) — `https:`, `http:`, and `data:image/...` URLs only
     * - Links (`[text](url)`) — `http(s)` URLs only; rendered as anchors opening in
     *   a new tab. End-users can only reach them when the tooltip stays open long
     *   enough to interact with (accessible/sticky Highcharts tooltips, geo popups).
     * - Horizontal rules (`---`)
     * - Backslash escapes (`\*`, `\_`, `\[`, `\!`, etc.) to render a metacharacter
     *   as literal text instead of formatting
     *
     * Not supported: tables, code blocks, blockquotes, nested lists, raw HTML.
     *
     * Also accepts metric/attribute references (\{metric/id\}, \{label/id\},
     * \{computed_attribute/id\}) that resolve dynamically per hovered data point. Resolved values are
     * automatically backslash-escaped, so data containing markdown metacharacters
     * renders as literal text — no manual escaping is required.
     *
     * Use display-form identifiers (NOT parent attribute identifiers) inside
     * `{label/id}`; a computed attribute has no labels and is named by its own
     * identifier inside `{computed_attribute/id}`. An attribute id renders correctly for attributes that are
     * already in the chart, but it cannot be fetched as a label for external
     * attributes — and a single such ref causes the secondary tooltip fetch
     * to fail backend-side, dropping every other external ref alongside it.
     *
     * @see https://www.gooddata.com/docs/cloud/create-visualizations/custom-tooltips/
     */
    content?: string;
    /**
     * Where to place the custom section relative to the default tooltip content.
     *
     * @defaultValue "above"
     */
    placement?: CustomTooltipPlacement;
}

/**
 * Resolution outcome for a single `{metric/id}` / `{label/id}` reference at a
 * data point. A discriminated union so the renderer maps each state to its own
 * localized message instead of collapsing them: `empty` → "(No data)",
 * `multiple` → "(Multiple items)". A reference that couldn't be resolved at all
 * is represented by *absence* from the lookup (`undefined`), which the renderer
 * maps to "(Data could not be retrieved)" — there is no explicit error variant.
 *
 * @internal
 */
export type ResolvedReference =
    | { readonly kind: "value"; readonly text: string }
    | { readonly kind: "empty" }
    | { readonly kind: "multiple" };

/**
 * Lookup of resolved reference statuses, keyed by `<prefix>/<id>` - one namespace per object type,
 * so ids reused across types cannot collide. The key is exactly the text between the braces of the
 * reference it answers, lowercased prefix aside.
 *
 * @internal
 */
export interface IResolvedReferenceValues {
    [referenceKey: string]: ResolvedReference | undefined;
}

/**
 * Builds the `metric/<id>` lookup key for a metric reference. A reference key
 * has exactly two shapes ({@link metricKey}, {@link labelKey}); keeping the
 * convention here makes it the single source for both the write sites and the
 * read in `resolveReferences` (which routes the parsed prefix through these
 * helpers rather than rebuilding the key).
 *
 * @internal
 */
export const metricKey = (id: string): string => `metric/${id}`;

/**
 * Builds the `label/<id>` lookup key for a label reference. See {@link metricKey}.
 *
 * @internal
 */
export const labelKey = (id: string): string => `label/${id}`;

/**
 * Builds the `computed_attribute/<id>` lookup key for a computed attribute reference.
 *
 * A computed attribute gets a namespace of its own rather than sharing the label one: ids are
 * unique per object type, so a label and a computed attribute may both be called `tier` and would
 * otherwise overwrite each other in the lookup - silently showing one's value for the other.
 * See {@link metricKey}.
 *
 * @internal
 */
export const computedAttributeKey = (id: string): string => `computed_attribute/${id}`;

/**
 * Localized placeholder strings for the non-value reference states. Built once
 * at the render site (where `intl` is available) and threaded into
 * `resolveReferences`, so reference resolution stays free of i18n concerns.
 *
 * @internal
 */
export interface ITooltipLocalizedStrings {
    readonly noData: string;
    readonly multipleItems: string;
    readonly noFetch: string;
}
