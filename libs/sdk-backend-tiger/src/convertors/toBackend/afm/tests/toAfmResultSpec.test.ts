// (C) 2020-2021 GoodData Corporation
import { toAfmExecution } from "../toAfmResultSpec";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { defWithAlias, defWithoutFilters } from "./InvalidInputs.fixture";
import {
    emptyDef,
    newDefForItems,
    newPositiveAttributeFilter,
    defSetSorts,
    newAttributeSort,
    defSetDimensions,
    newDimension,
    newNegativeAttributeFilter,
    defWithFilters,
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
                [ReferenceMd.Account.Name, ReferenceMd.Activity.Subject, ReferenceMd.Won],
                [newPositiveAttributeFilter(ReferenceMd.Account.Name, ["myAccount"])],
            ),
        ],
        ["sorts", defSetSorts(emptyDef(workspace), [newAttributeSort(ReferenceMd.Account.Name, "asc")])],
        ["dimensions", defSetDimensions(emptyDef(workspace), [newDimension(["localId1"])])],
    ];

    it.each(Scenarios)("should return AFM Execution with %s", (_desc, input) => {
        expect(toAfmExecution(input)).toMatchSnapshot();
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

        expect(result.execution.filters).toMatchSnapshot();
    });
});
