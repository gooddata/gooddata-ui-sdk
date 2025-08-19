// (C) 2021-2025 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";

import { IDashboardCommand } from "./base.js";

/**
 * @beta
 */
export interface SetShowWidgetAsTablePayload {
    ref: ObjRef;
    showAsTable: boolean;
}

/**
 * @beta
 */
export interface SetShowWidgetAsTable extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.SHOW_WIDGET_AS_TABLE.SET";
    readonly payload: SetShowWidgetAsTablePayload;
}
/**
 * Command to set a widget to show as table.
 *
 * @param ref - reference to the widget
 * @param showAsTable - whether to show as table or not
 * @beta
 */
export function setShowWidgetAsTable(ref: ObjRef, showAsTable: boolean): SetShowWidgetAsTable {
    return {
        type: "GDC.DASH/CMD.SHOW_WIDGET_AS_TABLE.SET",
        payload: {
            ref,
            showAsTable,
        },
    };
}
