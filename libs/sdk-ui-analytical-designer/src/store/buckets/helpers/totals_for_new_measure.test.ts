// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type ITotal, type TotalType } from "@gooddata/sdk-model";

import { getTotalsForMeasureEnabledOnAllOtherMeasures } from "./totals_for_new_measure.js";

const total = (measureIdentifier: string, attributeIdentifier: string, type: TotalType = "sum"): ITotal => ({
    measureIdentifier,
    attributeIdentifier,
    type,
});

describe("getTotalsForMeasureEnabledOnAllOtherMeasures", () => {
    it("inherits a total that every other measure already has", () => {
        const totals = [total("m1", "a1"), total("m2", "a1")];

        expect(getTotalsForMeasureEnabledOnAllOtherMeasures("m3", totals, ["m1", "m2"])).toEqual([
            total("m3", "a1"),
        ]);
    });

    it("does not inherit a total that only some of the other measures have", () => {
        const totals = [total("m1", "a1")];

        expect(getTotalsForMeasureEnabledOnAllOtherMeasures("m3", totals, ["m1", "m2"])).toEqual([]);
    });

    it("inherits each distinct (attribute, function) pair exactly once", () => {
        const totals = [
            total("m1", "a1", "sum"),
            total("m2", "a1", "sum"),
            total("m1", "a1", "max"),
            total("m2", "a1", "max"),
            total("m1", "a2", "sum"),
            total("m2", "a2", "sum"),
        ];

        expect(getTotalsForMeasureEnabledOnAllOtherMeasures("m3", totals, ["m1", "m2"])).toEqual([
            total("m3", "a1", "sum"),
            total("m3", "a1", "max"),
            total("m3", "a2", "sum"),
        ]);
    });

    it("inherits nothing when the new measure is the only measure", () => {
        expect(getTotalsForMeasureEnabledOnAllOtherMeasures("m1", [total("m1", "a1")], [])).toEqual([]);
    });

    it("inherits nothing when the bucket has no totals", () => {
        expect(getTotalsForMeasureEnabledOnAllOtherMeasures("m3", [], ["m1", "m2"])).toEqual([]);
    });

    it("ignores totals belonging to measures outside the compared set", () => {
        // an extra total for a measure that is not in previousMeasureLocalIdentifiers must neither
        // block the inheritance nor be counted towards it
        const totals = [total("m1", "a1"), total("m2", "a1"), total("stale", "a1")];

        expect(getTotalsForMeasureEnabledOnAllOtherMeasures("m3", totals, ["m1", "m2"])).toEqual([
            total("m3", "a1"),
        ]);
    });

    it("does not mutate the totals list it was given", () => {
        const totals = [total("m1", "a1"), total("m2", "a1")];

        getTotalsForMeasureEnabledOnAllOtherMeasures("m3", totals, ["m1", "m2"]);

        expect(totals).toEqual([total("m1", "a1"), total("m2", "a1")]);
    });
});
