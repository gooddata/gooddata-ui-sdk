// (C) 2021-2025 GoodData Corporation
import { IDashboardCommand } from "./base.js";
import { ObjRef } from "@gooddata/sdk-model";

/**
 * @beta
 */
export interface SetWidgetToShowAsTableCommandPayload {
    ref: ObjRef;
    showAsTable: boolean;
}

/**
 * @beta
 */
export interface SetWidgetToShowAsTableCommand extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.WIDGETS_TO_SHOW_AS_TABLE.SET";
    readonly payload: SetWidgetToShowAsTableCommandPayload;
}
/**
 * Command to set a widget to show as table.
 *
 * @param ref - reference to the widget
 * @param showAsTable - whether to show as table or not
 * @beta
 */
export function setWidgetToShowAsTable(ref: ObjRef, showAsTable: boolean): SetWidgetToShowAsTableCommand {
    return {
        type: "GDC.DASH/CMD.WIDGETS_TO_SHOW_AS_TABLE.SET",
        payload: {
            ref,
            showAsTable,
        },
    };
}
