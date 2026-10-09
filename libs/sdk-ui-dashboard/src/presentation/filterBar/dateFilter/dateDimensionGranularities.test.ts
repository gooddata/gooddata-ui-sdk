// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type DateAttributeGranularity,
    type DateFilterGranularity,
    type ICatalogDateDataset,
    type IRelativeDateFilterPresetOfGranularity,
    idRef,
} from "@gooddata/sdk-model";
import { type IDateFilterOptionsByType } from "@gooddata/sdk-ui-filters";

import {
    getDateDimensionGranularities,
    narrowDateFilterOptionsToGranularities,
    narrowGranularities,
} from "./dateDimensionGranularities.js";

function dateDataset(id: string, granularities: DateAttributeGranularity[]): ICatalogDateDataset {
    return {
        dataSet: { ref: idRef(id, "dataSet") },
        dateAttributes: granularities.map((granularity) => ({ granularity })),
    } as unknown as ICatalogDateDataset;
}

function preset<G extends DateFilterGranularity>(
    granularity: G,
    localIdentifier: string,
): IRelativeDateFilterPresetOfGranularity<G> {
    return { type: "relativePreset", localIdentifier, granularity, from: -1, to: -1, visible: true };
}

const dateDatasets = [
    dateDataset("withoutTime", ["GDC.time.year", "GDC.time.month", "GDC.time.date", "GDC.time.day_in_week"]),
    dateDataset("withTime", ["GDC.time.year", "GDC.time.date", "GDC.time.hour", "GDC.time.minute"]),
];

describe("getDateDimensionGranularities", () => {
    it("should return undefined for the common date filter", () => {
        expect(getDateDimensionGranularities(dateDatasets, undefined)).toBeUndefined();
    });

    it("should return undefined when the dimension is not in the catalog", () => {
        expect(getDateDimensionGranularities(dateDatasets, idRef("missing", "dataSet"))).toBeUndefined();
    });

    it("should return only date filter granularities of the bound dimension", () => {
        expect(getDateDimensionGranularities(dateDatasets, idRef("withoutTime", "dataSet"))).toEqual([
            "GDC.time.year",
            "GDC.time.month",
            "GDC.time.date",
        ]);
    });
});

describe("narrowDateFilterOptionsToGranularities", () => {
    const options: IDateFilterOptionsByType = {
        allTime: { type: "allTime", localIdentifier: "ALL_TIME", visible: true },
        absoluteForm: {
            type: "absoluteForm",
            localIdentifier: "ABSOLUTE_FORM",
            visible: true,
            availableGranularities: ["GDC.time.date", "GDC.time.month", "GDC.time.quarter"],
        },
        relativePreset: {
            "GDC.time.year": [preset("GDC.time.year", "LAST_YEAR")],
            "GDC.time.hour": [preset("GDC.time.hour", "LAST_HOUR")],
            "GDC.time.minute": [preset("GDC.time.minute", "LAST_MINUTE")],
        },
    };

    it("should drop presets and absolute form granularities the dimension does not expose", () => {
        const narrowed = narrowDateFilterOptionsToGranularities(options, [
            "GDC.time.year",
            "GDC.time.month",
            "GDC.time.date",
        ]);

        expect(narrowed.allTime).toBe(options.allTime);
        expect(narrowed.relativePreset).toEqual({
            "GDC.time.year": options.relativePreset!["GDC.time.year"],
        });
        expect(narrowed.absoluteForm?.availableGranularities).toEqual(["GDC.time.date", "GDC.time.month"]);
    });

    it("should keep options without presets and absolute form granularities untouched", () => {
        const withoutPresets: IDateFilterOptionsByType = { allTime: options.allTime };

        expect(narrowDateFilterOptionsToGranularities(withoutPresets, ["GDC.time.year"])).toEqual(
            withoutPresets,
        );
    });
});

describe("narrowGranularities", () => {
    it("should keep the original order of the available granularities", () => {
        expect(
            narrowGranularities(
                ["GDC.time.minute", "GDC.time.hour", "GDC.time.date", "GDC.time.year"],
                ["GDC.time.year", "GDC.time.date"],
            ),
        ).toEqual(["GDC.time.date", "GDC.time.year"]);
    });
});
