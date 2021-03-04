// (C) 2020-2021 GoodData Corporation
import { convertFilter, newFilterWithApplyOnResult } from "../FilterConverter";
import { absoluteFilter, relativeFilter } from "./InvalidInputs.fixture";
import {
    DateGranularity,
    idRef,
    IMeasureValueFilter,
    newAbsoluteDateFilter,
    newMeasureValueFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRankingFilter,
    newRelativeDateFilter,
    uriRef,
} from "@gooddata/sdk-model";
import { ReferenceLdm } from "@gooddata/reference-workspace";

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
            expect(convertFilter(filter)).toMatchSnapshot();
        });

        it("should throw exception if filter has idRef without type", () => {
            expect(() => {
                convertFilter(newMeasureValueFilter(idRef("ambiguous"), "GREATER_THAN", 10));
            }).toThrow();
        });

        it("should throw exception if filter is using uriRef", () => {
            expect(() => {
                convertFilter(newMeasureValueFilter(uriRef("unsupported"), "GREATER_THAN", 10));
            }).toThrow();
        });
    });
    describe("convert absolute date filter", () => {
        const Scenarios: Array<[string, any]> = [
            ["absolute date filter without 'to' attribute", absoluteFilter.withoutTo],
            ["absolute date filter without 'from' attribute", absoluteFilter.withoutFrom],
            [
                "absolute date filter from model to AFM with all attributes",
                newAbsoluteDateFilter(ReferenceLdm.DateDatasets.Closed.ref, "2019-08-06", "2019-08-12"),
            ],
        ];

        it.each(Scenarios)("should convert %s", (_desc, input) => {
            expect(convertFilter(input)).toMatchSnapshot();
        });
    });
    describe("convert relative date filter", () => {
        const Scenarios: Array<[string, any]> = [
            [
                "year granularity",
                newRelativeDateFilter(ReferenceLdm.DateDatasets.Closed.ref, DateGranularity.year, 2, 7),
            ],
            [
                "month granularity",
                newRelativeDateFilter(ReferenceLdm.DateDatasets.Closed.ref, DateGranularity.month, -3, 9),
            ],
            [
                "quarter granularity",
                newRelativeDateFilter(ReferenceLdm.DateDatasets.Closed.ref, DateGranularity.quarter, 25, -2),
            ],
            [
                "date granularity",
                newRelativeDateFilter(ReferenceLdm.DateDatasets.Closed.ref, DateGranularity.date, -11, 0),
            ],
            [
                "week granularity",
                newRelativeDateFilter(ReferenceLdm.DateDatasets.Closed.ref, DateGranularity.week, 50, 100),
            ],
            ["missing 'to' parameter", relativeFilter.withoutTo],
            ["mission 'from' parameter", relativeFilter.withoutFrom],
        ];
        it.each(Scenarios)("should return AFM relative date filter with %s", (_desc, input) => {
            expect(convertFilter(input)).toMatchSnapshot();
        });
    });
    describe("convert filter", () => {
        const positiveAttributeFilter = newPositiveAttributeFilter(ReferenceLdm.Product.Name, ["value"]);
        const negativeAttributeFilter = newNegativeAttributeFilter(ReferenceLdm.Product.Name, ["value 2"]);
        const positiveAttributeFilterWithUris = newPositiveAttributeFilter(ReferenceLdm.Product.Name, {
            uris: ["value"],
        });
        const negativeAttributeFilterWithUris = newNegativeAttributeFilter(ReferenceLdm.Product.Name, {
            uris: ["value"],
        });

        const Scenarios: Array<[string, any]> = [
            ["positive attribute filter", positiveAttributeFilter],
            ["positive attribute filter with uri attribute elements", positiveAttributeFilterWithUris],
            [
                "positive attribute filter with applyOnResult true",
                newFilterWithApplyOnResult(positiveAttributeFilter, true),
            ],
            ["negative attribute filter", negativeAttributeFilter],
            ["negative attribute filter with uri attribute elements", negativeAttributeFilterWithUris],
            [
                "negative attribute filter with applyOnResult false",
                newFilterWithApplyOnResult(negativeAttributeFilter, false),
            ],
            [
                "absolute date filter",
                newAbsoluteDateFilter(ReferenceLdm.DateDatasets.Closed.ref, "2019-08-06", "2019-08-12"),
            ],
            [
                "relative date filter",
                newRelativeDateFilter(ReferenceLdm.DateDatasets.Closed.ref, DateGranularity.date, 20, 30),
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
            ["ranking filter", newRankingFilter(ReferenceLdm.Won, "BOTTOM", 3)],
            [
                "ranking filter with attributes",
                newRankingFilter(ReferenceLdm.Won, [ReferenceLdm.IsActive.attribute.displayForm], "TOP", 3),
            ],
        ];
        it.each(Scenarios)("should return %s", (_desc, input) => {
            expect(convertFilter(input)).toMatchSnapshot();
        });

        it("should filter out empty attribute filters and not cause RAIL-2083", () => {
            const emptyPositiveFilter = newPositiveAttributeFilter(ReferenceLdm.Product.Name, []);
            const emptyNegativeFilter = newNegativeAttributeFilter(ReferenceLdm.Product.Name, []);

            expect(convertFilter(emptyPositiveFilter)).toBeNull();
            expect(convertFilter(emptyNegativeFilter)).toBeNull();
        });
    });
});
