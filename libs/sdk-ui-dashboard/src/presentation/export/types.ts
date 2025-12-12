// (C) 2025 GoodData Corporation

import { type DashboardRelatedFilter } from "./hooks/useDashboardRelatedFilters.js";

/**
 * Export element type.
 *
 * @alpha
 */
export type ExportElementType =
    | "meta"
    | "dashboard"
    | "section"
    | "section-info"
    | "section-title"
    | "section-description"
    | "widget"
    | "widget-content"
    | "widget-title"
    | "widget-description";

/**
 * Export meta type.
 *
 * @alpha
 */
export type ExportMetaType =
    | "dashboard-id"
    | "dashboard-title"
    | "dashboard-description"
    | "dashboard-tags"
    | "dashboard-tag"
    | "dashboard-filters"
    | "dashboard-filter"
    | "dashboard-filter-name"
    | "dashboard-filter-value"
    | "workspace-title"
    | "user-full-name"
    | "logo"
    | "cover-image"
    | "theme-palette";

/**
 * Data attributes with export specification for components.
 *
 * @alpha
 */
export type CommonExportDataAttributes = {
    "data-export-type": ExportElementType;
    "data-export-depth"?: string;
    "data-export-status"?: "empty" | "loaded";
};

/**
 * Data attributes with export specification for meta.
 *
 * @alpha
 */
export type MetaExportDataAttributes = {
    "data-export-meta-type"?: ExportMetaType;
    "data-export-meta-filter-type"?: "date" | "attribute";
    "data-export-meta-filter-mode"?: "readonly" | "hidden" | "active";
    "data-export-meta-filter-status"?: "loading" | "loaded" | "error";
    "data-export-meta-filters-status"?: "loading" | "loaded" | "error";
    "data-export-meta-image-status"?: "loading" | "loaded" | "error";
    "data-export-palette-key"?: string;
    "data-export-palette-value"?: string;
};

/**
 * Data attributes for export mode to be added to the header.
 *
 * @alpha
 */
export type MetaExportData = {
    root?: CommonExportDataAttributes;
    id?: MetaExportDataAttributes;
    title?: MetaExportDataAttributes;
    description?: MetaExportDataAttributes;
    user?: MetaExportDataAttributes;
    workspace?: MetaExportDataAttributes;
    tags?: {
        root: MetaExportDataAttributes;
        tag: MetaExportDataAttributes;
    };
    filters?: {
        root: MetaExportDataAttributes;
        rootData: (isLoading: boolean, isError: boolean) => MetaExportDataAttributes;
        dateFilter: MetaExportDataAttributes;
        attributeFilter: MetaExportDataAttributes;
        filter: {
            name: MetaExportDataAttributes;
            value: MetaExportDataAttributes;
            filterData: (
                data: DashboardRelatedFilter,
                isLoading: boolean,
                isError: boolean,
            ) => MetaExportDataAttributes;
        };
    };
};

/**
 * Data attributes for export mode to be added to the header.
 *
 * @alpha
 */
export type HeaderExportData = {
    info?: CommonExportDataAttributes;
    title?: CommonExportDataAttributes;
    description?: DescriptionExportData;
};

/**
 * Data attributes for export mode to be added to the description.
 *
 * @alpha
 */
export type DescriptionExportData = {
    description?: SectionDescriptionExportDataAttributes;
    richText?: RichTextExportData;
};

/**
 * Data attributes for visualization dimensions.
 *
 * @alpha
 */
export type WidgetExportDimensionsAttributes = {
    [K in `data-export-visualization-dimension-${number}`]?: string;
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
} & WidgetExportDimensionsAttributes;

/**
 * Data attributes with export specification for section description component.
 *
 * @alpha
 */
export type SectionDescriptionExportDataAttributes = CommonExportDataAttributes & {
    "data-export-description-status"?: "loading" | "loaded" | "error";
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
