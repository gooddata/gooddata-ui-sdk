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
     * Also accepts metric/attribute references (\{metric/id\}, \{label/id\})
     * that resolve dynamically per hovered data point. Resolved values are
     * automatically backslash-escaped, so data containing markdown metacharacters
     * renders as literal text — no manual escaping is required.
     *
     * Use display-form identifiers (NOT parent attribute identifiers) inside
     * `{label/id}`. An attribute id renders correctly for attributes that are
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
 * Lookup of resolved reference values keyed by `metric/id` or `label/id`.
 *
 * @internal
 */
export interface IResolvedReferenceValues {
    [referenceKey: string]: string | undefined;
}
