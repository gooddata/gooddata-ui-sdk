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

const { dispatch } = vi.hoisted(() => {
    return { dispatch: vi.fn<(action: unknown) => void>() };
});

vi.mock("../DashboardStoreProvider.js", () => ({
    useDashboardDispatch: () => dispatch,
    useDashboardSelector: () => [],
}));

vi.mock("../useDashboardUserInteraction.js", () => ({
    useDashboardUserInteraction: () => ({ automationInteraction: vi.fn<(event: unknown) => void>() }),
}));

const { useDashboardAlertsCommands } = await import("./useDashboardAlertsCommands.js");

const alert = (filters: FilterContextItem[]): IAutomationMetadataObject => ({
    type: "automation",
    id: "alert",
    ref: idRef("alert", "automation"),
    uri: "alert",
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
                type: "visualizationObject",
                fileName: "export",
                format: "XLSX",
                content: { visualizationObject: "visualization", filters },
            },
        },
    ],
});

describe("useDashboardAlertsCommands", () => {
    it("does not open the edit dialog for an alert whose export has a parameterized date filter", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const { result } = renderHook(() => useDashboardAlertsCommands());

        result.current.openAlertDialog(
            undefined,
            alert([newDashboardParameterizedDateFilter(idRef("period", "parameter"))]),
        );

        expect(dispatch).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining("Cannot edit automation alert."));
    });

    it("opens the edit dialog for an alert with other filters", () => {
        const alertToEdit = alert([newAllTimeDashboardDateFilter()]);
        const { result } = renderHook(() => useDashboardAlertsCommands());

        result.current.openAlertDialog(undefined, alertToEdit);

        expect(dispatch).toHaveBeenCalledWith(uiActions.openAlertingDialog({ alert: alertToEdit }));
    });
});
