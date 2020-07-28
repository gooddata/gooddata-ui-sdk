// (C) 2019-2020 GoodData Corporation

import {
    IFilter,
    ITotal,
    newAttributeLocator,
    newAttributeSort,
    newMeasureSort,
    newPositiveAttributeFilter,
    newTotal,
    ISortItem,
    IAttributeOrMeasure,
} from "../..";
import { newInsight } from "../../../__mocks__/insights";
import { Account, Activity, Velocity, Won } from "../../../__mocks__/model";
import { IAttribute } from "../../execution/attribute";
import { IBucket, newBucket } from "../../execution/buckets";
import { IMeasure } from "../../execution/measure";
import {
    insightAttributes,
    insightBucket,
    insightBuckets,
    insightHasAttributes,
    insightHasDataDefined,
    insightHasMeasures,
    insightMeasures,
    insightId,
    insightUri,
    insightIsLocked,
    insightCreated,
    insightUpdated,
    insightFilters,
    insightProperties,
    insightSetFilters,
    insightSetProperties,
    insightSetSorts,
    insightSorts,
    insightTotals,
    insightItems,
    VisualizationProperties,
    insightSetBuckets,
} from "../index";

const MixedBucket = newBucket("bucket1", Account.Name, Won);
const AttributeBucket = newBucket("bucket2", Activity.Subject);
const MeasureBucket = newBucket("bucket3", Velocity.Sum, Velocity.Min);

const AttributeFilter = newPositiveAttributeFilter(Account.Name, ["myAccount"]);

const VisClassId = "myVis";
const EmptyInsight = newInsight(VisClassId);
const InsightWithSingleBucket = newInsight(VisClassId, (m) => m.buckets([MixedBucket]));
const InsightWithTwoBuckets = newInsight(VisClassId, (m) => m.buckets([AttributeBucket, MixedBucket]));
const InsightWithThreeBuckets = newInsight(VisClassId, (m) =>
    m.buckets([MeasureBucket, AttributeBucket, MixedBucket]),
);
const InsightWithJustAttrBucket = newInsight(VisClassId, (m) => m.buckets([AttributeBucket]));
const InsightWithJustMeasureBucket = newInsight(VisClassId, (m) => m.buckets([MeasureBucket]));

const InvalidScenarios: Array<[string, any]> = [
    ["insight is undefined", undefined],
    ["insight is null", undefined],
];

describe("insightBucket", () => {
    const Scenarios: Array<[string, any, any, IBucket | undefined]> = [
        ["undefined when insight empty", EmptyInsight, undefined, undefined],
        ["undefined when predicate not matched", InsightWithSingleBucket, () => false, undefined],
        ["first found bucket by default", InsightWithTwoBuckets, undefined, AttributeBucket],
        ["bucket by id if predicate is string", InsightWithTwoBuckets, "bucket1", MixedBucket],
    ];

    it.each(Scenarios)("should return %s", (_desc, insightArg, predicateArg, expectedResult) => {
        expect(insightBucket(insightArg, predicateArg)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightBucket(input)).toThrow();
    });
});

describe("insightBuckets", () => {
    const Scenarios: Array<[string, any, any[], IBucket[]]> = [
        ["empty list if insight empty", EmptyInsight, [], []],
        ["all buckets if no ids provided", InsightWithTwoBuckets, [], [AttributeBucket, MixedBucket]],
        ["bucket matching ID", InsightWithTwoBuckets, ["bucket1"], [MixedBucket]],
    ];

    it.each(Scenarios)("should return %s", (_desc, insightArg, idsArg, expectedResult) => {
        expect(insightBuckets(insightArg, ...idsArg)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightBuckets(input)).toThrow();
    });
});

describe("insightItems", () => {
    const Scenarios: Array<[string, any, IAttributeOrMeasure[]]> = [
        ["nothing for empty insight", EmptyInsight, []],
        ["items from single bucket insight", InsightWithSingleBucket, [Account.Name, Won]],
        [
            "items from multiple buckets, in correct order",
            InsightWithThreeBuckets,
            [Velocity.Sum, Velocity.Min, Activity.Subject, Account.Name, Won],
        ],
    ];

    it.each(Scenarios)("should return %s", (_desc, insightArg, expectedResult) => {
        expect(insightItems(insightArg)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightMeasures(input)).toThrow();
    });
});

