// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { idRef } from "@gooddata/sdk-model";
import { type DateFilterHelpers, type DateFilterOption } from "@gooddata/sdk-ui-filters";

import { dateFilterOptionToDashboardDateFilter } from "./dashboardFilterConverter.js";

const { mapOptionToAfm } = vi.hoisted(() => ({ mapOptionToAfm: vi.fn() }));

vi.mock("@gooddata/sdk-ui-filters", async (importOriginal) => {
    const original = await importOriginal<{ DateFilterHelpers: typeof DateFilterHelpers }>();
    return {
        ...original,
        DateFilterHelpers: { ...original.DateFilterHelpers, mapOptionToAfm },
    };
});

describe("dateFilterOptionToDashboardDateFilter", () => {
    const dataSet = idRef("date", "dataSet");
    const option = { localIdentifier: "option", type: "futureForm", visible: true } as unknown;

    it("should fall back to All time with a warning for a date filter of an unknown type", () => {
        const unknownFilter = { futureDateFilter: { dataSet } };
        mapOptionToAfm.mockReturnValue(unknownFilter);
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

        expect(
            dateFilterOptionToDashboardDateFilter(option as DateFilterOption, false, dataSet, "df"),
        ).toEqual({
            dateFilter: {
                type: "relative",
                granularity: "GDC.time.date",
                dataSet,
                localIdentifier: "df",
            },
        });
        expect(warn).toHaveBeenCalledWith(
            "A date filter of an unknown type is replaced by All time.",
            unknownFilter,
        );
        warn.mockRestore();
    });
});
