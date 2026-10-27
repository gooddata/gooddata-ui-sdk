// (C) 2020-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

import { type InsightEditorTarget } from "../../model/types/insightEditorTypes.js";

type HiddenAction = "open" | "clear" | "export" | "save" | "saveAs" | "openInAnalyticalDesigner";

export interface IInsightEditorRouteInput {
    target: InsightEditorTarget;
    /**
     * The insight of the widget target. Undefined for the other targets, or when the widget has no
     * insight.
     */
    widgetInsightRef: ObjRef | undefined;
    isWidgetInsightLocked: boolean;
    dashboardId: string | undefined;
    isEditMode: boolean;
    isEmbedded: boolean;
    canManageWorkspace: boolean;
    canCreateVisualization: boolean;
}

/**
 * The part of the Analytical Designer props that selects the flow: edit, explore or create.
 */
export interface IInsightEditorRoute {
    insight: ObjRef | undefined;
    config: {
        isEmbedded: boolean;
        hiddenActions: HiddenAction[];
        displayedActions?: Array<"cancel">;
        sourceDashboard?: string;
        sourceInsight?: ObjRef;
        allowDashboardLinks?: boolean;
    };
}

export function getInsightEditorRoute(input: IInsightEditorRouteInput): IInsightEditorRoute {
    const { target, widgetInsightRef, isEditMode, isEmbedded } = input;
    const externalInsightRef = target.type === "insight" ? target.ref : undefined;
    const isEmbeddedFromDashboard = !isEmbedded;

    if (externalInsightRef || (widgetInsightRef && isEditMode)) {
        const hiddenActions: HiddenAction[] = ["open", "clear", "export"];
        const canSaveInsight = input.canManageWorkspace || !input.isWidgetInsightLocked;
        if (!canSaveInsight) {
            hiddenActions.push("save");
        } else if (!input.canCreateVisualization) {
            hiddenActions.push("saveAs");
        }
        if (isEmbedded) {
            hiddenActions.push("openInAnalyticalDesigner");
        }

        return {
            insight: externalInsightRef ?? widgetInsightRef,
            config: {
                isEmbedded: isEmbeddedFromDashboard,
                hiddenActions,
                // The presence of the source dashboard starts the edit-from-dashboard flow in AD. A
                // dashboard that was never saved has no identifier, so an empty string marks it.
                sourceDashboard: input.dashboardId ?? "",
                allowDashboardLinks: !isEmbedded,
            },
        };
    }

    if (widgetInsightRef) {
        return {
            insight: undefined,
            config: {
                isEmbedded: isEmbeddedFromDashboard,
                hiddenActions: ["saveAs"],
                sourceInsight: widgetInsightRef,
            },
        };
    }

    return {
        insight: undefined,
        config: {
            isEmbedded: isEmbeddedFromDashboard,
            hiddenActions: ["open", "export", "saveAs"],
            displayedActions: ["cancel"],
        },
    };
}