describe("insightMeasures", () => {
    const Scenarios: Array<[string, any, IMeasure[]]> = [
        ["no measures for empty insight", EmptyInsight, []],
        ["single measure from second bucket", InsightWithTwoBuckets, [Won]],
        [
            "measures in correct order from multiple buckets",
            InsightWithThreeBuckets,
            [Velocity.Sum, Velocity.Min, Won],
        ],
    ];

    it.each(Scenarios)("should return %s", (_desc, insightArg, expectedResult) => {
        expect(insightMeasures(insightArg)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightMeasures(input)).toThrow();
    });
});

describe("insightHasMeasures", () => {
    const Scenarios: Array<[boolean, string, any]> = [
        [false, "empty insight", EmptyInsight],
        [false, "attr-only insight", InsightWithJustAttrBucket],
        [true, "mixed bucket insight", InsightWithSingleBucket],
        [true, "measure-only insight", InsightWithJustMeasureBucket],
    ];

    it.each(Scenarios)("should return %s for %s", (expectedResult, _desc, insightArg) => {
        expect(insightHasMeasures(insightArg)).toBe(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightHasMeasures(input)).toThrow();
    });
});

describe("insightAttributes", () => {
    const Scenarios: Array<[string, any, IAttribute[]]> = [
        ["no attributes for empty insight", EmptyInsight, []],
        ["single attribute", InsightWithSingleBucket, [Account.Name]],
        [
            "measures in correct order from multiple buckets",
            InsightWithThreeBuckets,
            [Activity.Subject, Account.Name],
        ],
    ];

    it.each(Scenarios)("should return %s", (_desc, insightArg, expectedResult) => {
        expect(insightAttributes(insightArg)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightAttributes(input)).toThrow();
    });
});

describe("insightHasAttributes", () => {
    const Scenarios: Array<[boolean, string, any]> = [
        [false, "empty insight", EmptyInsight],
        [true, "attr-only insight", InsightWithJustAttrBucket],
        [true, "mixed bucket insight", InsightWithSingleBucket],
        [false, "measure-only insight", InsightWithJustMeasureBucket],
    ];

    it.each(Scenarios)("should return %s for %s", (expectedResult, _desc, insightArg) => {
        expect(insightHasAttributes(insightArg)).toBe(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightHasAttributes(input)).toThrow();
    });
});

describe("insightHasDataDefined", () => {
    const Scenarios: Array<[boolean, string, any]> = [
        [false, "empty insight", EmptyInsight],
        [true, "attr-only insight", InsightWithJustAttrBucket],
        [true, "mixed bucket insight", InsightWithSingleBucket],
        [true, "measure-only insight", InsightWithJustMeasureBucket],
    ];

    it.each(Scenarios)("should return %s for %s", (expectedResult, _desc, insightArg) => {
        expect(insightHasDataDefined(insightArg)).toBe(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightHasDataDefined(input)).toThrow();
    });
});

describe("insightFilters", () => {
    const InsightWithFilters = newInsight(VisClassId, (m) =>
        m.buckets([MixedBucket]).filters([AttributeFilter]),
    );

    const Scenarios: Array<[string, any, IFilter[]]> = [
        ["no filters for empty insight", EmptyInsight, []],
        ["no filters if insight without filters ", InsightWithTwoBuckets, []],
        ["filters from insight", InsightWithFilters, [AttributeFilter]],
    ];

    it.each(Scenarios)("should return %s", (_desc, insightArg, expectedResult) => {
        expect(insightFilters(insightArg)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightFilters(input)).toThrow();
    });
});

