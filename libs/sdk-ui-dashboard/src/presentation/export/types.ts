// (C) 2025 GoodData Corporation

/**
 * Export element type.
 *
 * @alpha
 */
export type ExportElementType =
    | "section"
    | "section-title"
    | "section-description"
    | "widget"
    | "widget-content"
    | "widget-title"
    | "widget-description";

/**
 * Data attributes with export specification for components.
 *
 * @alpha
 */
export type CommonExportDataAttributes = { "data-export-type": ExportElementType };

/**
 * Data attributes for export mode to be added to the header.
 *
 * @alpha
 */
export type HeaderExportData = {
    title?: CommonExportDataAttributes;
    description?: CommonExportDataAttributes;
};

/**
 * Data attributes for export mode to be added to the widget.
 *
 * @alpha
 */
export type WidgetExportDataAttributes = CommonExportDataAttributes & {
    "data-export-widget-type"?: string;
    "data-export-visualization-type"?: string;
    "data-export-visualization-status"?: "loading" | "loaded" | "error";
};

/**
 * Data attributes for export mode to be added to the widget and its components.
 *
 * When customizing a widget component, spread these properties in the element intended
 * for export.
 *
 * @example
 * ```tsx
 * const DashboardWidgetComponent: CustomDashboardWidgetComponent = ({ widget, exportData }) => {
 *   return (
 *       <div {...exportData?.widget}>
 *           <div>My custom dashboard widget - {widget?.identifier}</div>
 *           <div {...exportData?.title}>Widget title</div>
 *           <div {...exportData?.description}>Widget description</div>
 *       </div>
 *   );
 * };
 * ```
 *
 * @alpha
 */
export type WidgetExportData = HeaderExportData & {
    section?: CommonExportDataAttributes;
    widget?: WidgetExportDataAttributes;
};

/**
 * Data attributes for export mode to be added to the rich text widget.
 *
 * @alpha
 */
export type RichTextDataAttributes = {
    "data-export-content-type"?: "markdown";
};

/**
 * Data attributes for export mode to be added to the rich text widget and its components.
 *
 * When customizing a rich text widget component, spread these properties in the element intended
 * for export.
 *
 * @alpha
 */
export type RichTextExportData = {
    markdown?: RichTextDataAttributes;
};

/**
 * Data attributes for export mode to be added to the layout section header and its components.
 *
 * @alpha
 */
export type SectionExportData = HeaderExportData & {
    section?: CommonExportDataAttributes;
};
