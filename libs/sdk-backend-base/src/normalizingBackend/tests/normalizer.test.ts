// (C) 2007-2020 GoodData Corporation

import {
    defWithDimensions,
    newDefForItems,
    defaultDimensionsGenerator,
    IExecutionDefinition,
    newMeasureValueFilter,
    newNegativeAttributeFilter,
    IMeasure,
    IMeasureValueFilter,
    measureLocalId,
    newDefForBuckets,
    newBucket,
    modifyAttribute,
    modifyMeasure,
} from "@gooddata/sdk-model";
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
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
                ReferenceLdm.Region,
                ReferenceLdm.Product.Name,
                ReferenceLdm.Won,
                ReferenceLdmExt.MaxAmount,
                ReferenceLdmExt.AmountWithRatio,
            ]),
        ],
        [
            "duplicate attributes and measures",
            newDefForItems("test", [
                ReferenceLdm.Region,
                modifyAttribute(ReferenceLdm.Region, m => m.localId("duplicateAttr")),
                ReferenceLdm.Won,
                modifyMeasure(ReferenceLdm.Won, m => m.localId("duplicateMeasure")),
            ]),
        ],
        [
            "derived measures",
            newDefForItems("test", [
                ReferenceLdm.Won,
                ReferenceLdmExt.WonPopClosedYear,
                ReferenceLdmExt.WonPreviousPeriod,
            ]),
        ],
        [
            "arithmetic measures",
            newDefForItems("test", [
                ReferenceLdm.Won,
                ReferenceLdm.Amount,
                ReferenceLdmExt.CalculatedLost,
                ReferenceLdmExt.CalculatedWonLostRatio,
            ]),
        ],
        [
            "measure value filters",
            newDefForItems(
                "test",
                [
                    ReferenceLdm.Won,
                    ReferenceLdm.Amount,
                    ReferenceLdmExt.CalculatedLost,
                    ReferenceLdmExt.CalculatedWonLostRatio,
                ],
                [newMeasureValueFilter(ReferenceLdmExt.CalculatedWonLostRatio, "EQUAL_TO", 1)],
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
            [ReferenceLdm.Region, ReferenceLdm.Won],
            [newNegativeAttributeFilter(ReferenceLdm.Region, [])],
        );

        const result = Normalizer.normalize(def);

        expect(result.normalized.filters).toEqual([]);
    });

    it("should strip away empty measure value filter (noop)", () => {
        const def = newDefForItems(
            "test",
            [ReferenceLdm.Region, ReferenceLdm.Won],
            [EmptyMvf(ReferenceLdm.Won)],
        );

        const result = Normalizer.normalize(def);

        expect(result.normalized.filters).toEqual([]);
    });

    it("should throw if dangling references", () => {
        const def = newDefForItems("test", [ReferenceLdmExt.CalculatedLost]);

        expect(() => Normalizer.normalize(def)).toThrow();
    });

    it("should touch buckets", () => {
        const buckets = [newBucket("bucket", ReferenceLdm.Won)];
        const def = newDefForBuckets("test", buckets);

        const result = Normalizer.normalize(def);
        expect(result.normalized.buckets).toEqual(buckets);
    });
});
