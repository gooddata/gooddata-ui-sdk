// (C) 2020 GoodData Corporation
import {
    convertAbsoluteDateFilter,
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
} from "@gooddata/sdk-model";
import { ReferenceLdmExt, ReferenceLdm } from "@gooddata/reference-workspace";

describe("tiger filter converter from model to AFM", () => {
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
        ];
        it.each(Scenarios)("should return %s", (_desc, input) => {
            expect(convertVisualizationObjectFilter(input)).toMatchSnapshot();
        });

        it("should throw an error since tiger database only supports specifying attribute elements by value", () => {
            expect(() =>
                convertVisualizationObjectFilter(visualizationObjectFilter.positiveAttributeFilter),
            ).toThrowErrorMatchingSnapshot();
        });

        it("should throw an error since tiger database only supports specifying attribute elements by value", () => {
            expect(() =>
                convertVisualizationObjectFilter(visualizationObjectFilter.negativeAttributeFilter),
            ).toThrowErrorMatchingSnapshot();
        });

        it("should throw an error when visualization object filter does not support measure value filters", () => {
            expect(() =>
                convertVisualizationObjectFilter(visualizationObjectFilter.measureValueFilter),
            ).toThrowErrorMatchingSnapshot();
        });

        it("should filter out empty attribute filters and not cause RAIL-2083", () => {
            const emptyPositiveFilter = newPositiveAttributeFilter(ReferenceLdm.Product.Name, []);
            const emptyNegativeFilter = newNegativeAttributeFilter(ReferenceLdm.Product.Name, []);

            expect(convertVisualizationObjectFilter(emptyPositiveFilter)).toBeNull();
            expect(convertVisualizationObjectFilter(emptyNegativeFilter)).toBeNull();
        });
    });
});
