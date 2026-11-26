// (C) 2026 GoodData Corporation

import { createIntl } from "react-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { idRef, newAbsoluteGranularityDateFilter } from "@gooddata/sdk-model";

import { translateDateFilter } from "./dateFilterNaming.js";

describe("translateDateFilter", () => {
    const intl = createIntl({ locale: "en-US", messages: {} });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should return undefined with a warning for the absolute date filter with granularity", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const filter = newAbsoluteGranularityDateFilter(
            idRef("date", "dataSet"),
            "GDC.time.month",
            "2026-01",
            "2026-03",
        );

        expect(translateDateFilter(intl, filter, "MM/dd/yyyy")).toBeUndefined();
        expect(warn).toHaveBeenCalledWith(
            "Notification titles do not support absolute date filters with granularity yet.",
            filter,
        );
    });

    it("should return undefined with a warning for a date filter of an unknown type", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const unknownFilter = { futureDateFilter: { dataSet: idRef("date", "dataSet") } };

        expect(translateDateFilter(intl, unknownFilter as never, "MM/dd/yyyy")).toBeUndefined();
        expect(warn).toHaveBeenCalledWith("Cannot name a date filter of an unknown type.", unknownFilter);
    });
});
