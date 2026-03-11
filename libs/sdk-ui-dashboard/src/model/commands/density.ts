// (C) 2026 GoodData Corporation

import { type IDashboardCommand } from "./base.js";
import { type DashboardDensity } from "../../types.js";

/**
 * @alpha
 */
export interface IRequestOpenDensityDialog extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.OPEN_DENSITY_DIALOG";
}

/**
 * Creates the RequestOpenDensityDialog command.
 *
 * @remarks
 * Dispatching this command will open the content density dialog.
 *
 * @param correlationId - specify correlation id to use for this command
 *
 * @alpha
 */
export function requestOpenDensityDialog(correlationId?: string): IRequestOpenDensityDialog {
    return {
        type: "GDC.DASH/CMD.OPEN_DENSITY_DIALOG",
        correlationId,
    };
}

/**
 * Payload of the {@link IChangeDashboardDensity} command.
 *
 * @alpha
 */
export interface IChangeDashboardDensityPayload {
    readonly density: DashboardDensity;
}

/**
 * @alpha
 */
export interface IChangeDashboardDensity extends IDashboardCommand {
    readonly type: "GDC.DASH/CMD.CHANGE_DENSITY";
    readonly payload: IChangeDashboardDensityPayload;
}

/**
 * Creates the ChangeDashboardDensity command.
 *
 * @remarks
 * Dispatching this command will change the dashboard density setting for the current user.
 * The value is persisted in localStorage and will be used on the next dashboard load,
 * taking priority over the theme's default density setting.
 *
 * @param density - density value to set
 * @param correlationId - specify correlation id to use for this command. this will be included in all
 *  events that will be emitted during the command processing
 *
 * @alpha
 */
export function changeDashboardDensity(
    density: DashboardDensity,
    correlationId?: string,
): IChangeDashboardDensity {
    return {
        type: "GDC.DASH/CMD.CHANGE_DENSITY",
        correlationId,
        payload: {
            density,
        },
    };
}
