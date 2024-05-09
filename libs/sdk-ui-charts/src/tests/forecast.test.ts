// (C) 2021-2024 GoodData Corporation
import { describe, it, expect } from "vitest";
import { isForecastEnabled } from "../forecast.js";
import { IInsightDefinition } from "@gooddata/sdk-model";

describe("isForecastEnabled", () => {
    const insight: IInsightDefinition = {
        insight: {
            title: "",
            summary: "",
            tags: [],
            buckets: [
                {
                    localIdentifier: "measures",
                    items: [
                        {
                            measure: {
                                localIdentifier: "m1",
                                definition: {
                                    measureDefinition: {
                                        aggregation: "sum",
                                        computeRatio: false,
                                        item: {
                                            type: "fact",
                                            identifier: "fact1",
                                        },
                                    },
                                },
                                alias: "",
                            },
                        },
                    ],
                },
                {
                    localIdentifier: "trend",
                    items: [
                        {
                            attribute: {
                                localIdentifier: "date",
                                alias: "",
                                displayForm: {
                                    uri: "dateUri",
                                },
                            },
                        },
                    ],
                },
            ],
            filters: [],
            sorts: [],
            visualizationUrl: "",
            properties: {},
        },
    };

    it("should be enabled if condition is met", () => {
        const res = isForecastEnabled(insight, "line");
        expect(res).toEqual({
            enabled: true,
            visible: true,
        });
    });

    it("should be invisible if invalid type chart", () => {
        const res = isForecastEnabled(insight, "area");
        expect(res).toEqual({
            enabled: false,
            visible: false,
        });
    });

    it("should be disabled if more buckets 1", () => {
        const res = isForecastEnabled(
            {
                ...insight,
                insight: {
                    ...insight.insight,
                    buckets: [
                        {
                            localIdentifier: "measures",
                            items: [
                                {
                                    measure: {
                                        localIdentifier: "m1",
                                        definition: {
                                            measureDefinition: {
                                                aggregation: "sum",
                                                computeRatio: false,
                                                item: {
                                                    type: "fact",
                                                    identifier: "fact1",
                                                },
                                            },
                                        },
                                        alias: "",
                                    },
                                },
                                {
                                    measure: {
                                        localIdentifier: "m1",
                                        definition: {
                                            measureDefinition: {
                                                aggregation: "sum",
                                                computeRatio: false,
                                                item: {
                                                    type: "fact",
                                                    identifier: "fact2",
                                                },
                                            },
                                        },
                                        alias: "",
                                    },
                                },
                            ],
                        },
                        insight.insight.buckets[1],
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

    it("should be disabled if more buckets 2", () => {
        const res = isForecastEnabled(
            {
                ...insight,
                insight: {
                    ...insight.insight,
                    buckets: [
                        insight.insight.buckets[0],
                        {
                            localIdentifier: "trend",
                            items: [
                                {
                                    attribute: {
                                        localIdentifier: "date",
                                        alias: "",
                                        displayForm: {
                                            uri: "dateUri",
                                        },
                                    },
                                },
                                {
                                    attribute: {
                                        localIdentifier: "date1",
                                        alias: "",
                                        displayForm: {
                                            uri: "dateUri1",
                                        },
                                    },
                                },
                            ],
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

    it("should be disabled if more buckets 3", () => {
        const res = isForecastEnabled(
            {
                ...insight,
                insight: {
                    ...insight.insight,
                    buckets: [
                        ...insight.insight.buckets,
                        {
                            localIdentifier: "segment",
                            items: [
                                {
                                    attribute: {
                                        localIdentifier: "date",
                                        alias: "",
                                        displayForm: {
                                            uri: "dateUri",
                                        },
                                    },
                                },
                                {
                                    attribute: {
                                        localIdentifier: "date1",
                                        alias: "",
                                        displayForm: {
                                            uri: "dateUri1",
                                        },
                                    },
                                },
                            ],
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
