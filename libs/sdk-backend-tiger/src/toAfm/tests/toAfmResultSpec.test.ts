// (C) 2020 GoodData Corporation
import { toAfmExecution } from "../toAfmResultSpec";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { defWithAlias, defWithoutFilters } from "./InvalidInputs.fixture";
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
} from "@gooddata/sdk-model";

const workspace = "test workspace";

describe("converts execution definition to AFM Execution", () => {
    const Scenarios: Array<[string, any]> = [
        ["empty definition", emptyDef(workspace)],
        ["definition that has one attribute with alias and one attribute without localId", defWithAlias],
        ["definition that has no filter", defWithoutFilters],
        [
            "definition that has filters",
            newDefForItems(
                workspace,
                [ReferenceLdm.Account.Name, ReferenceLdm.Activity.Subject, ReferenceLdm.Won],
                [newPositiveAttributeFilter(ReferenceLdm.Account.Name, ["myAccount"])],
            ),
        ],
        ["sorts", defSetSorts(emptyDef(workspace), [newAttributeSort(ReferenceLdm.Account.Name, "asc")])],
        ["dimensions", defSetDimensions(emptyDef(workspace), [newDimension(["localId1"])])],
    ];

    it.each(Scenarios)("should return AFM Execution with %s", (_desc, input) => {
        expect(toAfmExecution(input)).toMatchSnapshot();
    });

    it("throw when dimension has non-native totals", () => {
        const Total = newTotal("sum", ReferenceLdm.Won, ReferenceLdm.Account.Name);
        const Dimensions = newTwoDimensional(["localId1"], [MeasureGroupIdentifier, Total]);

        expect(() =>
            toAfmExecution(defSetDimensions(emptyDef(workspace), Dimensions)),
        ).toThrowErrorMatchingSnapshot();
    });
    it("throw error with dimensions with native totals but no attribute in bucket", () => {
        const Total = newTotal("nat", ReferenceLdm.Won, ReferenceLdm.Account.Name);
        const Dimensions = newTwoDimensional(["localId1"], [MeasureGroupIdentifier, Total]);

        expect(() =>
            toAfmExecution(defSetDimensions(emptyDef(workspace), Dimensions)),
        ).toThrowErrorMatchingSnapshot();
    });
});
