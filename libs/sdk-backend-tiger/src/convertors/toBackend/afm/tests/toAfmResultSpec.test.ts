// (C) 2020-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    defSetDimensions,
    defSetExecConfig,
    defSetSorts,
    defWithFilters,
    emptyDef,
    idRef,
    newAttributeSort,
    newDefForItems,
    newDimension,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";

import { toAfmExecution } from "../toAfmResultSpec.js";
import { defWithAlias, defWithoutFilters } from "./InvalidInputs.fixture.js";

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

    it("should include parameter values as ParameterItem[] when set on executionConfig", () => {
        const def = defSetExecConfig(emptyDef(workspace), {
            parameterValues: [
                { ref: idRef("threshold", "parameter"), value: 42 },
                { ref: idRef("markup", "parameter"), value: 0.15 },
            ],
        });

        const result = toAfmExecution(def);

        expect(result.execution.parameters).toEqual([
            { parameter: { identifier: { id: "threshold", type: "parameter" } }, value: "42" },
            { parameter: { identifier: { id: "markup", type: "parameter" } }, value: "0.15" },
        ]);
    });

    it("should omit parameters when no parameter values are set", () => {
        const def = emptyDef(workspace);
        const result = toAfmExecution(def);

        expect(result.execution.parameters).toBeUndefined();
    });

    it("should serialize small decimal parameter values (scientific notation is accepted by the backend)", () => {
        const def = defSetExecConfig(emptyDef(workspace), {
            parameterValues: [{ ref: idRef("tiny", "parameter"), value: 1e-7 }],
        });

        const result = toAfmExecution(def);

        expect(result.execution.parameters?.[0]?.value).toBe("1e-7");
    });

    it.each([
        ["Infinity", Number.POSITIVE_INFINITY],
        ["-Infinity", Number.NEGATIVE_INFINITY],
        ["NaN", Number.NaN],
    ])("should throw for non-finite parameter value %s", (_desc, value) => {
        const def = defSetExecConfig(emptyDef(workspace), {
            parameterValues: [{ ref: idRef("bad", "parameter"), value }],
        });

        expect(() => toAfmExecution(def)).toThrow();
    });

    it("should remove empty negative attribute filters and not cause RAIL-2083", () => {
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
