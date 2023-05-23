// (C) 2019-2022 GoodData Corporation

import {
    DateGranularity,
    defFingerprint,
    defSetDimensions,
    defSetSorts,
    defTotals,
    emptyDef,
    ITotal,
    MeasureGroupIdentifier,
    newAbsoluteDateFilter,
    newAttributeSort,
    newBucket,
    newDefForBuckets,
    newDefForItems,
    newDimension,
    newMeasureSort,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newRelativeDateFilter,
    newTotal,
    newTwoDimensional,
} from "../../../index.js";
import { Account, Activity, Won } from "../../../../__mocks__/model.js";
import { IFilter } from "../../filter/index.js";
import { defSetPostProcessing, defWithFilters, IPostProcessing } from "../index.js";

const Workspace = "testWorkspace";

const PositiveFilter = newPositiveAttributeFilter(Account.Name, ["myAccount"]);
const EmptyNegativeFilter = newNegativeAttributeFilter(Activity.Subject, []);
const RelativeDateFilter = newRelativeDateFilter("myDs", DateGranularity.month, 0, -10);
const AbsoluteDateFilter = newAbsoluteDateFilter("myDs", "01-01-2019", "10-10-2019");

const EmptyDef = emptyDef(Workspace);
const DefWithFilters = newDefForItems(
    Workspace,
    [Account.Name, Activity.Subject, Won],
    [PositiveFilter, RelativeDateFilter],
);

describe("defWithFilters", () => {
    const Scenarios: Array<[string, any, any, IFilter[]]> = [
        ["do nothing if no extra filters are not specified", EmptyDef, [], []],
        ["do nothing if extra filters undef", EmptyDef, null, []],
        [
            "do nothing if no extra filters and filters already in def",
            DefWithFilters,
            [],
            [PositiveFilter, RelativeDateFilter],
        ],
        [
            "not strip away negative attr filter",
            DefWithFilters,
            [EmptyNegativeFilter],
            [PositiveFilter, EmptyNegativeFilter, RelativeDateFilter],
        ],
        [
            "add new filters when def has none",
            EmptyDef,
            [PositiveFilter, RelativeDateFilter],
            [PositiveFilter, RelativeDateFilter],
        ],
        [
            "prefer last-specified date filter",
            DefWithFilters,
            [AbsoluteDateFilter],
            [PositiveFilter, AbsoluteDateFilter],
        ],
    ];

    it.each(Scenarios)("should %s", (_desc, defArg, filtersArg, expectedResult) => {
        expect(defWithFilters(defArg, filtersArg).filters).toEqual(expectedResult);
    });
});

describe("defSetSorts", () => {
    const AttributeSort = newAttributeSort(Account.Name, "asc");

    it("should set sorting when no sorts defined", () => {
        expect(defSetSorts(EmptyDef, [AttributeSort]).sortBy).toEqual([AttributeSort]);
    });

    it("should override sorting ", () => {
        const defWithSort = defSetSorts(EmptyDef, [AttributeSort]);
        const newSort = newMeasureSort(Won, "desc");

        expect(defSetSorts(defWithSort, [newSort]).sortBy).toEqual([newSort]);
    });

    it("should clean sorts if new sorts undefined", () => {
        const defWithSort = defSetSorts(EmptyDef, [AttributeSort]);

        expect(defSetSorts(defWithSort).sortBy).toEqual([]);
    });
});

describe("defSetDimensions", () => {
    const Dimension = newDimension(["localId1"]);

    it("should set dimension when no dim defined", () => {
        expect(defSetDimensions(EmptyDef, [Dimension]).dimensions).toEqual([Dimension]);
    });

    it("should override dimension when no dim defined", () => {
        const defWithDim = defSetDimensions(EmptyDef, [Dimension]);
        const newDims = newTwoDimensional(["localId1"], [MeasureGroupIdentifier]);

        expect(defSetDimensions(defWithDim, newDims).dimensions).toEqual(newDims);
    });

    it("should clean dimension if new dim undefined", () => {
        const defWithDim = defSetDimensions(EmptyDef, [Dimension]);

        expect(defSetDimensions(defWithDim).dimensions).toEqual([]);
    });
});

