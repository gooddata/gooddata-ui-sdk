// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    dashboardParameter,
    workspaceNumberParameter,
    workspaceStringParameter,
} from "../../test/parameterFixtures.js";
import { validateExistingAutomationParameters } from "../useValidateExistingAutomationFilters.js";

const catalog = [
    workspaceNumberParameter("topN", "topN", 3),
    workspaceNumberParameter("limit", "limit", 50),
    workspaceStringParameter("scenario", "scenario", "Actual"),
];

describe("validateExistingAutomationParameters — stored export parameter staleness", () => {
    it("is not stale when there are no stored parameters", () => {
        expect(
            validateExistingAutomationParameters({
                storedParametersByTab: undefined,
                catalog,
                dashboardParametersByTab: {},
                existingTabIds: new Set(["tab1"]),
            }),
        ).toBe(false);
    });

    it("is not stale when stored active parameters match the current catalog and tabs", () => {
        expect(
            validateExistingAutomationParameters({
                storedParametersByTab: { tab1: [{ id: "topN", value: "8", title: "Top N" }] },
                catalog,
                dashboardParametersByTab: { tab1: [dashboardParameter("topN")] },
                existingTabIds: new Set(["tab1"]),
            }),
        ).toBe(false);
    });

    it("is stale when a stored parameter's tab no longer exists", () => {
        expect(
            validateExistingAutomationParameters({
                storedParametersByTab: { goneTab: [{ id: "topN", value: "8", title: "Top N" }] },
                catalog,
                dashboardParametersByTab: {},
                existingTabIds: new Set(["tab1"]),
            }),
        ).toBe(true);
    });

    it("is stale when a stored parameter's ref left the workspace catalog", () => {
        expect(
            validateExistingAutomationParameters({
                storedParametersByTab: { tab1: [{ id: "removed", value: "8", title: "Removed" }] },
                catalog,
                dashboardParametersByTab: { tab1: [] },
                existingTabIds: new Set(["tab1"]),
            }),
        ).toBe(true);
    });

    it("is stale when a stored row's parameterType tag disagrees with the current workspace type", () => {
        expect(
            validateExistingAutomationParameters({
                storedParametersByTab: {
                    tab1: [{ id: "topN", value: "8", title: "Top N", parameterType: "STRING" }],
                },
                catalog,
                dashboardParametersByTab: { tab1: [] },
                existingTabIds: new Set(["tab1"]),
            }),
        ).toBe(true);
    });

    it("is stale when an untagged stored row defaults to NUMBER but the workspace parameter is STRING", () => {
        expect(
            validateExistingAutomationParameters({
                storedParametersByTab: {
                    tab1: [{ id: "scenario", value: "Actual", title: "Scenario" }],
                },
                catalog,
                dashboardParametersByTab: { tab1: [] },
                existingTabIds: new Set(["tab1"]),
            }),
        ).toBe(true);
    });

    it("is not stale when a stored STRING row matches the current STRING workspace parameter", () => {
        expect(
            validateExistingAutomationParameters({
                storedParametersByTab: {
                    tab1: [{ id: "scenario", value: "Actual", title: "Scenario", parameterType: "STRING" }],
                },
                catalog,
                dashboardParametersByTab: { tab1: [] },
                existingTabIds: new Set(["tab1"]),
            }),
        ).toBe(false);
    });

    it("is stale when a readonly parameter's pinned value drifted from the dashboard", () => {
        expect(
            validateExistingAutomationParameters({
                storedParametersByTab: { tab1: [{ id: "topN", value: "8", title: "Top N" }] },
                catalog,
                dashboardParametersByTab: {
                    tab1: [dashboardParameter("topN", { mode: "readonly", value: 5 })],
                },
                existingTabIds: new Set(["tab1"]),
            }),
        ).toBe(true);
    });

    it("is stale when a hidden parameter drifted from its workspace default", () => {
        // dashboard pins no explicit value -> current value falls back to the workspace default (3)
        expect(
            validateExistingAutomationParameters({
                storedParametersByTab: { tab1: [{ id: "topN", value: "8", title: "Top N" }] },
                catalog,
                dashboardParametersByTab: { tab1: [dashboardParameter("topN", { mode: "hidden" })] },
                existingTabIds: new Set(["tab1"]),
            }),
        ).toBe(true);
    });

    it("is not stale when a readonly parameter's pinned value still matches", () => {
        expect(
            validateExistingAutomationParameters({
                storedParametersByTab: { tab1: [{ id: "topN", value: "5", title: "Top N" }] },
                catalog,
                dashboardParametersByTab: {
                    tab1: [dashboardParameter("topN", { mode: "readonly", value: 5 })],
                },
                existingTabIds: new Set(["tab1"]),
            }),
        ).toBe(false);
    });

    it("is not stale when a readonly NUMBER parameter's stored value differs only in encoding", () => {
        expect(
            validateExistingAutomationParameters({
                storedParametersByTab: { tab1: [{ id: "topN", value: "5.0", title: "Top N" }] },
                catalog,
                dashboardParametersByTab: {
                    tab1: [dashboardParameter("topN", { mode: "readonly", value: 5 })],
                },
                existingTabIds: new Set(["tab1"]),
            }),
        ).toBe(false);
    });

    it("is stale when a readonly STRING parameter's stored value differs only in numeric-style encoding", () => {
        expect(
            validateExistingAutomationParameters({
                storedParametersByTab: {
                    tab1: [{ id: "scenario", value: "1.50", title: "Scenario", parameterType: "STRING" }],
                },
                catalog,
                dashboardParametersByTab: {
                    tab1: [
                        dashboardParameter("scenario", {
                            mode: "readonly",
                            parameterType: "STRING",
                            value: "1.5",
                        }),
                    ],
                },
                existingTabIds: new Set(["tab1"]),
            }),
        ).toBe(true);
    });

    it("is stale when a readonly STRING parameter's pinned value drifted from the dashboard", () => {
        expect(
            validateExistingAutomationParameters({
                storedParametersByTab: {
                    tab1: [{ id: "scenario", value: "Budget", title: "Scenario", parameterType: "STRING" }],
                },
                catalog,
                dashboardParametersByTab: {
                    tab1: [
                        dashboardParameter("scenario", {
                            mode: "readonly",
                            parameterType: "STRING",
                            value: "Plan",
                        }),
                    ],
                },
                existingTabIds: new Set(["tab1"]),
            }),
        ).toBe(true);
    });

    it("is not stale when a hidden STRING parameter still matches its workspace default", () => {
        expect(
            validateExistingAutomationParameters({
                storedParametersByTab: {
                    tab1: [{ id: "scenario", value: "Actual", title: "Scenario", parameterType: "STRING" }],
                },
                catalog,
                dashboardParametersByTab: {
                    tab1: [dashboardParameter("scenario", { mode: "hidden", parameterType: "STRING" })],
                },
                existingTabIds: new Set(["tab1"]),
            }),
        ).toBe(false);
    });

    it("ignores value drift for active parameters (the user owns their value)", () => {
        expect(
            validateExistingAutomationParameters({
                storedParametersByTab: { tab1: [{ id: "topN", value: "8", title: "Top N" }] },
                catalog,
                dashboardParametersByTab: {
                    tab1: [dashboardParameter("topN", { mode: "active", value: 5 })],
                },
                existingTabIds: new Set(["tab1"]),
            }),
        ).toBe(false);
    });

    it("is stale for a widget whose stored override sits under a different (old) tab", () => {
        // Widget moved from tab1 to tab2; both tabs still exist, but the override is orphaned under tab1.
        expect(
            validateExistingAutomationParameters({
                storedParametersByTab: { tab1: [{ id: "topN", value: "8", title: "Top N" }] },
                catalog,
                dashboardParametersByTab: { tab1: [dashboardParameter("topN")] },
                existingTabIds: new Set(["tab1", "tab2"]),
                widgetTabId: "tab2",
            }),
        ).toBe(true);
    });

    it("is not stale for a widget whose stored override sits under its current tab", () => {
        expect(
            validateExistingAutomationParameters({
                storedParametersByTab: { tab2: [{ id: "topN", value: "8", title: "Top N" }] },
                catalog,
                dashboardParametersByTab: { tab2: [dashboardParameter("topN")] },
                existingTabIds: new Set(["tab1", "tab2"]),
                widgetTabId: "tab2",
            }),
        ).toBe(false);
    });
});
