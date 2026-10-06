// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type FilterContextItem,
    type IFilter,
    type IInsight,
    type IWidget,
    type WidgetAttachmentType,
    idRef,
    isExportDefinitionVisualizationObjectRequestPayload,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";

import {
    newWidgetExportDefinitionMetadataObjectDefinition,
    widgetExportFilters,
} from "./exportDefinitions.js";

const widget: IWidget = {
    type: "insight",
    insight: idRef("insight-1", "insight"),
    ignoreDashboardFilters: [],
    drills: [],
    title: "Widget",
    description: "",
    ref: idRef("w1"),
    uri: "/w1",
    identifier: "w1",
    localIdentifier: "w1",
};

const insight: IInsight = {
    insight: {
        identifier: "insight-1",
        uri: "/insight-1",
        ref: idRef("insight-1", "insight"),
        title: "Insight",
        visualizationUrl: "local:table",
        buckets: [],
        filters: [],
        sorts: [],
        properties: {},
    },
};

const dashboardFilters: FilterContextItem[] = [
    {
        attributeFilter: {
            displayForm: idRef("label.dashboard", "displayForm"),
            attributeElements: { uris: ["a"] },
            negativeSelection: false,
        },
    },
];
const widgetFilters: IFilter[] = [newPositiveAttributeFilter(idRef("label.widget"), ["b"])];
const widgetFiltersWithInsight: IFilter[] = [newPositiveAttributeFilter(idRef("label.insight"), ["c"])];

const ALL_FORMATS: WidgetAttachmentType[] = [
    "CSV",
    "CSV_RAW",
    "XLSX",
    "PNG",
    "PPTX",
    "PDF",
    "PDF_TABULAR",
    "HTML",
];

describe("widgetExportFilters", () => {
    it.each<[WidgetAttachmentType, IFilter[] | FilterContextItem[]]>([
        ["CSV", widgetFiltersWithInsight],
        ["CSV_RAW", widgetFilters],
        ["XLSX", dashboardFilters],
        ["PNG", dashboardFilters],
        ["PDF", dashboardFilters],
    ])("picks the filter list a %s export stores", (format, expected) => {
        expect(
            widgetExportFilters(format, { dashboardFilters, widgetFilters, widgetFiltersWithInsight }),
        ).toBe(expected);
    });
});

describe("newWidgetExportDefinitionMetadataObjectDefinition", () => {
    const contentFilters = (format: WidgetAttachmentType, empty: [] | undefined) => {
        const { requestPayload } = newWidgetExportDefinitionMetadataObjectDefinition({
            insight,
            widget,
            dashboardId: "dashboard-1",
            format,
            dashboardFilters: empty,
            widgetFilters: empty,
            widgetFiltersWithInsight: empty,
        });
        return isExportDefinitionVisualizationObjectRequestPayload(requestPayload)
            ? requestPayload.content
            : undefined;
    };

    it.each(ALL_FORMATS)("stores an empty filter list of a %s export as empty, not as missing", (format) => {
        expect(contentFilters(format, [])).toHaveProperty("filters", []);
    });

    it.each(ALL_FORMATS)("stores no filters for a %s export when there is no filter list", (format) => {
        expect(contentFilters(format, undefined)).not.toHaveProperty("filters");
    });
});
