// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { type IInsightEditorRouteInput, getInsightEditorRoute } from "./insightEditorRoute.js";

const widgetRef = idRef("widget", "insight");
const insightRef = idRef("insight", "insight");

const base: IInsightEditorRouteInput = {
    target: { type: "widget", ref: widgetRef },
    widgetInsightRef: insightRef,
    isWidgetInsightLocked: false,
    dashboardId: "dashboard",
    isEditMode: true,
    isEmbedded: false,
    canManageWorkspace: false,
    canCreateVisualization: true,
};

describe("getInsightEditorRoute", () => {
    it("edits the widget insight in edit mode", () => {
        expect(getInsightEditorRoute(base)).toEqual({
            insight: insightRef,
            config: {
                isEmbedded: true,
                hiddenActions: ["open", "clear", "export"],
                sourceDashboard: "dashboard",
                allowDashboardLinks: true,
            },
        });
    });

    it("marks an unsaved dashboard with an empty source dashboard", () => {
        expect(getInsightEditorRoute({ ...base, dashboardId: undefined }).config.sourceDashboard).toBe("");
    });

    it("hides save for a locked insight when the user cannot manage the workspace", () => {
        const route = getInsightEditorRoute({ ...base, isWidgetInsightLocked: true });
        expect(route.config.hiddenActions).toEqual(["open", "clear", "export", "save"]);
    });

    it("keeps save for a locked insight when the user can manage the workspace", () => {
        const route = getInsightEditorRoute({
            ...base,
            isWidgetInsightLocked: true,
            canManageWorkspace: true,
        });
        expect(route.config.hiddenActions).toEqual(["open", "clear", "export"]);
    });

    it("hides save as when the user cannot create visualizations", () => {
        const route = getInsightEditorRoute({ ...base, canCreateVisualization: false });
        expect(route.config.hiddenActions).toEqual(["open", "clear", "export", "saveAs"]);
    });

    it("hides open in Analytical Designer and dashboard links when embedded", () => {
        const route = getInsightEditorRoute({ ...base, isEmbedded: true });
        expect(route.config).toMatchObject({
            isEmbedded: false,
            hiddenActions: ["open", "clear", "export", "openInAnalyticalDesigner"],
            allowDashboardLinks: false,
        });
    });

    it("explores a copy of the widget insight in view mode", () => {
        expect(getInsightEditorRoute({ ...base, isEditMode: false })).toEqual({
            insight: undefined,
            config: {
                isEmbedded: true,
                hiddenActions: ["saveAs"],
                sourceInsight: insightRef,
            },
        });
    });

    it("edits an insight that is not on the dashboard, also in view mode", () => {
        const externalRef = idRef("external", "insight");
        const route = getInsightEditorRoute({
            ...base,
            target: { type: "insight", ref: externalRef },
            widgetInsightRef: undefined,
            isEditMode: false,
        });
        expect(route.insight).toEqual(externalRef);
        expect(route.config.sourceDashboard).toBe("dashboard");
    });

    it.each([{ type: "placeholder" as const }, { type: "new" as const }])(
        "creates a new insight for the $type target",
        (target) => {
            expect(getInsightEditorRoute({ ...base, target, widgetInsightRef: undefined })).toEqual({
                insight: undefined,
                config: {
                    isEmbedded: true,
                    hiddenActions: ["open", "export", "saveAs"],
                    displayedActions: ["cancel"],
                },
            });
        },
    );
});
