// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import {
    IAttribute,
    ICatalogAttribute,
    IInsightDefinition,
    IMeasure,
    areObjRefsEqual,
    attributeAlias,
    attributeDisplayFormRef,
    insightAttributes,
    insightMeasures,
    insightVisualizationType,
    measureAlias,
    measureTitle,
} from "@gooddata/sdk-model";

import {
    CommonExportDataAttributes,
    MetaExportData,
    MetaExportDataAttributes,
    RichTextExportData,
    SectionDescriptionExportDataAttributes,
    SectionExportData,
    WidgetExportData,
    WidgetExportDataAttributes,
} from "./types.js";
import {
    ExtendedDashboardWidget,
    selectCatalogAttributes,
    selectInsightByWidgetRef,
    selectIsInExportMode,
    useDashboardSelector,
} from "../../model/index.js";
import { RenderMode } from "../../types.js";

const getAttributeDisplayName = (attribute: IAttribute, catalogAttributes: ICatalogAttribute[]) => {
    const alias = attributeAlias(attribute);
    if (alias) {
        return alias;
    }

    const displayFormRef = attributeDisplayFormRef(attribute);
    const catalogAttribute = catalogAttributes.find((catalogAttribute) =>
        catalogAttribute.displayForms.some((displayForm) => areObjRefsEqual(displayForm.ref, displayFormRef)),
    );

    if (catalogAttribute) {
        return catalogAttribute.attribute.title;
    }

    return null;
};

const getMeasureDisplayName = (measure: IMeasure) => {
    return measureAlias(measure) || measureTitle(measure) || null;
};

const getVisualizationDimensionsAttributes = (
    insight: IInsightDefinition,
    catalogAttributes: ICatalogAttribute[],
) => {
    const dimensions = [
        ...insightAttributes(insight).map((attr) => getAttributeDisplayName(attr, catalogAttributes)),
        ...insightMeasures(insight).map(getMeasureDisplayName),
    ].filter(Boolean);

    return Object.fromEntries(
        dimensions.map((dimension, index) => [`data-export-visualization-dimension-${index}`, dimension]),
    );
};

/**
 * @alpha
 */
export const useDashboardExportData = (
    renderMode: RenderMode | undefined,
    status: "loaded" | "empty",
    type: "nested" | "root",
): CommonExportDataAttributes | undefined => {
    if (renderMode !== "export" || type === "nested") {
        return undefined;
    }

    return {
        "data-export-type": "dashboard",
        "data-export-status": status,
    };
};

/**
 * @alpha
 */
export const useSectionExportData = (depth: number): SectionExportData | undefined => {
    const isExportMode = useDashboardSelector(selectIsInExportMode);

    if (!isExportMode) {
        return undefined;
    }

    if (depth === 0) {
        return {
            info: { "data-export-type": "section-info", "data-export-depth": depth.toString() },
            section: { "data-export-type": "section" },
            title: { "data-export-type": "section-title" },
            description: {
                description: { "data-export-type": "section-description" },
                richText: {
                    markdown: { "data-export-content-type": "markdown" },
                },
            },
        };
    }

    return {
        info: { "data-export-type": "section-info", "data-export-depth": depth.toString() },
        title: { "data-export-type": "section-title" },
        description: {
            description: { "data-export-type": "section-description" },
            richText: {
                markdown: { "data-export-content-type": "markdown" },
            },
        },
    };
};

/**
 * @alpha
 */
export const useSectionDescriptionExportData = (
    exportData: SectionExportData | undefined,
    loading: boolean,
    error: boolean,
): SectionExportData | undefined => {
    const isExportMode = useDashboardSelector(selectIsInExportMode);

    if (!isExportMode) {
        return undefined;
    }

    if (!exportData) {
        return exportData;
    }

    return {
        ...exportData,
        ...(exportData.description
            ? {
                  description: {
                      ...exportData.description,
                      description: {
                          ...exportData.description?.description,
                          "data-export-description-status": loading ? "loading" : error ? "error" : "loaded",
                      } as SectionDescriptionExportDataAttributes,
                  },
              }
            : {}),
    };
};

/**
 * @alpha
 */
