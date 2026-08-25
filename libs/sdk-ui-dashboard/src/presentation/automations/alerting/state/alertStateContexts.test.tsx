// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useAlertActions } from "./AlertActionsContext.js";
import { useAlertData } from "./AlertDataContext.js";
import { useAlertDraft } from "./AlertDraftContext.js";
import { useAlertFilters } from "./AlertFiltersContext.js";

// Explicitly typed: an inline it.each of mixed tuple members infers a union per position.
const ACCESSORS: [string, () => unknown][] = [
    ["useAlertDraft", useAlertDraft],
    ["useAlertActions", useAlertActions],
    ["useAlertData", useAlertData],
    ["useAlertFilters", useAlertFilters],
];

describe("alerting state accessors — outside their provider", () => {
    it.each(ACCESSORS)("%s throws a descriptive error", (name, accessor) => {
        expect(() => renderHook(() => accessor())).toThrow(
            new RegExp(`${name} must be used within AlertingDialogStateProvider`),
        );
    });

    it("names the loading gate in the error, since that is the reachable cause", () => {
        expect(() => renderHook(() => useAlertDraft())).toThrow(/isLoading/);
    });
});
