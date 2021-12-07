// (C) 2020 GoodData Corporation
import { toAfmExecution } from "../ExecutionConverter";
import { defWithAlias, defWithoutFilters } from "./InvalidInputs.fixture";
import { ReferenceMd } from "@gooddata/reference-workspace";

import {
    emptyDef,
    newDefForItems,
    newPositiveAttributeFilter,
    defSetSorts,
    newAttributeSort,
    defSetDimensions,
    newDimension,
    newTotal,
    newTwoDimensional,
    MeasureGroupIdentifier,
    newDefForBuckets,
    newBucket,
    attributeLocalId,
    defWithFilters,
    newNegativeAttributeFilter,
} from "@gooddata/sdk-model";

const workspace = "test workspace";
const total = newTotal("nat", ReferenceMd.Won, ReferenceMd.Account.Name, "native total");

describe("converts execution definition to AFM Execution", () => {
    const Scenarios: Array<[string, any]> = [
        ["empty definition", emptyDef(workspace)],
        ["definition that has one attribute with alias and one attribute without localId", defWithAlias],
        ["definition that has no filter", defWithoutFilters],
        [
            "definition with filters",
            newDefForItems(
                workspace,
                [ReferenceMd.Account.Name, ReferenceMd.Activity.Subject, ReferenceMd.Won],
                [newPositiveAttributeFilter(ReferenceMd.Account.Name, ["myAccount"])],
            ),
        ],
        ["sorts", defSetSorts(emptyDef(workspace), [newAttributeSort(ReferenceMd.Account.Name, "asc")])],
        ["dimensions", defSetDimensions(emptyDef(workspace), [newDimension(["localId1"])])],
        [
            "dimensions with native totals and attribute is in bucket",
            defSetDimensions(
                newDefForBuckets("test workspace", [
                    newBucket("mixedBucket1", ReferenceMd.Activity.Default, ReferenceMd.Won),
                    newBucket("measureBucket1", ReferenceMd.WinRate),
                    newBucket("attributeBucket1", ReferenceMd.Account.Name),
                ]),
                newTwoDimensional(
                    [attributeLocalId(ReferenceMd.Account.Name)],
                    [MeasureGroupIdentifier, total],
                ),
            ),
        ],
    ];
    it.each(Scenarios)("AFM Execution with %s", (_desc, input) => {
        expect(toAfmExecution(input)).toMatchSnapshot();
    });

    it("throw error with dimensions with native totals but no attribute in bucket", () => {
        expect(() =>
            toAfmExecution(
                defSetDimensions(
                    emptyDef(workspace),
                    newTwoDimensional(
                        ["localId1"],
                        [MeasureGroupIdentifier, newTotal("nat", ReferenceMd.Won, ReferenceMd.Account.Name)],
                    ),
                ),
            ),
        ).toThrowErrorMatchingSnapshot();
    });

    it("should remove empty attribute filters and not cause RAIL-2083", () => {
        const emptyPositiveFilter = newPositiveAttributeFilter(ReferenceMd.Product.Name, []);
        const emptyNegativeFilter = newNegativeAttributeFilter(ReferenceMd.Product.Name, []);
        const positiveFilter = newPositiveAttributeFilter(ReferenceMd.Product.Name, ["value 1"]);
        const negativeFilter = newNegativeAttributeFilter(ReferenceMd.Product.Name, ["value 2"]);

        const def = defWithFilters(emptyDef("test"), [
            emptyPositiveFilter,
            emptyNegativeFilter,
            positiveFilter,
            negativeFilter,
        ]);
        const result = toAfmExecution(def);

        expect(result.execution.afm.filters).toMatchSnapshot();
    });
});
