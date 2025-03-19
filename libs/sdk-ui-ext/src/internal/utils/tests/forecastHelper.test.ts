// (C) 2021-2024 GoodData Corporation
import { describe, it, expect } from "vitest";

import { IReferencePoint } from "../../interfaces/Visualization.js";
import { isForecastEnabled } from "../forecastHelper.js";
import { IInsightDefinition } from "@gooddata/sdk-model";

describe("isForecastEnabled", () => {
    const referencePoint: IReferencePoint = {
        buckets: [
            {
                localIdentifier: "measures",
                items: [
                    {
                        attribute: "fact/fact1",
                        aggregation: true,
                        operator: "sum",
                        showInPercent: false,
                        type: "attribute",
                        localIdentifier: "m1",
                    },
                ],
            },
            {
                localIdentifier: "trend",
                items: [
                    {
                        attribute: "label/date",
                        type: "date",
                        localIdentifier: "date",
                    },
                ],
            },
        ],
        filters: {
            localIdentifier: "filters",
            items: [],
        },
        properties: {},
    };
    const insight: IInsightDefinition = {
        insight: {
            buckets: [],
            filters: [],
            sorts: [],
            properties: {},
            visualizationUrl: "",
            title: "",
        },
    };

    it("should be enabled if condition is met", () => {
        const res = isForecastEnabled(referencePoint, insight, "line");
        expect(res).toEqual({
            enabled: true,
            visible: true,
        });
    });

    it("should be invisible if invalid type chart", () => {
        const res = isForecastEnabled(referencePoint, insight, "area");
        expect(res).toEqual({
            enabled: false,
            visible: false,
        });
    });

    it("should be disabled if more buckets 1", () => {
        const res = isForecastEnabled(
            {
                ...referencePoint,
                buckets: [
                    {
                        localIdentifier: "measures",
                        items: [
                            {
                                attribute: "fact/fact1",
                                aggregation: true,
                                operator: "sum",
                                showInPercent: false,
                                type: "attribute",
                                localIdentifier: "m1",
                            },
                            {
                                attribute: "fact/fact2",
                                aggregation: true,
                                operator: "sum",
                                showInPercent: false,
                                type: "attribute",
                                localIdentifier: "m2",
                            },
                        ],
                    },
                    referencePoint.buckets[1],
                ],
            },
            insight,
            "line",
        );
        expect(res).toEqual({
            enabled: false,
            visible: true,
        });
    });

    it("should be disabled if more buckets 2", () => {
        const res = isForecastEnabled(
            {
                ...referencePoint,
                buckets: [
                    referencePoint.buckets[0],
                    {
                        localIdentifier: "trend",
                        items: [
                            {
                                attribute: "label/date1",
                                type: "date",
                                localIdentifier: "date1",
                            },
                            {
                                attribute: "label/date2",
                                type: "date",
                                localIdentifier: "date2",
                            },
                        ],
                    },
                ],
            },
            insight,
            "line",
        );
        expect(res).toEqual({
            enabled: false,
            visible: true,
        });
    });

    it("should be disabled if more buckets 3", () => {
        const res = isForecastEnabled(
            {
                ...referencePoint,
                buckets: [
                    ...referencePoint.buckets,
                    {
                        localIdentifier: "segment",
                        items: [
                            {
                                attribute: "label/date3",
                                type: "date",
                                localIdentifier: "date3",
                            },
                        ],
                    },
                ],
            },
            insight,
            "line",
        );
        expect(res).toEqual({
            enabled: false,
            visible: true,
        });
    });

    it("should be disabled if not date", () => {
        const res = isForecastEnabled(
            {
                ...referencePoint,
                buckets: [
                    referencePoint.buckets[0],
                    {
                        ...referencePoint.buckets[1],
                        items: [
                            {
                                ...referencePoint.buckets[1].items[0],
                                type: "attribute",
                            },
                        ],
                    },
                ],
            },
            insight,
            "line",
        );
        expect(res).toEqual({
            enabled: false,
            visible: true,
        });
    });

    it("should be enabled if one attribute sorts", () => {
        const res = isForecastEnabled(
            referencePoint,
            {
                ...insight,
                insight: {
                    ...insight.insight,
                    sorts: [
                        {
                            attributeSortItem: {
                                attributeIdentifier: "date",
                                direction: "asc",
                            },
                        },
                    ],
                },
            },
            "line",
        );
        expect(res).toEqual({
            enabled: true,
            visible: true,
        });
    });

    it("should be disabled if more sorts", () => {
        const res = isForecastEnabled(
            referencePoint,
            {
                ...insight,
                insight: {
                    ...insight.insight,
                    sorts: [
                        {
                            attributeSortItem: {
                                attributeIdentifier: "date",
                                direction: "asc",
                            },
                        },
                        {
                            attributeSortItem: {
                                attributeIdentifier: "date",
                                direction: "asc",
                            },
                        },
                    ],
                },
            },
            "line",
        );
        expect(res).toEqual({
            enabled: false,
            visible: true,
        });
    });

    it("should be disabled if one metric sort", () => {
        const res = isForecastEnabled(
            referencePoint,
            {
                ...insight,
                insight: {
                    ...insight.insight,
                    sorts: [
                        {
                            measureSortItem: {
                                direction: "asc",
                                locators: [],
                            },
                        },
                    ],
                },
            },
            "line",
        );
        expect(res).toEqual({
            enabled: false,
            visible: true,
        });
    });
});
