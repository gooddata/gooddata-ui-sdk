// (C) 2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

import { type IDashboardCommand } from "./base.js";

/**
 * Payload of the {@link IDeleteInsight} command.
 * @alpha
 */
export interface IDeleteInsightPayload {
    /**
     * Reference to the insight (visualization) to delete from the workspace.
     */
    readonly ref: ObjRef;
}

/**
 * @alpha
 */
export interface IDeleteInsight extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.INSIGHT.DELETE";
    readonly payload: IDeleteInsightPayload;
}

/**
 * Creates the DeleteInsight command. Dispatching this command will delete the insight (visualization) from the
 * workspace and request a refresh of the visualization list.
 *
 * @remarks
 * The command is rejected when the dashboard being edited uses the insight, in a saved or an unsaved widget,
 * visualization switcher entry or drill target; remove it from the dashboard first. Other dashboards are not
 * inspected here; check them before dispatching, for instance with
 * {@link @gooddata/sdk-backend-spi#IWorkspaceInsightsService.getInsightReferencingObjects}.
 *
 * @param ref - reference of the insight to delete
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function deleteInsight(ref: ObjRef, correlationId?: string): IDeleteInsight {
    return {
        type: "GDC.DASH/CMD.INSIGHT.DELETE",
        correlationId,
        payload: {
            ref,
        },
    };
}
