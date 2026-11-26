// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    idRef,
    newAllTimeDashboardDateFilter,
    newDashboardParameterizedDateFilter,
} from "@gooddata/sdk-model";

import { uiActions } from "../../store/ui/index.js";

// Another test file in the worker may have loaded the hook with the real store already.
const { dispatch } = vi.hoisted(() => {
    vi.resetModules();
    return { dispatch: vi.fn<(action: unknown) => void>() };
});

vi.mock("../DashboardStoreProvider.js", () => ({
    useDashboardDispatch: () => dispatch,
    useDashboardSelector: () => [],
}));

vi.mock("../useDashboardUserInteraction.js", () => ({
    useDashboardUserInteraction: () => ({ automationInteraction: vi.fn<(event: unknown) => void>() }),
}));

const { useDashboardScheduledEmailsCommands } = await import("./useDashboardScheduledEmailsCommands.js");

const schedule = (filters: FilterContextItem[]): IAutomationMetadataObject => ({
    type: "automation",
    id: "schedule",
    ref: idRef("schedule", "automation"),
    uri: "schedule",
    title: "",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
    exportDefinitions: [
        {
            type: "exportDefinition",
            id: "export",
            ref: idRef("export", "exportDefinition"),
            uri: "export",
            title: "",
            description: "",
            production: true,
            deprecated: false,
            unlisted: false,
            requestPayload: {
                type: "dashboard",
                fileName: "export",
                format: "PDF",
                content: { dashboard: "dashboard", filters },
            },
        },
    ],
});

describe("useDashboardScheduledEmailsCommands", () => {
    it.each<[string, FilterContextItem]>([
        ["a parameterized date filter", newDashboardParameterizedDateFilter(idRef("period", "parameter"))],
        [
            "an absolute date filter with granularity",
            { dashboardAbsoluteGranularityDateFilter: { granularity: "GDC.time.month", from: "2026-01" } },
        ],
    ])("does not open the edit dialog for a schedule with %s", (_desc, filter) => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const { result } = renderHook(() => useDashboardScheduledEmailsCommands());

        result.current.openScheduleEmailingDialog({ schedule: schedule([filter]) });

        expect(dispatch).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining("Cannot edit automation schedule."));
    });

    it("opens the edit dialog for a schedule with other filters", () => {
        const scheduleToEdit = schedule([newAllTimeDashboardDateFilter()]);
        const { result } = renderHook(() => useDashboardScheduledEmailsCommands());

        result.current.openScheduleEmailingDialog({ schedule: scheduleToEdit });

        expect(dispatch).toHaveBeenCalledWith(
            uiActions.openScheduleEmailDialog({ openedFrom: undefined, schedule: scheduleToEdit }),
        );
    });
});
