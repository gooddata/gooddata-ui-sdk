// (C) 2019-2020 GoodData Corporation

import {
    DateGranularity,
    defaultDimensionsGenerator,
    newAttributeSort,
    newBucket,
    newDefForBuckets,
    newDefForInsight,
    newMeasureValueFilter,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
} from "../../../index.js";
import { newInsight } from "../../../../__mocks__/insights.js";
import { Account, Activity, Department, Velocity, Won } from "../../../../__mocks__/model.js";
import { emptyDef, newDefForItems } from "../factory.js";

const Workspace = "testWorkspace";
const VisClassId = "testTable";

describe("emptyDef", () => {
    it("should create def with all fields empty", () => {
        expect(emptyDef(Workspace)).toMatchSnapshot();
    });
});

const PositiveFilter = newPositiveAttributeFilter(Account.Name, ["myAccount"]);
const RelativeDateFilter = newRelativeDateFilter({ identifier: "myDs" }, DateGranularity.month, 0, -10);
const MeasureValueFilter = newMeasureValueFilter(Won, "EQUAL_TO", 11);
const EmptyBucket = newBucket("emptyBucket");
const AttributeBucket = newBucket("attributeBucket", Account.Name);
const AttributeBucket2 = newBucket("attributeBucket", Department);
const MeasureBucket = newBucket("measureBucket", Won);
const MixedBucket = newBucket("mixedBucket", Activity.Subject, Velocity.Sum);
const AttributeSort = newAttributeSort(Activity.Subject, "asc");

describe("newDefForItems", () => {
    const Scenarios: Array<[string, any, any]> = [
        ["empty def if no items", [], undefined],
        ["def with just attributes", [Account.Name, Activity.Subject], undefined],
        ["def with just measures", [Won, Velocity.Sum], undefined],
        ["def with attributes and measures", [Account.Name, Activity.Subject, Won, Velocity.Sum], undefined],
        [
            "def with order of attributes and measures retained",
            [Account.Name, Won, Activity.Subject, Velocity.Sum],
            undefined,
        ],
        ["def with attr filter", [Account.Name], [PositiveFilter]],
        ["def with date filter", [Account.Name], [RelativeDateFilter]],
        ["def with measure value filter", [Account.Name], [MeasureValueFilter]],
        ["def with mixed filters", [Account.Name], [RelativeDateFilter, PositiveFilter, MeasureValueFilter]],
    ];

    it.each(Scenarios)("should create %s", (_desc, itemArgs, filterArgs) => {
        expect(newDefForItems(Workspace, itemArgs, filterArgs)).toMatchSnapshot();
    });
});

describe("newDefForBuckets", () => {
    const Scenarios: Array<[string, any, any]> = [
        ["empty def if no buckets", [], undefined],
        ["def with no attributes or measures for empty bucket", [EmptyBucket], undefined],
        ["def with just attributes for attr bucket", [AttributeBucket], undefined],
        ["def with just measures for measure bucket", [MeasureBucket], undefined],
        [
            "def with ordering of attributes and measures retained",
            [MixedBucket, AttributeBucket, MeasureBucket],
            undefined,
        ],
        ["def with attr filter", [MixedBucket], [PositiveFilter]],
        ["def with date filter", [MixedBucket], [RelativeDateFilter]],
        ["def with measure value filter", [MixedBucket], [MeasureValueFilter]],
        ["def with mixed filters", [MixedBucket], [RelativeDateFilter, PositiveFilter, MeasureValueFilter]],
    ];

    it.each(Scenarios)("should create %s", (_desc, bucketArgs, filterArgs) => {
        expect(newDefForBuckets(Workspace, bucketArgs, filterArgs)).toMatchSnapshot();
    });
});

describe("newDefForInsight", () => {
    const EmptyInsight = newInsight(VisClassId);
    const InsightWithJustBuckets = newInsight(VisClassId, (m) => m.buckets([MixedBucket]));
    const InsightWithBucketsAndFilters = newInsight(VisClassId, (m) =>
        m.buckets([MixedBucket]).filters([PositiveFilter]),
    );
    const InsightWithBucketsAndMeasureValueFilter = newInsight(VisClassId, (m) =>
        m.buckets([MixedBucket]).filters([MeasureValueFilter]),
    );
    const InsightWithSorts = newInsight(VisClassId, (m) => m.buckets([MixedBucket]).sorts([AttributeSort]));

    const Scenarios: Array<[string, any, any]> = [
        ["empty def if empty insight", EmptyInsight, undefined],
        ["def with attribute and measure", InsightWithJustBuckets, undefined],
        ["def with AFM", InsightWithBucketsAndFilters, undefined],
        ["def with sorts", InsightWithSorts, undefined],
        [
            "def with extra filter merged with insight filter",
            InsightWithBucketsAndFilters,
            [RelativeDateFilter],
        ],
        [
            "def with extra measure filter merged with insight filter",
            InsightWithBucketsAndMeasureValueFilter,
            [MeasureValueFilter],
        ],
        [
            "def with filters merged in",
            InsightWithSorts,
            [PositiveFilter, RelativeDateFilter, MeasureValueFilter],
        ],
    ];

    it.each(Scenarios)("should create %s", (_desc, insightArg, filterArgs) => {
        expect(newDefForInsight(Workspace, insightArg, filterArgs)).toMatchSnapshot();
    });
});

describe("defaultDimensionsGenerator", () => {
    const Scenarios: Array<[string, any]> = [
        [
            "single dim when just attributes in def",
            newDefForItems(Workspace, [Account.Name, Activity.Subject]),
        ],
        [
            "two dim when attributes and measures in def",
            newDefForItems(Workspace, [Account.Name, Activity.Subject, Won, Velocity.Sum]),
        ],
        ["single dim when single attr bucket", newDefForBuckets(Workspace, [AttributeBucket])],
        ["two dim when bucket with both attr and measure", newDefForBuckets(Workspace, [MixedBucket])],
        [
            "two dim with attributes divided in two dims",
            newDefForBuckets(Workspace, [AttributeBucket, MixedBucket, AttributeBucket2]),
        ],
        [
            "two dim with measure group in first dim if measure in first bucket",
            newDefForBuckets(Workspace, [MeasureBucket, AttributeBucket]),
        ],
        [
            "two dim with measure group in second dim if measure in second bucket",
            newDefForBuckets(Workspace, [AttributeBucket, MeasureBucket]),
        ],
    ];

    it.each(Scenarios)("should create %s", (_desc, execArg) => {
        expect(defaultDimensionsGenerator(execArg)).toMatchSnapshot();
    });
});