describe("defTotals", () => {
    const Total = newTotal("sum", Won, Account.Name);
    const Dimensions = newTwoDimensional(["localId1"], [MeasureGroupIdentifier, Total]);
    const DefWithDims = defSetDimensions(EmptyDef, Dimensions);

    const Scenarios: Array<[string, any, any, ITotal[]]> = [
        ["empty array if dim idx out of bounds (no dims at all)", EmptyDef, 100, []],
        ["empty array if dim idx out of bounds (has dims)", DefWithDims, 2, []],
        ["empty array if dim has no totals", DefWithDims, 0, []],
        ["array with totals if dim has them", DefWithDims, 1, [Total]],
    ];

    it.each(Scenarios)("should return %s", (_desc, defArg, dimArg, expectedResult) => {
        expect(defTotals(defArg, dimArg)).toEqual(expectedResult);
    });
});

describe("defFingerprint", () => {
    const DefWithAttr = newDefForItems(Workspace, [Account.Name]);
    const DefWithAttrAndMeasure = newDefForItems(Workspace, [Account.Name, Won]);
    const DefWithAttrAndMeasureAndSorts = defSetSorts(DefWithAttrAndMeasure, [
        newAttributeSort(Account.Name, "desc"),
    ]);
    const DefWithAttrAndMeasureAndFilter = defWithFilters(DefWithAttrAndMeasure, [PositiveFilter]);
    const DefWithAttrAndMeasureAndDims = defSetDimensions(
        DefWithAttrAndMeasure,
        newTwoDimensional([Account.Name], [MeasureGroupIdentifier]),
    );

    const DefWithAttrFromBuckets = newDefForBuckets(Workspace, [newBucket("attr", Account.Name)]);

    const Scenarios: Array<[boolean, string, any, any]> = [
        [true, "empty defs on same workspace", emptyDef("test1"), emptyDef("test1")],
        [false, "empty defs on diff workspace", emptyDef("test1"), emptyDef("test2")],
        [false, "def with added measure", DefWithAttr, DefWithAttrAndMeasure],
        [false, "def with added sorts", DefWithAttrAndMeasure, DefWithAttrAndMeasureAndSorts],
        [false, "def with added dimensions", DefWithAttrAndMeasure, DefWithAttrAndMeasureAndDims],
        [false, "def with added filters", DefWithAttrAndMeasure, DefWithAttrAndMeasureAndFilter],
        // bucket is just metadata for the execution; it has no impact on what the backend does
        [true, "def regardless of buckets presence", DefWithAttr, DefWithAttrFromBuckets],
    ];

    it.each(Scenarios)("should return %s for %s", (expectedResult, _desc, lhs, rhs) => {
        const leftFingerprint = defFingerprint(lhs);
        const rightFingerprint = defFingerprint(rhs);

        expect(leftFingerprint === rightFingerprint).toBe(expectedResult);
    });
});

describe("defSetPostProcessing", () => {
    const Scenarios: Array<[string, any]> = [
        ["MM/dd/yyyy", EmptyDef],
        ["dd/MM/yyyy", EmptyDef],
        ["dd-MM-yyyy", EmptyDef],
        ["yyyy-MM-dd", EmptyDef],
        ["M/d/y", EmptyDef],
        ["dd.MM.yyyy", EmptyDef],
    ];

    it.each(Scenarios)(
        'should return a new instance of execution definition with date format "%s"',
        (dateFormat, definition) => {
            const postProcessing: IPostProcessing = { dateFormat };
            const newDefWithDateFormat = defSetPostProcessing(definition, postProcessing);
            expect(newDefWithDateFormat).not.toBe(definition);
            expect(newDefWithDateFormat.postProcessing).toEqual(postProcessing);
        },
    );
});
