// (C) 2019 GoodData Corporation
import { VisualizationInput } from "@gooddata/typings";
import { convertBucketsToAFM } from "../conversion";

const PositiveTextFilter: VisualizationInput.IFilter = {
    positiveAttributeFilter: {
        displayForm: { identifier: "foo" },
        in: ["val1", "val2"],
        textFilter: true,
    },
};

const NegativeTextFilter: VisualizationInput.IFilter = {
    negativeAttributeFilter: {
        displayForm: { identifier: "foo" },
        notIn: ["val1", "val2"],
        textFilter: true,
    },
};

/**
 * Tests here solidify the contract of text filters:
 *
 * - text filter indicator is optional property added on top of existing visualization object structures accepted
 *   by convertBucketsToAFM
 * - if present, the textFilter property MUST be returned in the resulting AFM structures
 * - the textFilter property MAY occur in positive or negative attribute filters included in global filters or
 *   in simple measure definition
 */
describe("convertBucketsToAFM", () => {
    it("should retain textFilter indicator for positive filter in global filters", () => {
        expect(convertBucketsToAFM([], [PositiveTextFilter])).toEqual({ filters: [PositiveTextFilter] });
    });

    it("should retain textFilter indicator for negative filter in global filters", () => {
        expect(convertBucketsToAFM([], [NegativeTextFilter])).toEqual({ filters: [NegativeTextFilter] });
    });

    it("should retain textFilter indicator for positive filter in simple measure filters", () => {
        const simpleMeasure: VisualizationInput.IMeasure = {
            measure: {
                localIdentifier: "m1",
                definition: {
                    measureDefinition: {
                        item: { identifier: "m1Id" },
                        aggregation: "sum",
                        filters: [PositiveTextFilter],
                    },
                },
            },
        };

        expect(convertBucketsToAFM([{ localIdentifier: "bucket", items: [simpleMeasure] }])).toEqual({
            measures: [
                {
                    localIdentifier: "m1",
                    definition: {
                        measure: {
                            item: { identifier: "m1Id" },
                            aggregation: "sum",
                            filters: [PositiveTextFilter],
                        },
                    },
                },
            ],
        });
    });

    it("should retain textFilter indicator for negative filter in simple measure filters", () => {
        const simpleMeasure: VisualizationInput.IMeasure = {
            measure: {
                localIdentifier: "m1",
                definition: {
                    measureDefinition: {
                        item: { identifier: "m1Id" },
                        aggregation: "sum",
                        filters: [NegativeTextFilter],
                    },
                },
            },
        };

        expect(convertBucketsToAFM([{ localIdentifier: "bucket", items: [simpleMeasure] }])).toEqual({
            measures: [
                {
                    localIdentifier: "m1",
                    definition: {
                        measure: {
                            item: { identifier: "m1Id" },
                            aggregation: "sum",
                            filters: [NegativeTextFilter],
                        },
                    },
                },
            ],
        });
    });
});