describe("insightSorts", () => {
    const AccountSort = newAttributeSort(Account.Name, "desc");
    const WonSort = newMeasureSort(Won, "asc");
    const WonAndAccountSort = newMeasureSort(Won, "asc", [newAttributeLocator(Account.Name, "myAccount")]);

    const InsightWithValidAttributeSort = newInsight(VisClassId, (m) =>
        m.buckets([MixedBucket]).sorts([AccountSort]),
    );
    const InsightWithValidMeasureSort1 = newInsight(VisClassId, (m) =>
        m.buckets([MixedBucket]).sorts([WonSort]),
    );
    const InsightWithValidMeasureSort2 = newInsight(VisClassId, (m) =>
        m.buckets([MixedBucket]).sorts([WonAndAccountSort]),
    );
    const InsightWithInvalidAttributeSort = newInsight(VisClassId, (m) =>
        m.buckets([MixedBucket]).sorts([newAttributeSort(Activity.Subject)]),
    );
    const InsightWithInvalidMeasureSort1 = newInsight(VisClassId, (m) =>
        m.buckets([MixedBucket]).sorts([newMeasureSort(Velocity.Min)]),
    );
    const InsightWithInvalidMeasureSort2 = newInsight(VisClassId, (m) =>
        m
            .buckets([MixedBucket])
            .sorts([newMeasureSort(Won, "desc", [newAttributeLocator(Activity.Subject, "myActivity")])]),
    );

    const Scenarios: Array<[string, any, ISortItem[]]> = [
        ["no sorts for empty insight", EmptyInsight, []],
        ["no sorts if insight without sorts ", InsightWithTwoBuckets, []],
        ["valid attribute sort", InsightWithValidAttributeSort, [AccountSort]],
        ["valid measure sort without locator", InsightWithValidMeasureSort1, [WonSort]],
        ["valid measure sort with locator", InsightWithValidMeasureSort2, [WonAndAccountSort]],
        ["no sorts for invalid attribute sort", InsightWithInvalidAttributeSort, []],
        ["no sorts for invalid measure sort without locator", InsightWithInvalidMeasureSort1, []],
        ["no sorts for invalid attr locator in measure sort", InsightWithInvalidMeasureSort2, []],
    ];

    it.each(Scenarios)("should return %s", (_desc, insightArg, expectedResult) => {
        expect(insightSorts(insightArg)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightSorts(input)).toThrow();
    });
});

describe("insightTotals", () => {
    const Total = newTotal("sum", Won, Account.Name);
    const BucketWithTotals = newBucket("bucketWithTotals", Won, Account.Name, Total);
    const InsightWithTotals = newInsight(VisClassId, (m) => m.buckets([BucketWithTotals]));

    const Scenarios: Array<[string, any, ITotal[]]> = [
        ["no totals for empty insight", EmptyInsight, []],
        ["no totals if insight without totals ", InsightWithTwoBuckets, []],
        ["totals from insight", InsightWithTotals, [Total]],
    ];

    it.each(Scenarios)("should return %s", (_desc, insightArg, expectedResult) => {
        expect(insightTotals(insightArg)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightTotals(input)).toThrow();
    });
});

describe("insightProperties", () => {
    const Properties = { grid: true };
    const InsightWithProperties = newInsight(VisClassId, (m) =>
        m.buckets([MixedBucket]).properties(Properties),
    );

    const Scenarios: Array<[string, any, VisualizationProperties]> = [
        ["no properties for empty insight", EmptyInsight, {}],
        ["no properties if insight without properties ", InsightWithTwoBuckets, {}],
        ["totals from insight", InsightWithProperties, Properties],
    ];

    it.each(Scenarios)("should return %s", (_desc, insightArg, expectedResult) => {
        expect(insightProperties(insightArg)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightProperties(input)).toThrow();
    });
});

describe("insightId", () => {
    it("should return the identifier", () => {
        expect(insightId(EmptyInsight)).toEqual("random");
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightId(input)).toThrow();
    });
});

describe("insightUri", () => {
    it("should return the uri", () => {
        expect(insightUri(EmptyInsight)).toEqual("random");
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightUri(input)).toThrow();
    });
});

describe("insightIsLocked", () => {
    const LockedInsight = newInsight(VisClassId, (m) => m.isLocked(true));

    const Scenarios: Array<[boolean, string, any]> = [
        [false, "non-locked insight", EmptyInsight],
        [true, "locked insight", LockedInsight],
    ];

    it.each(Scenarios)("should return %s for %s", (expectedResult, _desc, insightArg) => {
        expect(insightIsLocked(insightArg)).toBe(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightIsLocked(input)).toThrow();
    });
});

describe("insightCreated", () => {
    const insightCreatedDate = "2020-01-31 13:24:07";
    const SavedInsight = newInsight(VisClassId, (m) => m.created(insightCreatedDate));

    const Scenarios: Array<[string | undefined, string, any]> = [
        [undefined, "insight that has not been saved", EmptyInsight],
        [insightCreatedDate, "saved insight", SavedInsight],
    ];

    it.each(Scenarios)("should return %s for %s", (expectedResult, _desc, insightArg) => {
        expect(insightCreated(insightArg)).toBe(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightCreated(input)).toThrow();
    });
});

