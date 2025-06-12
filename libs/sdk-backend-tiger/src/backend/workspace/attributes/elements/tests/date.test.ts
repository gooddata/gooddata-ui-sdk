// (C) 2021 GoodData Corporation

import { newRelativeDateFilter, IRelativeDateFilter, DateAttributeGranularity } from "@gooddata/sdk-model";
import { describe, expect, it } from "vitest";
import { getRelativeDateFilterShiftedValues } from "../date.js";

const generateRelativeDateFilter = (granularity: DateAttributeGranularity) =>
    newRelativeDateFilter("gdc/uri/rf", granularity, -3, 0);

describe("getRelativeDateFilterShiftedValues", () => {
    it.each([
        ["day", generateRelativeDateFilter("GDC.time.date")],
        ["month", generateRelativeDateFilter("GDC.time.month")],
        ["quarter", generateRelativeDateFilter("GDC.time.quarter")],
        ["year", generateRelativeDateFilter("GDC.time.year")],
    ])(
        "should return correct from to date values for %s granularity",
        (_granularity: string, relativeDateFilter: IRelativeDateFilter) => {
            const now = new Date(2021, 7, 26);
            const result = getRelativeDateFilterShiftedValues(now, relativeDateFilter);
            expect(result).toMatchSnapshot();
        },
    );
});
