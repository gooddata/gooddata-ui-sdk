// (C) 2020 GoodData Corporation
import {
    convertAbsoluteDateFilter,
    convertMeasureValueFilter,
    convertRelativeDateFilter,
    convertVisualizationObjectFilter,
} from "../FilterConverter";
import { absoluteFilter, relativeFilter, visualizationObjectFilter } from "./InvalidInputs.fixture";
import {
    newAbsoluteDateFilter,
    DateGranularity,
    newRelativeDateFilter,
    newPositiveAttributeFilter,
    newNegativeAttributeFilter,
    newMeasureValueFilter,
    IMeasureValueFilter,
    newRankingFilter,
    idRef,
    uriRef,
} from "@gooddata/sdk-model";
import { ReferenceLdmExt, ReferenceLdm } from "@gooddata/reference-workspace";

describe("tiger filter converter from model to AFM", () => {
    describe("convert measure value filter", () => {
        const Scenarios: Array<[string, IMeasureValueFilter]> = [
            [
                "specified using id of metric",
                newMeasureValueFilter(idRef("measureId", "measure"), "GREATER_THAN", 10),
            ],
            [
                "specified using id of metric",
                newMeasureValueFilter(idRef("factId", "fact"), "GREATER_THAN", 10),
            ],
            [
                "specified using localId of metric specified as string",
                newMeasureValueFilter("localId", "GREATER_THAN", 10),
            ],
            [
                "specified using localId of metric specified by value",
                newMeasureValueFilter(ReferenceLdm.Amount, "GREATER_THAN", 10),
            ],
        ];

        it.each(Scenarios)("should convert %s", (_desc, filter) => {
            expect(convertMeasureValueFilter(filter)).toMatchSnapshot();
        });

        it("should throw exception if filter has idRef without type", () => {
            expect(() => {
                convertMeasureValueFilter(newMeasureValueFilter(idRef("ambiguous"), "GREATER_THAN", 10));
            }).toThrow();
        });

        it("should throw exception if filter is using uriRef", () => {
            expect(() => {
                convertMeasureValueFilter(newMeasureValueFilter(uriRef("unsupported"), "GREATER_THAN", 10));
            }).toThrow();
        });
    });
    describe("convert absolute date filter", () => {
        const Scenarios: Array<[string, any]> = [
            ["absolute date filter without 'to' attribute", absoluteFilter.withoutTo],
            ["absolute date filter without 'from' attribute", absoluteFilter.withoutFrom],
            [
                "absolute date filter from model to AFM with all attributes",
                newAbsoluteDateFilter(ReferenceLdmExt.ClosedDataDatasetRef, "2019-08-06", "2019-08-12"),
            ],
        ];

        it.each(Scenarios)("should convert %s", (_desc, input) => {
            expect(convertAbsoluteDateFilter(input)).toMatchSnapshot();
        });
    });
    describe("convert relative date filter", () => {
        const Scenarios: Array<[string, any]> = [
            [
                "year granularity",
                newRelativeDateFilter(ReferenceLdmExt.ClosedDataDatasetRef, DateGranularity.year, 2, 7),
            ],
            [
                "month granularity",
                newRelativeDateFilter(ReferenceLdmExt.ClosedDataDatasetRef, DateGranularity.month, -3, 9),
            ],
            [
                "quarter granularity",
                newRelativeDateFilter(ReferenceLdmExt.ClosedDataDatasetRef, DateGranularity.quarter, 25, -2),
            ],
            [
                "date granularity",
                newRelativeDateFilter(ReferenceLdmExt.ClosedDataDatasetRef, DateGranularity.date, -11, 0),
            ],
            [
                "week granularity",
                newRelativeDateFilter(ReferenceLdmExt.ClosedDataDatasetRef, DateGranularity.week, 50, 100),
            ],
            ["missing 'to' parameter", relativeFilter.withoutTo],
            ["mission 'from' parameter", relativeFilter.withoutFrom],
        ];
        it.each(Scenarios)("should return AFM relative date filter with %s", (_desc, input) => {
            expect(convertRelativeDateFilter(input)).toMatchSnapshot();
        });
    });
    describe("convert visualization object filter", () => {
        const Scenarios: Array<[string, any]> = [
            ["positive attribute filter", newPositiveAttributeFilter(ReferenceLdm.Product.Name, ["value"])],
            [
                "negative attribute filter",
                newNegativeAttributeFilter(ReferenceLdm.Product.Name, ["other value"]),
            ],
            ["null when filter is empty", newNegativeAttributeFilter(ReferenceLdm.Product.Name, [])],
            [
                "absolute date filter",
                newAbsoluteDateFilter(ReferenceLdmExt.ClosedDataDatasetRef, "2019-08-06", "2019-08-12"),
            ],
            [
                "relative date filter",
                newRelativeDateFilter(ReferenceLdmExt.ClosedDataDatasetRef, DateGranularity.date, 20, 30),
            ],
            ["comparison measure value filter", newMeasureValueFilter(ReferenceLdm.Won, "GREATER_THAN", 128)],
            [
                "comparison measure value filter with treatNullValueAs",
                newMeasureValueFilter(ReferenceLdm.Won, "GREATER_THAN", 128, 0),
            ],
            ["range measure value filter", newMeasureValueFilter(ReferenceLdm.Won, "BETWEEN", 64, 128)],
            [
                "range measure value filter with treatNullValueAs",
                newMeasureValueFilter(ReferenceLdm.Won, "BETWEEN", 64, 128, 0),
            ],
            [
                "range measure value filter with crossed boundaries",
                newMeasureValueFilter(ReferenceLdm.Won, "BETWEEN", 128, 64),
            ],
        ];
        it.each(Scenarios)("should return %s", (_desc, input) => {
            expect(convertVisualizationObjectFilter(input)).toMatchSnapshot();
        });

        it("should throw an error since tiger database only supports specifying positive attribute elements by value", () => {
            expect(() =>
                convertVisualizationObjectFilter(visualizationObjectFilter.positiveAttributeFilter),
            ).toThrowErrorMatchingSnapshot();
        });

        it("should throw an error since tiger database only supports specifying negative attribute elements by value", () => {
            expect(() =>
                convertVisualizationObjectFilter(visualizationObjectFilter.negativeAttributeFilter),
            ).toThrowErrorMatchingSnapshot();
        });

        it("should filter out empty attribute filters and not cause RAIL-2083", () => {
            const emptyPositiveFilter = newPositiveAttributeFilter(ReferenceLdm.Product.Name, []);
            const emptyNegativeFilter = newNegativeAttributeFilter(ReferenceLdm.Product.Name, []);

            expect(convertVisualizationObjectFilter(emptyPositiveFilter)).toBeNull();
            expect(convertVisualizationObjectFilter(emptyNegativeFilter)).toBeNull();
        });
    });

    describe("ranking filters", () => {
        it("should return null since tiger does not support ranking filters", () => {
            const rankingFilter = newRankingFilter(ReferenceLdm.Won, "TOP", 10);
            expect(convertVisualizationObjectFilter(rankingFilter)).toBeNull();
        });
    });
});
