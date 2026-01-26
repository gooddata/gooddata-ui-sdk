// (C) 2022-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IExecutionDefinition } from "@gooddata/sdk-model";

import { augmentCustomOverrideWithNormalizedKeys } from "../utils.js";

describe("augmentCustomOverrideWithNormalizedKeys", () => {
    const simpleDefinition: IExecutionDefinition = {
        workspace: "test-workspace",
        buckets: [
            {
                items: [
                    {
                        measure: {
                            localIdentifier: "m1",
                            definition: {
                                measureDefinition: {
                                    item: {
                                        identifier: "fact1",
                                        type: "fact",
                                    },
                                    aggregation: "sum",
                                    filters: [],
                                },
                            },
                            title: "Measure 1",
                        },
                    },
                ],
                localIdentifier: "measures",
            },
            {
                items: [
                    {
                        attribute: {
                            localIdentifier: "a1",
                            displayForm: {
                                identifier: "attr1",
                                type: "displayForm",
                            },
                        },
                    },
                ],
                localIdentifier: "view",
            },
        ],
        attributes: [
            {
                attribute: {
                    localIdentifier: "a1",
                    displayForm: {
                        identifier: "attr1",
                        type: "displayForm",
                    },
                },
            },
        ],
        measures: [
            {
                measure: {
                    localIdentifier: "m1",
                    definition: {
                        measureDefinition: {
                            item: {
                                identifier: "fact1",
                                type: "fact",
                            },
                            aggregation: "sum",
                            filters: [],
                        },
                    },
                    title: "Measure 1",
                },
            },
        ],
        dimensions: [
            {
                itemIdentifiers: ["measureGroup"],
            },
            {
                itemIdentifiers: ["a1"],
            },
        ],
        filters: [],
        sortBy: [],
        postProcessing: {},
    };

    it("should return undefined when customOverride is undefined", () => {
        const result = augmentCustomOverrideWithNormalizedKeys(undefined, simpleDefinition);
        expect(result).toMatchSnapshot();
    });

    it("should augment labels with normalized keys", () => {
        const customOverride = {
            labels: {
                a1: {
                    title: "Custom Label",
                },
            },
        };

        const result = augmentCustomOverrideWithNormalizedKeys(customOverride, simpleDefinition);
        expect(result).toMatchSnapshot();
    });

    it("should augment metrics with normalized keys", () => {
        const customOverride = {
            metrics: {
                m1: {
                    title: "Custom Metric",
                    format: "#,##0.00",
                },
            },
        };

        const result = augmentCustomOverrideWithNormalizedKeys(customOverride, simpleDefinition);
        expect(result).toMatchSnapshot();
    });

    it("should augment both labels and metrics with normalized keys", () => {
        const customOverride = {
            labels: {
                a1: {
                    title: "Custom Label",
                },
            },
            metrics: {
                m1: {
                    title: "Custom Metric",
                    format: "#,##0.00",
                },
            },
        };

        const result = augmentCustomOverrideWithNormalizedKeys(customOverride, simpleDefinition);
        expect(result).toMatchSnapshot();
    });

    it("should handle empty customOverride", () => {
        const customOverride = {};

        const result = augmentCustomOverrideWithNormalizedKeys(customOverride, simpleDefinition);
        expect(result).toMatchSnapshot();
    });

    it("should preserve all original keys and add normalized ones", () => {
        const customOverride = {
            labels: {
                original_key_1: {
                    title: "Label 1",
                },
                original_key_2: {
                    title: "Label 2",
                },
            },
            metrics: {
                original_metric_1: {
                    title: "Metric 1",
                    format: "#,##0",
                },
            },
        };

        const result = augmentCustomOverrideWithNormalizedKeys(customOverride, simpleDefinition);
        expect(result).toMatchSnapshot();
    });
});
