// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useScheduledExportActions } from "./ScheduledExportActionsContext.js";
import { useScheduledExportData } from "./ScheduledExportDataContext.js";
import { useScheduledExportDraft } from "./ScheduledExportDraftContext.js";
import { useScheduledExportFilters } from "./ScheduledExportFiltersContext.js";

// Explicitly typed: an inline it.each of mixed tuple members infers a union per position.
const ACCESSORS: [string, () => unknown][] = [
    ["useScheduledExportDraft", useScheduledExportDraft],
    ["useScheduledExportActions", useScheduledExportActions],
    ["useScheduledExportData", useScheduledExportData],
    ["useScheduledExportFilters", useScheduledExportFilters],
];

describe("scheduled-export state accessors — outside their provider", () => {
    it.each(ACCESSORS)("%s throws a descriptive error", (name, accessor) => {
        expect(() => renderHook(() => accessor())).toThrow(
            new RegExp(`${name} must be used within ScheduledEmailDialogStateProvider`),
        );
    });

    it("names the loading gate in the error, since that is the reachable cause", () => {
        expect(() => renderHook(() => useScheduledExportDraft())).toThrow(/isLoading/);
    });
});