describe("insightUpdated", () => {
    const insightUpdatedDate = "2020-01-31 13:24:07";
    const UpdatedInsight = newInsight(VisClassId, (m) => m.updated(insightUpdatedDate));

    const Scenarios: Array<[string | undefined, string, any]> = [
        [undefined, "insight that has not been updated", EmptyInsight],
        [insightUpdatedDate, "updated insight", UpdatedInsight],
    ];

    it.each(Scenarios)("should return %s for %s", (expectedResult, _desc, insightArg) => {
        expect(insightUpdated(insightArg)).toBe(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightUpdated(input)).toThrow();
    });
});

describe("insightSetFilters", () => {
    const AccountFilter = newPositiveAttributeFilter(Account.Name, { values: ["foo"] });
    const ActivityFilter = newPositiveAttributeFilter(Activity.Subject, { values: ["bar"] });

    it("should set new filters in insight without them", () => {
        expect(insightSetFilters(EmptyInsight, [AccountFilter]).insight.filters).toEqual([AccountFilter]);
    });

    it("should overwrite filters in insight that has them", () => {
        const InsightWithSomeFilters = insightSetFilters(EmptyInsight, [AccountFilter]);

        expect(insightSetFilters(InsightWithSomeFilters, [ActivityFilter]).insight.filters).toEqual([
            ActivityFilter,
        ]);
    });

    it("should clear filters if called without parameter", () => {
        const InsightWithSomeFilters = insightSetFilters(EmptyInsight, [AccountFilter]);

        expect(insightSetFilters(InsightWithSomeFilters).insight.filters).toEqual([]);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightSetFilters(input)).toThrow();
    });
});

describe("insightSetSorts", () => {
    const AccountSort = newAttributeSort(Account.Name, "desc");
    const WonSort = newMeasureSort(Won, "asc");

    it("should set new sorts in insight without them", () => {
        expect(insightSetSorts(EmptyInsight, [AccountSort]).insight.sorts).toEqual([AccountSort]);
    });

    it("should overwrite sorts in insight that has them", () => {
        const InsightWithSomeSorts = insightSetSorts(EmptyInsight, [AccountSort]);

        expect(insightSetSorts(InsightWithSomeSorts, [WonSort]).insight.sorts).toEqual([WonSort]);
    });

    it("should clear sorts if called without parameter", () => {
        const InsightWithSomeSorts = insightSetSorts(EmptyInsight, [AccountSort]);

        expect(insightSetSorts(InsightWithSomeSorts).insight.sorts).toEqual([]);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightSetSorts(input)).toThrow();
    });
});

describe("insightSetProperties", () => {
    const SampleProperties1 = { grid: true };
    const SampleProperties2 = { grid: false };

    it("should set new properties in insight without them", () => {
        expect(insightSetProperties(EmptyInsight, SampleProperties1).insight.properties).toEqual(
            SampleProperties1,
        );
    });

    it("should overwrite properties in insight that has them", () => {
        const InsightWithSomeProperties = insightSetProperties(EmptyInsight, SampleProperties1);

        expect(insightSetProperties(InsightWithSomeProperties, SampleProperties2).insight.properties).toEqual(
            SampleProperties2,
        );
    });

    it("should clear properties if called without parameter", () => {
        const InsightWithSomeProperties = insightSetProperties(EmptyInsight, SampleProperties1);

        expect(insightSetProperties(InsightWithSomeProperties).insight.properties).toEqual({});
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightSetProperties(input)).toThrow();
    });
});

describe("insightSetBuckets", () => {
    const SampleBuckets1: IBucket[] = [newBucket("foo", Activity.Default)];
    const SampleBuckets2: IBucket[] = [newBucket("bar", Account.Default)];

    it("should overwrite bucket in an insight", () => {
        const InsightWithSomeBuckets = insightSetBuckets(EmptyInsight, SampleBuckets1);

        expect(insightSetBuckets(InsightWithSomeBuckets, SampleBuckets2).insight.buckets).toEqual(
            SampleBuckets2,
        );
    });

    it("should clear buckets if called without parameter", () => {
        const InsightWithSomeBuckets = insightSetBuckets(EmptyInsight, SampleBuckets1);

        expect(insightSetBuckets(InsightWithSomeBuckets).insight.buckets).toEqual([]);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => insightSetBuckets(input)).toThrow();
    });
});