export const useWidgetExportData = (widget: ExtendedDashboardWidget): WidgetExportData | undefined => {
    const insight = useDashboardSelector(selectInsightByWidgetRef(widget.ref));
    const isExportMode = useDashboardSelector(selectIsInExportMode);
    const catalogAttributes = useDashboardSelector(selectCatalogAttributes);

    if (!isExportMode) {
        return undefined;
    }

    return {
        section: { "data-export-type": "widget" },
        widget: {
            "data-export-type": "widget-content",
            "data-export-widget-type": widget.type,
            ...(insight ? { "data-export-visualization-type": insightVisualizationType(insight) } : {}),
            ...(insight ? getVisualizationDimensionsAttributes(insight, catalogAttributes) : {}),
        },
        title: { "data-export-type": "widget-title" },
        description: {
            description: { "data-export-type": "widget-description" },
            richText: {
                markdown: { "data-export-content-type": "markdown" },
            },
        },
    };
};

/**
 * @alpha
 */
export const useRichTextExportData = (): RichTextExportData | undefined => {
    const isExportMode = useDashboardSelector(selectIsInExportMode);

    if (!isExportMode) {
        return undefined;
    }

    return {
        markdown: { "data-export-content-type": "markdown" },
    };
};

/**
 * @alpha
 */
export const useVisualizationExportData = (
    widget: WidgetExportDataAttributes | undefined,
    loading: boolean,
    error: boolean,
): Partial<WidgetExportDataAttributes> | undefined => {
    const isExportMode = useDashboardSelector(selectIsInExportMode);

    return useMemo(() => {
        if (!isExportMode) {
            return undefined;
        }

        return {
            ...widget,
            "data-export-visualization-status": loading ? "loading" : error ? "error" : "loaded",
        };
    }, [widget, isExportMode, loading, error]);
};

/**
 * @alpha
 */
export const useMetaExportData = (): MetaExportData | undefined => {
    const isExportMode = useDashboardSelector(selectIsInExportMode);

    if (!isExportMode) {
        return undefined;
    }

    return {
        root: {
            "data-export-type": "meta",
        },
        id: {
            "data-export-meta-type": "dashboard-id",
        },
        title: {
            "data-export-meta-type": "dashboard-title",
        },
        description: {
            "data-export-meta-type": "dashboard-description",
        },
        user: {
            "data-export-meta-type": "user-full-name",
        },
        workspace: {
            "data-export-meta-type": "workspace-title",
        },
        tags: {
            root: {
                "data-export-meta-type": "dashboard-tags",
            },
            tag: {
                "data-export-meta-type": "dashboard-tag",
            },
        },
        filters: {
            root: {
                "data-export-meta-type": "dashboard-filters",
            },
            rootData: (loading, error) => ({
                "data-export-meta-filters-status": loading ? "loading" : error ? "error" : "loaded",
            }),
            dateFilter: {
                "data-export-meta-type": "dashboard-filter",
                "data-export-meta-filter-type": "date",
            },
            attributeFilter: {
                "data-export-meta-type": "dashboard-filter",
                "data-export-meta-filter-type": "attribute",
            },
            filter: {
                name: {
                    "data-export-meta-type": "dashboard-filter-name",
                },
                value: {
                    "data-export-meta-type": "dashboard-filter-value",
                },
                filterData: (data, loading, error) => ({
                    "data-export-meta-filter-mode": data.mode,
                    "data-export-meta-filter-status": loading ? "loading" : error ? "error" : "loaded",
                }),
            },
        },
    };
};

/**
 * @alpha
 */
export const useMetaExportImageData = (
    type: MetaExportDataAttributes["data-export-meta-type"],
    loading: boolean,
    error: boolean,
): MetaExportDataAttributes | undefined => {
    const isExportMode = useDashboardSelector(selectIsInExportMode);

    if (!isExportMode) {
        return undefined;
    }

    return {
        "data-export-meta-type": type,
        "data-export-meta-image-status": loading ? "loading" : error ? "error" : "loaded",
    };
};

/**
 * @alpha
 */
export const useMetaPaletteData = (): {
    exportData: MetaExportDataAttributes | undefined;
    item: (key: string, value: string) => MetaExportDataAttributes | undefined;
} => {
    const isExportMode = useDashboardSelector(selectIsInExportMode);

    if (!isExportMode) {
        return {
            exportData: {},
            item: () => ({}),
        };
    }

    return {
        exportData: {
            "data-export-meta-type": "theme-palette",
        },
        item: (key: string, value: string) => {
            return {
                "data-export-palette-key": key,
                "data-export-palette-value": value,
            };
        },
    };
};
