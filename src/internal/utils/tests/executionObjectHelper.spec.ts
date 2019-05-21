// (C) 2019 GoodData Corporation
import { AFM } from "@gooddata/typings";
import { expandTotalsInAfm, expandTotalsInResultSpec } from "../executionObjectHelper";
import { executionObjectMock } from "../../mocks/executionObjectMocks";

describe("optimizeExecutionObject", () => {
    it("should expand table totals in afm", () => {
        const optimizedAfm = expandTotalsInAfm(executionObjectMock.withTotals.execution.afm);

        const expectedNativeTotals: AFM.INativeTotalItem[] = [
            {
                measureIdentifier: "m1",
                attributeIdentifiers: [],
            },
            {
                measureIdentifier: "m2",
                attributeIdentifiers: [],
            },
        ];

        expect(optimizedAfm.nativeTotals).toEqual(expectedNativeTotals);
    });

    it("should expand table totals in resultSpec", () => {
        const afm = executionObjectMock.withTotals.execution.afm;
        const resultSpec = executionObjectMock.withTotals.execution.resultSpec;

        const expandedTotalsInResultSpec = expandTotalsInResultSpec(afm, resultSpec);

        const expectedTotals: AFM.ITotalItem[] = [
            {
                measureIdentifier: "m1",
                type: "sum",
                attributeIdentifier: "a1",
            },
            {
                measureIdentifier: "m2",
                type: "sum",
                attributeIdentifier: "a1",
            },
            {
                measureIdentifier: "m1",
                type: "avg",
                attributeIdentifier: "a1",
            },
            {
                measureIdentifier: "m2",
                type: "avg",
                attributeIdentifier: "a1",
            },
            {
                measureIdentifier: "m1",
                type: "nat",
                attributeIdentifier: "a1",
            },
            {
                measureIdentifier: "m2",
                type: "nat",
                attributeIdentifier: "a1",
            },
        ];

        expect(expandedTotalsInResultSpec.dimensions[0].totals).toEqual(expectedTotals);
    });
});
