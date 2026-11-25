// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IDateRangeParameterMetadataObject, idRef } from "@gooddata/sdk-model";

import { findPeriod, getPeriodTitle } from "./period.js";

const lastHoldingMonth: IDateRangeParameterMetadataObject = {
    type: "parameter",
    id: "lastHoldingMonth",
    uri: "/lastHoldingMonth",
    ref: idRef("lastHoldingMonth", "parameter"),
    title: "Last holding month",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
    definition: {
        type: "DATE_RANGE",
        defaultValue: { granularity: "GDC.time.month", from: "2025-08" },
    },
};
const untitledPeriod: IDateRangeParameterMetadataObject = {
    ...lastHoldingMonth,
    id: "untitledPeriod",
    uri: "/untitledPeriod",
    ref: idRef("untitledPeriod", "parameter"),
    title: "",
};
const periods = [lastHoldingMonth, untitledPeriod];
// a scalar parameter is never among the catalog's periods
const topNRef = idRef("topN", "parameter");

describe("findPeriod", () => {
    it("finds a period by a typed and by an untyped ref", () => {
        expect(findPeriod(idRef("lastHoldingMonth", "parameter"), periods)).toBe(lastHoldingMonth);
        expect(findPeriod(idRef("lastHoldingMonth"), periods)).toBe(lastHoldingMonth);
    });

    it("finds nothing for a deleted period, a scalar parameter or a catalog without periods", () => {
        expect(findPeriod(idRef("deleted", "parameter"), periods)).toBeUndefined();
        expect(findPeriod(topNRef, periods)).toBeUndefined();
        expect(findPeriod(lastHoldingMonth.ref, undefined)).toBeUndefined();
    });
});

describe("getPeriodTitle", () => {
    it("returns the title, falling back to the id and then to the ref's identifier", () => {
        expect(getPeriodTitle(lastHoldingMonth.ref, periods)).toBe("Last holding month");
        expect(getPeriodTitle(untitledPeriod.ref, periods)).toBe("untitledPeriod");
        expect(getPeriodTitle(idRef("deleted", "parameter"), periods)).toBe("deleted");
        expect(getPeriodTitle(topNRef, periods)).toBe("topN");
    });
});
