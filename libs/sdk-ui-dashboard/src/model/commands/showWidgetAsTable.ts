// (C) 2021-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";

import { type IDashboardCommand } from "./base.js";

/**
 * @beta
 */
export interface ISetShowWidgetAsTablePayload {
    ref: ObjRef;
    showAsTable: boolean;
}

/**
 * @beta
 */
export interface ISetShowWidgetAsTable extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.SHOW_WIDGET_AS_TABLE.SET";
    readonly payload: ISetShowWidgetAsTablePayload;
}
/**
 * Command to set a widget to show as table.
 *
 * @param ref - reference to the widget
 * @param showAsTable - whether to show as table or not
 * @beta
 */
export function setShowWidgetAsTable(ref: ObjRef, showAsTable: boolean): ISetShowWidgetAsTable {
    return {
        type: "GDC.DASH/CMD.SHOW_WIDGET_AS_TABLE.SET",
        payload: {
            ref,
            showAsTable,
        },
    };
}
