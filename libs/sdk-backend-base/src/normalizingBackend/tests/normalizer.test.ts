// (C) 2007-2020 GoodData Corporation

import {
    defaultDimensionsGenerator,
    defWithDimensions,
    IExecutionDefinition,
    IMeasure,
    IMeasureValueFilter,
    measureFilters,
    measureLocalId,
    measureMasterIdentifier,
    modifyAttribute,
    modifyMeasure,
    modifyPopMeasure,
    modifySimpleMeasure,
    newArithmeticMeasure,
    newBucket,
    newDefForBuckets,
    newDefForItems,
    newMeasureValueFilter,
    newNegativeAttributeFilter,
    newRankingFilter,
} from "@gooddata/sdk-model";
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { Normalizer } from "../normalizer";

// cannot be constructed using model functions - so doing this
const EmptyMvf = (measure: IMeasure): IMeasureValueFilter => {
    return {
        measureValueFilter: {
            measure: {
                localIdentifier: measureLocalId(measure),
            },
        },
    };
};

describe("Normalizer", () => {
    const Scenarios: Array<[string, IExecutionDefinition]> = [
        [
            "simple attributes and measures",
            newDefForItems("test", [
                ReferenceMd.Region,
                ReferenceMd.Product.Name,
                ReferenceMd.Won,
                ReferenceMdExt.MaxAmount,
                ReferenceMdExt.AmountWithRatio,
            ]),
        ],
        [
            "duplicate attributes and measures",
            newDefForItems("test", [
                ReferenceMd.Region,
                modifyAttribute(ReferenceMd.Region, (m) => m.localId("duplicateAttr")),
                ReferenceMd.Won,
                modifyMeasure(ReferenceMd.Won, (m) => m.localId("duplicateMeasure")),
            ]),
        ],
        [
            "derived measures",
            newDefForItems("test", [
                ReferenceMd.Won,
                ReferenceMdExt.WonPopClosedYear,
                ReferenceMdExt.WonPreviousPeriod,
            ]),
        ],
        [
            "arithmetic measures",
            newDefForItems("test", [
                ReferenceMd.Won,
                ReferenceMd.Amount,
                ReferenceMdExt.CalculatedLost,
                ReferenceMdExt.CalculatedWonLostRatio,
            ]),
        ],
        [
            "arithmetic measures when mixed between their operands",
            newDefForItems("test", [ReferenceMd.Amount, ReferenceMdExt.CalculatedLost, ReferenceMd.Won]),
        ],
        [
            "simple measures with filters",
            newDefForItems("test", [
                ReferenceMd.Won,
                modifySimpleMeasure(ReferenceMd.Won, (m) =>
                    m
                        .filters(newNegativeAttributeFilter(ReferenceMd.Region, ["East Coast"]))
                        .defaultLocalId(),
                ),
            ]),
        ],
        [
            "measure value filters",
            newDefForItems(
                "test",
                [
                    ReferenceMd.Won,
                    ReferenceMd.Amount,
                    ReferenceMdExt.CalculatedLost,
                    ReferenceMdExt.CalculatedWonLostRatio,
                ],
                [newMeasureValueFilter(ReferenceMdExt.CalculatedWonLostRatio, "EQUAL_TO", 1)],
            ),
        ],
        [
            "ranking filters",
            newDefForItems(
                "test",
                [
                    modifyMeasure(ReferenceMd.Won, (m) => m.localId("someMeasure")),
                    modifyAttribute(ReferenceMd.Region, (a) => a.localId("someAttr")),
                    ReferenceMd.Product.Name,
                ],
                [
                    newRankingFilter(
                        { localIdentifier: "someMeasure" },
                        [{ localIdentifier: "someAttr" }],
                        "TOP",
                        1,
                    ),
                ],
            ),
        ],
    ];

    it.each(Scenarios)("should normalize %s", (_desc, definition) => {
        const withDims = defWithDimensions(definition, defaultDimensionsGenerator);
        const result = Normalizer.normalize(withDims);

        expect(result.normalized).toMatchSnapshot();
    });

    it("should strip away empty negative attr filter (noop)", () => {
        const def = newDefForItems(
            "test",
            [ReferenceMd.Region, ReferenceMd.Won],
            [newNegativeAttributeFilter(ReferenceMd.Region, [])],
        );

        const result = Normalizer.normalize(def);

        expect(result.normalized.filters).toEqual([]);
    });

    it("should strip away empty negative attr filter (noop) from simple measure", () => {
        const def = newDefForItems("test", [
            modifySimpleMeasure(ReferenceMd.Won, (m) =>
                m.filters(newNegativeAttributeFilter(ReferenceMd.Region, [])),
            ),
        ]);

        const result = Normalizer.normalize(def);

        expect(measureFilters(result.normalized.measures[0])).toEqual([]);
    });

    it("should strip away empty measure value filter (noop)", () => {
        const def = newDefForItems(
            "test",
            [ReferenceMd.Region, ReferenceMd.Won],
            [EmptyMvf(ReferenceMd.Won)],
        );

        const result = Normalizer.normalize(def);

        expect(result.normalized.filters).toEqual([]);
    });

    it("should throw if dangling references", () => {
        const def = newDefForItems("test", [ReferenceMdExt.CalculatedLost]);

        expect(() => Normalizer.normalize(def)).toThrow();
    });

    it("should throw if circular references", () => {
        const def = newDefForItems("test", [
            ReferenceMd.Won,
            newArithmeticMeasure([ReferenceMd.Won, "cycle"], "multiplication", (m) => m.localId("cycle")),
        ]);

        expect(() => Normalizer.normalize(def)).toThrow();
    });

    it("should also normalize buckets", () => {
        const buckets = [
            newBucket(
                "bucket",
                ReferenceMd.Won,
                ReferenceMd.Amount,
                ReferenceMdExt.CalculatedLost,
                ReferenceMdExt.CalculatedWonLostRatio,
            ),
        ];

        const def = newDefForBuckets("test", buckets);

        const result = Normalizer.normalize(def);
        expect(result.normalized.buckets).not.toEqual(result.original.buckets);
    });

    it("should correctly assign localIds and not hit RAIL-2631", () => {
        const def = newDefForItems("test", [
            modifyPopMeasure(ReferenceMdExt.WonPopClosedYear, (m) =>
                m.localId("previousPeriodLocalId").masterMeasure("someCustomLocalId"),
            ),
            modifyMeasure(ReferenceMd.Won, (m) => m.localId("someCustomLocalId")),
        ]);
        const result = Normalizer.normalize(def);

        expect(measureMasterIdentifier(result.normalized.measures[0])).toEqual(
            measureLocalId(result.normalized.measures[1]),
        );
    });
});
