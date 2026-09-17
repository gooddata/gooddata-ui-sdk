// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type ITotal } from "@gooddata/sdk-model";

import {
    areTotalsSameDefinition,
    getResultTotalType,
    getTotalAlias,
    updateTotalAlias,
    withInheritedAlias,
} from "./totals.js";

const total: ITotal = {
    type: "sum",
    measureIdentifier: "measure",
    attributeIdentifier: "attribute",
};

describe("areTotalsSameDefinition", () => {
    it("ignores the display alias", () => {
        expect(areTotalsSameDefinition(total, { ...total, alias: "Custom total" })).toBe(true);
    });

    it("distinguishes totals by calculation identity", () => {
        expect(
            areTotalsSameDefinition(total, {
                ...total,
                measureIdentifier: "another-measure",
            }),
        ).toBe(false);
    });
});

describe("getResultTotalType", () => {
    it("normalizes backend total codes", () => {
        expect(getResultTotalType("MED")).toBe("med");
    });

    it("rejects unknown total codes", () => {
        expect(getResultTotalType("unknown")).toBeUndefined();
    });
});

describe("total aliases", () => {
    const totals: ITotal[] = [
        total,
        { ...total, measureIdentifier: "another-measure", alias: "Custom total" },
    ];

    it("gets the custom label for a total type and attribute", () => {
        expect(getTotalAlias(totals, "sum", "attribute")).toBe("Custom total");
    });

    it("updates every matching total and trims the label", () => {
        expect(updateTotalAlias(totals, "sum", "attribute", "  Grand total  ")).toEqual(
            totals.map((item) => ({ ...item, alias: "Grand total" })),
        );
    });

    it("removes aliases when resetting the label", () => {
        expect(updateTotalAlias(totals, "sum", "attribute", undefined)).toEqual([
            total,
            { ...total, measureIdentifier: "another-measure" },
        ]);
    });

    it("does not update totals when none match", () => {
        expect(updateTotalAlias(totals, "max", "attribute", "Maximum")).toBeUndefined();
    });

    it("returns undefined when resetting a total that already has no alias (no-op)", () => {
        expect(updateTotalAlias(totals, "sum", "attribute", undefined, "measure")).toBeUndefined();
    });

    it("returns undefined when re-saving the exact same label, even with extra whitespace (no-op)", () => {
        expect(
            updateTotalAlias(totals, "sum", "attribute", "  Custom total  ", "another-measure"),
        ).toBeUndefined();
    });

    it("scopes the lookup to one measure's total when measureIdentifier is given", () => {
        expect(getTotalAlias(totals, "sum", "attribute", "another-measure")).toBe("Custom total");
    });

    it("does not fall back to another measure's alias when scoped to a measure with none", () => {
        expect(getTotalAlias(totals, "sum", "attribute", "measure")).toBeUndefined();
    });

    it("scopes the update to one measure's total, leaving the other measure's total untouched", () => {
        expect(updateTotalAlias(totals, "sum", "attribute", "Renamed", "another-measure")).toEqual([
            total,
            { ...total, measureIdentifier: "another-measure", alias: "Renamed" },
        ]);
    });
});

describe("withInheritedAlias", () => {
    it("propagates the existing alias to new definitions of the same type and attribute when not scoped to a measure", () => {
        const currentTotals: ITotal[] = [{ ...total, alias: "Grand total" }];
        const definitions: ITotal[] = [{ ...total, measureIdentifier: "another-measure" }];

        expect(withInheritedAlias(currentTotals, definitions, false)).toEqual([
            { ...total, measureIdentifier: "another-measure", alias: "Grand total" },
        ]);
    });

    it("does not propagate another measure's alias when scoped to a measure", () => {
        const currentTotals: ITotal[] = [{ ...total, alias: "Grand total" }];
        const definitions: ITotal[] = [{ ...total, measureIdentifier: "another-measure" }];

        expect(withInheritedAlias(currentTotals, definitions, true)).toBe(definitions);
    });

    it("propagates the alias when scoped to a measure that already has one", () => {
        const currentTotals: ITotal[] = [{ ...total, alias: "Grand total" }];
        const definitions: ITotal[] = [{ ...total }];

        expect(withInheritedAlias(currentTotals, definitions, true)).toEqual([
            { ...total, alias: "Grand total" },
        ]);
    });

    it("leaves definitions unchanged when there is no existing alias to inherit", () => {
        const definitions: ITotal[] = [{ ...total, measureIdentifier: "another-measure" }];

        expect(withInheritedAlias([total], definitions, false)).toBe(definitions);
    });

    it("leaves an empty definitions list unchanged", () => {
        expect(withInheritedAlias([{ ...total, alias: "Grand total" }], [], false)).toEqual([]);
    });

    it("resolves each measure's own alias independently when scoped, instead of broadcasting the first definition's alias to every measure", () => {
        // A single call's definitions can span several measures under the same attribute (see
        // constructAggregationsMenuItems) - this is the exact cross-measure leak scopeToMeasure
        // exists to prevent.
        const currentTotals: ITotal[] = [
            { ...total, measureIdentifier: "measure-1", alias: "First total" },
            { ...total, measureIdentifier: "measure-2" },
            { ...total, measureIdentifier: "measure-3", alias: "Third total" },
        ];
        const definitions: ITotal[] = [
            { ...total, measureIdentifier: "measure-1" },
            { ...total, measureIdentifier: "measure-2" },
            { ...total, measureIdentifier: "measure-3" },
        ];

        expect(withInheritedAlias(currentTotals, definitions, true)).toEqual([
            { ...total, measureIdentifier: "measure-1", alias: "First total" },
            { ...total, measureIdentifier: "measure-2" },
            { ...total, measureIdentifier: "measure-3", alias: "Third total" },
        ]);
    });
});
