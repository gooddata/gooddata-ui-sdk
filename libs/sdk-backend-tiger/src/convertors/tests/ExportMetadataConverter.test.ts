// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { convertExportMetadata } from "../fromBackend/ExportMetadataConverter.js";

describe("ExportMetadataConverter", () => {
    const tigerDashboardFilter = {
        attributeFilter: {
            displayForm: {
                identifier: { id: "attr.df", type: "label" },
            },
            negativeSelection: false,
            attributeElements: { values: ["North"] },
        },
    };

    it("converts filters and filtersByTab when automation filter context is enabled", () => {
        const metadata = convertExportMetadata(
            {
                filters: [tigerDashboardFilter],
                filtersByTab: {
                    tabA: [tigerDashboardFilter],
                },
                title: "Export title",
                hideWidgetTitles: true,
            },
            true,
        );

        expect(metadata?.title).toBe("Export title");
        expect(metadata?.hideWidgetTitles).toBe(true);

        const convertedFilter = metadata?.filters?.[0];
        expect(convertedFilter).toBeDefined();
        if (convertedFilter && "attributeFilter" in convertedFilter) {
            expect(convertedFilter.attributeFilter.displayForm).toEqual(idRef("attr.df", "displayForm"));
        }

        const convertedByTab = metadata?.filtersByTab?.["tabA"]?.[0];
        expect(convertedByTab).toBeDefined();
        if (convertedByTab && "attributeFilter" in convertedByTab) {
            expect(convertedByTab.attributeFilter.displayForm).toEqual(idRef("attr.df", "displayForm"));
        }
    });

    it("keeps only top-level filters when automation filter context is disabled", () => {
        const metadata = convertExportMetadata(
            {
                filters: [tigerDashboardFilter],
                filtersByTab: {
                    tabA: [tigerDashboardFilter],
                },
            },
            false,
        );

        expect(metadata).toEqual({
            filters: [tigerDashboardFilter],
        });
        expect(metadata).not.toHaveProperty("filtersByTab");
    });

    it("returns empty object for empty metadata", () => {
        expect(convertExportMetadata(undefined, true)).toEqual({});
        expect(convertExportMetadata(null, false)).toEqual({});
    });
});
