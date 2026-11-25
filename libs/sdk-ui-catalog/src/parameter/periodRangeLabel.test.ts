// (C) 2026 GoodData Corporation

import { createIntl } from "react-intl";
import { describe, expect, it } from "vitest";

import type { IDateRangeParameterPeriod } from "@gooddata/sdk-model";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../localization/translations.js";

import { formatPeriodRange } from "./periodRangeLabel.js";

const intl = createIntl({ locale: DEFAULT_LANGUAGE, messages: DEFAULT_MESSAGES[DEFAULT_LANGUAGE] });

describe("formatPeriodRange", () => {
    it.each<[string, IDateRangeParameterPeriod, string]>([
        ["months", { granularity: "GDC.time.month", from: "2025-08", to: "2026-08" }, "Aug 2025 – Aug 2026"],
        ["quarters", { granularity: "GDC.time.quarter", from: "2025-3", to: "2026-1" }, "Q3 2025 – Q1 2026"],
        ["weeks", { granularity: "GDC.time.week", from: "2025-05", to: "2025-33" }, "W05 2025 – W33 2025"],
        ["years", { granularity: "GDC.time.year", from: "2024", to: "2025" }, "2024 – 2025"],
        [
            "days",
            { granularity: "GDC.time.date", from: "2025-08-01", to: "2025-08-14" },
            "2025-08-01 – 2025-08-14",
        ],
        [
            "hours",
            { granularity: "GDC.time.hour", from: "2025-08-14 09", to: "2025-08-14 17" },
            "2025-08-14 09 – 2025-08-14 17",
        ],
    ])("names a range of %s", (_name, period, expected) => {
        expect(formatPeriodRange(intl, period)).toBe(expected);
    });

    it("names a period with no end by its start", () => {
        expect(formatPeriodRange(intl, { granularity: "GDC.time.month", from: "2025-08" })).toBe(
            "From Aug 2025",
        );
    });

    it("names a period with no start by its end", () => {
        expect(formatPeriodRange(intl, { granularity: "GDC.time.quarter", to: "2026-2" })).toBe(
            "Until Q2 2026",
        );
    });

    it("gives no name to a period with neither end", () => {
        expect(formatPeriodRange(intl, { granularity: "GDC.time.month" })).toBeUndefined();
    });

    it("shows an end that does not match the granularity as written", () => {
        expect(
            formatPeriodRange(intl, { granularity: "GDC.time.month", from: "2025-8", to: "2026-08" }),
        ).toBe("2025-8 – Aug 2026");
    });
});
