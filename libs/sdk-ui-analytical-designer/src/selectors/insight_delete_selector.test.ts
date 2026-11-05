// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IWorkspacePermissions } from "@gooddata/sdk-model";

import { canDeleteListedInsight, shouldLoadListedInsightPermissions } from "./insight_delete_selector.js";

const noPermissions: IWorkspacePermissions = {
    canInitData: false,
    canUploadNonProductionCSV: false,
    canExecuteRaw: false,
    canExportReport: false,
    canAccessWorkbench: false,
    canAnalyzeWorkspace: false,
    canCreateReport: false,
    canCreateVisualization: false,
    canCreateAnalyticalDashboard: false,
    canCreateMetric: false,
    canManageMetric: false,
    canManageReport: false,
    canManageAnalyticalDashboard: false,
    canManageProject: false,
    canCreateScheduledMail: false,
    canListUsersInProject: false,
    canManageDomain: false,
    canInviteUserToProject: false,
    canRefreshData: false,
    canManageACL: false,
    canManageScheduledMail: false,
    canExportTabular: false,
    canExportPdf: false,
    canCreateFilterView: false,
    canCreateAutomation: false,
    canCreateComputedAttribute: false,
    canCreateDocument: false,
    canManageVisualizations: false,
    canUseAiAssistant: false,
};
const analyst: IWorkspacePermissions = { ...noPermissions, canAnalyzeWorkspace: true };
const manager: IWorkspacePermissions = { ...analyst, canManageProject: true };

describe("canDeleteListedInsight", () => {
    const gate = canDeleteListedInsight.resultFunc;

    it("offers no delete in read-only mode or on inherited visualizations", () => {
        expect(gate(true, manager, true)({})).toBe(false);
        expect(gate(false, manager, true)({ isLocked: true })).toBe(false);
    });

    it("offers no delete on AI suggestions", () => {
        expect(gate(false, manager, false)({ isRelated: true })).toBe(false);
    });

    it("offers no delete until the workspace permissions are loaded", () => {
        expect(gate(false, null, false)({})).toBe(false);
    });

    it("follows the Analyze role when visualization permissions are off", () => {
        expect(gate(false, analyst, false)({})).toBe(true);
        expect(gate(false, noPermissions, false)({})).toBe(false);
    });

    it("follows the visualization's own edit right when visualization permissions are on", () => {
        expect(gate(false, analyst, true)({ permissions: ["EDIT", "VIEW"] })).toBe(true);
        expect(gate(false, analyst, true)({ permissions: ["VIEW"] })).toBe(false);
        expect(gate(false, analyst, true)({})).toBe(false);
        expect(gate(false, manager, true)({})).toBe(true);
    });
});

describe("shouldLoadListedInsightPermissions", () => {
    const shouldLoad = shouldLoadListedInsightPermissions.resultFunc;

    it("asks for permissions only when they decide the delete", () => {
        expect(shouldLoad(false, true, false)).toBe(true);
        expect(shouldLoad(false, true, true)).toBe(false);
        expect(shouldLoad(false, false, false)).toBe(false);
        expect(shouldLoad(true, true, false)).toBe(false);
    });
});
