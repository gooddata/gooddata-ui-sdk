// (C) 2021-2026 GoodData Corporation

// @vitest-environment node

import { expect, it } from "vitest";

import { newMeasureMetadataObject } from "@gooddata/sdk-backend-base";
import { type IMeasureMetadataObject, idRef } from "@gooddata/sdk-model";

import { getFilteredItems } from "./metricListData.js";

it("should filter item by title", function () {
    const testItems: IMeasureMetadataObject[] = [
        newMeasureMetadataObject(idRef("metric1"), (m) => m.id("metric1").title("search title 1")),
        newMeasureMetadataObject(idRef("metric2"), (m) => m.id("metric2").title("search title 2")),
        newMeasureMetadataObject(idRef("metric3"), (m) => m.id("metric3").title("search title 3")),
    ];

    expect(getFilteredItems(testItems, "search title 2")).toEqual([testItems[1]]);
});

it("should filter item by id", function () {
    const testItems: IMeasureMetadataObject[] = [
        newMeasureMetadataObject(idRef("metric1"), (m) => m.id("metric1").title("search title 1")),
        newMeasureMetadataObject(idRef("metric2"), (m) => m.id("metric2").title("search title 2")),
        newMeasureMetadataObject(idRef("metric3"), (m) => m.id("metric3").title("search title 3")),
    ];

    expect(getFilteredItems(testItems, "metric3")).toEqual([testItems[2]]);
});

it("should filter item by id and title", function () {
    const testItems: IMeasureMetadataObject[] = [
        newMeasureMetadataObject(idRef("metric1"), (m) => m.id("metric-search").title("search title 1")),
        newMeasureMetadataObject(idRef("metric2"), (m) => m.id("metric2").title("title with metric-search")),
        newMeasureMetadataObject(idRef("metric3"), (m) => m.id("metric3").title("search title 3")),
    ];

    expect(getFilteredItems(testItems, "metric-search")).toEqual([testItems[0], testItems[1]]);
});

it("should filter text with regexp special charts", function () {
    const regExpSpecialChars = "[.*+?^${}()|[\\]]";

    const testItems: IMeasureMetadataObject[] = [
        newMeasureMetadataObject(idRef("metric1"), (m) =>
            m.id("metric1").title(`text with ${regExpSpecialChars}`),
        ),
        newMeasureMetadataObject(idRef("metric2"), (m) => m.id("metric2").title("metric-search")),
        newMeasureMetadataObject(idRef("metric3"), (m) => m.id("metric3").title("search title 3")),
    ];

    expect(getFilteredItems(testItems, regExpSpecialChars)).toEqual([testItems[0]]);
});
