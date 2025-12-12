// (C) 2007-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import {
    type IExecutionDefinition,
    type IMeasure,
    type IMeasureDescriptor,
    type IMeasureGroupDescriptor,
    type IMeasureValueFilter,
    defWithDimensions,
    defaultDimensionsGenerator,
    idRef,
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
    newMeasure,
    newMeasureValueFilter,
    newMeasureValueFilterWithOptions,
    newNegativeAttributeFilter,
    newPopMeasure,
    newPreviousPeriodMeasure,
    newRankingFilter,
    newTotal,
} from "@gooddata/sdk-model";

import { Denormalizer, Normalizer } from "../normalizer.js";

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
                ReferenceMd.Region.Default,
                ReferenceMd.Product.Name,
                ReferenceMd.Won,
                ReferenceMdExt.MaxAmount,
                ReferenceMdExt.AmountWithRatio,
            ]),
        ],
        [
            "duplicate attributes and measures",
            newDefForItems("test", [
                ReferenceMd.Region.Default,
                modifyAttribute(ReferenceMd.Region.Default, (m) => m.localId("duplicateAttr")),
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
                        .filters(newNegativeAttributeFilter(ReferenceMd.Region.Default, ["East Coast"]))
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
                    modifyAttribute(ReferenceMd.Region.Default, (a) => a.localId("someAttr")),
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
        [
            "measure value filters with dimensionality",
            newDefForItems(
                "test",
                [
                    modifyMeasure(ReferenceMd.Won, (m) => m.localId("someMeasure")),
                    modifyAttribute(ReferenceMd.Region.Default, (a) => a.localId("someAttr")),
                    modifyAttribute(ReferenceMd.Product.Name, (a) => a.localId("anotherAttr")),
                ],
                [
                    newMeasureValueFilterWithOptions(
                        { localIdentifier: "someMeasure" },
                        {
                            operator: "GREATER_THAN",
                            value: 100,
                            dimensionality: [
                                { localIdentifier: "someAttr" },
                                { localIdentifier: "anotherAttr" },
                            ],
                        },
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

    it.each(Scenarios)("should normalize %s with keeping removable properties", (_desc, definition) => {
        const withDims = defWithDimensions(definition, defaultDimensionsGenerator);
        const result = Normalizer.normalize(withDims, { keepRemovableProperties: true });

        expect(result.normalized).toMatchSnapshot();
    });

    it("should strip away empty negative attr filter (noop)", () => {
        const def = newDefForItems(
            "test",
            [ReferenceMd.Region.Default, ReferenceMd.Won],
            [newNegativeAttributeFilter(ReferenceMd.Region.Default, [])],
        );

        const result = Normalizer.normalize(def);

        expect(result.normalized.filters).toEqual([]);
    });

    it("should strip away empty negative attr filter (noop) from simple measure", () => {
        const def = newDefForItems("test", [
            modifySimpleMeasure(ReferenceMd.Won, (m) =>
                m.filters(newNegativeAttributeFilter(ReferenceMd.Region.Default, [])),
            ),
        ]);

        const result = Normalizer.normalize(def);

        expect(measureFilters(result.normalized.measures[0])).toEqual([]);
    });

    it("should strip away empty measure value filter (noop)", () => {
        const def = newDefForItems(
            "test",
            [ReferenceMd.Region.Default, ReferenceMd.Won],
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

    it("should also normalize col & row totals in buckets", () => {
        const localIdChangedMeasure = modifyMeasure(ReferenceMd.Won, (m) => m.localId("mwon"));
        const localIdChangedProduct = modifyAttribute(ReferenceMd.Product.Name, (a) => a.localId("aproduct"));
        const localIdChangedSalesRep = modifyAttribute(ReferenceMd.SalesRep.OwnerName, (a) =>
            a.localId("asalesrep"),
        );
        const buckets = [
            newBucket("bucket", localIdChangedMeasure, ReferenceMd.Amount),
            newBucket(
                "attribute",
                ReferenceMd.Region.Default,
                localIdChangedProduct,
                newTotal("sum", localIdChangedMeasure, localIdChangedProduct),
                newTotal("max", localIdChangedMeasure, localIdChangedProduct),
            ),
            newBucket(
                "columns",
                ReferenceMd.Account.Name,
                localIdChangedSalesRep,
                newTotal("sum", localIdChangedMeasure, localIdChangedSalesRep),
                newTotal("avg", localIdChangedMeasure, localIdChangedSalesRep),
            ),
        ];

        const def = newDefForBuckets("test", buckets);

        const result = Normalizer.normalize(def);
        expect(result.normalized.buckets).toMatchSnapshot();
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

describe.skip("Denormalizer", () => {
    // TODO this is skip due to hardcoded values in the test
    const measureDescriptorsWon: IMeasureDescriptor[] = [
        {
            measureHeaderItem: {
                localIdentifier: "m_acugFHNJgsBy",
                name: "Won",
                format: "$#,##0.00", // emulating 'Format: Inherit' for master measure
            },
        },
        {
            measureHeaderItem: {
                localIdentifier: "m_m_acugFHNJgsBy_closed.year",
                name: "WonPopClosedYear",
                format: "#,#.##", // emulating default format for derived measure
            },
        },
        {
            measureHeaderItem: {
                localIdentifier: "m_m_acugFHNJgsBy_previous_period",
                name: "WonPreviousPeriod",
                format: "#,#.##", // emulating default format for derived measure
            },
        },
    ];
    const measureDescriptorsWonAmount: IMeasureDescriptor[] = [
        measureDescriptorsWon[2],
        {
            measureHeaderItem: {
                localIdentifier: "m_m_aangOxLSeztu_previous_period",
                name: "AmountPreviousPeriod",
                format: "#,#.##", // emulating default format for derived measure
            },
        },
        {
            measureHeaderItem: {
                localIdentifier: "m_aangOxLSeztu",
                name: "Amount",
                format: "#,##0", // emulating 'Format: Inherit' for master measure
            },
        },
        measureDescriptorsWon[1],
        measureDescriptorsWon[0],
        {
            measureHeaderItem: {
                localIdentifier: "m_m_aangOxLSeztu_closed.year",
                name: "AmountPopClosedYear",
                format: "#,#.##", // emulating default format for derived measure
            },
        },
    ];
    const toNormalizedDims = (measureDescriptors: IMeasureDescriptor[]) => [
        {
            headers: [
                {
                    measureGroupHeader: {
                        items: measureDescriptors,
                    },
                },
            ],
        },
    ];

    it("should assign 'Format: Inherit' of master measure from normalized dimensions to master and derived measures after denormalization", () => {
        const executionDefinition = newDefForItems("test", [
            ReferenceMd.Won,
            ReferenceMdExt.WonPopClosedYear,
            ReferenceMdExt.WonPreviousPeriod,
        ]);
        const denormalizer = Denormalizer.from(Normalizer.normalize(executionDefinition));
        const dimensionDescriptors = denormalizer.denormalizeDimDescriptors(
            toNormalizedDims(measureDescriptorsWon),
        );
        const measureGroupDescriptor = dimensionDescriptors[0].headers[0] as IMeasureGroupDescriptor;
        const measureDescriptors = measureGroupDescriptor.measureGroupHeader.items;

        expect(measureDescriptors[0].measureHeaderItem.format).toEqual("$#,##0.00");
        expect(measureDescriptors[1].measureHeaderItem.format).toEqual("$#,##0.00");
        expect(measureDescriptors[2].measureHeaderItem.format).toEqual("$#,##0.00");
    });

    it("should assign the chosen format of master measure from normalized dimensions to master and derived measures after denormalization", () => {
        const formattedMeasure = newMeasure(idRef("acugFHNJgsBy", "measure"));
        const CHOSEN_FORMAT = "<#.#!>";
        formattedMeasure.measure.format = CHOSEN_FORMAT;
        const executionDefinition = newDefForItems("test", [
            formattedMeasure,
            ReferenceMdExt.WonPopClosedYear,
            ReferenceMdExt.WonPreviousPeriod,
        ]);
        const denormalizer = Denormalizer.from(Normalizer.normalize(executionDefinition));
        const dimensionDescriptors = denormalizer.denormalizeDimDescriptors(
            toNormalizedDims(measureDescriptorsWon),
        );
        const measureGroupDescriptor = dimensionDescriptors[0].headers[0] as IMeasureGroupDescriptor;
        const measureDescriptors = measureGroupDescriptor.measureGroupHeader.items;

        expect(measureDescriptors[0].measureHeaderItem.format).toEqual(CHOSEN_FORMAT);
        expect(measureDescriptors[1].measureHeaderItem.format).toEqual(CHOSEN_FORMAT);
        expect(measureDescriptors[2].measureHeaderItem.format).toEqual(CHOSEN_FORMAT);
    });

    it("should correctly find derived measures for appropriate master in shuffled array", () => {
        const executionDefinition = newDefForItems("test", [
            ReferenceMd.Won,
            ReferenceMdExt.WonPopClosedYear,
            ReferenceMdExt.WonPreviousPeriod,
            ReferenceMd.Amount,
            newPopMeasure(ReferenceMd.Amount, ReferenceMd.DateDatasets.Closed.ClosedYear.ref, (m) =>
                m.alias("Amount Last Year"),
            ),
            newPreviousPeriodMeasure(ReferenceMd.Amount, [
                { dataSet: ReferenceMd.DateDatasets.Closed.identifier, periodsAgo: 1 },
            ]),
        ]);
        const denormalizer = Denormalizer.from(Normalizer.normalize(executionDefinition));
        const dimensionDescriptors = denormalizer.denormalizeDimDescriptors(
            toNormalizedDims(measureDescriptorsWonAmount),
        );
        const measureGroupDescriptor = dimensionDescriptors[0].headers[0] as IMeasureGroupDescriptor;
        const measureDescriptors = measureGroupDescriptor.measureGroupHeader.items;

        expect(measureDescriptors[0].measureHeaderItem.format).toEqual("$#,##0.00");
        expect(measureDescriptors[1].measureHeaderItem.format).toEqual("#,##0");
        expect(measureDescriptors[2].measureHeaderItem.format).toEqual("#,##0");
        expect(measureDescriptors[3].measureHeaderItem.format).toEqual("$#,##0.00");
        expect(measureDescriptors[4].measureHeaderItem.format).toEqual("$#,##0.00");
        expect(measureDescriptors[5].measureHeaderItem.format).toEqual("#,##0");
    });
});
