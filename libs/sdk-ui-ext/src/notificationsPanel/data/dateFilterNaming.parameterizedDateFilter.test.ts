// (C) 2026 GoodData Corporation

import { createIntl } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { newParameterizedDateFilter } from "@gooddata/sdk-model";

import { translateDateFilter } from "./dateFilterNaming.js";

describe("translateDateFilter", () => {
    it("returns no title with a warning for a parameterized date filter", () => {
        const intl = createIntl({ locale: "en-US", messages: {} });
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const filter = newParameterizedDateFilter("closed", "period");

        expect(translateDateFilter(intl, filter, "MM/dd/yyyy")).toBeUndefined();
        expect(warn).toHaveBeenCalledWith(
            "Notification titles do not support parameterized date filters yet.",
            filter,
        );
        warn.mockRestore();
    });
});
