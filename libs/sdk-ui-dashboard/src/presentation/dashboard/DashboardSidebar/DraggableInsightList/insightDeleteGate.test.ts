// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IInsight,
    type ISettings,
    type IWorkspacePermissions,
    newInsightDefinition,
} from "@gooddata/sdk-model";

import { canDeleteInsight, shouldLoadInsightPermissionsForDelete } from "./insightDeleteGate.js";

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
    canManageVisualizations: false,
    canUseAiAssistant: false,
};
const analyst: IWorkspacePermissions = { ...noPermissions, canAnalyzeWorkspace: true };
const manager: IWorkspacePermissions = { ...analyst, canManageProject: true };

const featureOn: ISettings = { enableDashboardVisualizationDelete: true };
const featureOnWithPermissions: ISettings = {
    enableDashboardVisualizationDelete: true,
    enableVisualizationPermissions: true,
};

function insight(overrides: Partial<IInsight["insight"]> = {}): IInsight {
    const definition = newInsightDefinition("local:table");
    return {
        insight: {
            ...definition.insight,
            identifier: "viz",
            uri: "/viz",
            ref: { identifier: "viz", type: "insight" },
            ...overrides,
        },
    };
}

describe("canDeleteInsight", () => {
    it("hides the action when the feature is off", () => {
        expect(canDeleteInsight(insight(), { enableDashboardVisualizationDelete: false }, manager)).toBe(
            false,
        );
        expect(canDeleteInsight(insight(), undefined, manager)).toBe(false);
    });

    it("hides the action on inherited visualizations", () => {
        expect(canDeleteInsight(insight({ isLocked: true }), featureOn, manager)).toBe(false);
    });

    it("follows the Analyze role when visualization permissions are off", () => {
        expect(canDeleteInsight(insight(), featureOn, analyst)).toBe(true);
        expect(canDeleteInsight(insight(), featureOn, noPermissions)).toBe(false);
    });

    it("follows the visualization's own edit right when visualization permissions are on", () => {
        const settings = featureOnWithPermissions;
        expect(canDeleteInsight(insight({ permissions: ["EDIT", "VIEW"] }), settings, analyst)).toBe(true);
        expect(canDeleteInsight(insight({ permissions: ["VIEW"] }), settings, analyst)).toBe(false);
        expect(canDeleteInsight(insight(), settings, analyst)).toBe(false);
        expect(canDeleteInsight(insight(), settings, manager)).toBe(true);
    });
});

describe("shouldLoadInsightPermissionsForDelete", () => {
    it("asks for permissions only when they decide the action", () => {
        expect(shouldLoadInsightPermissionsForDelete(featureOnWithPermissions, analyst)).toBe(true);
        expect(shouldLoadInsightPermissionsForDelete(featureOnWithPermissions, manager)).toBe(false);
        expect(shouldLoadInsightPermissionsForDelete(featureOn, analyst)).toBe(false);
        expect(shouldLoadInsightPermissionsForDelete({ enableVisualizationPermissions: true }, analyst)).toBe(
            false,
        );
    });
});
