// (C) 2021 GoodData Corporation
import { actionChannel, call, getContext, take } from "redux-saga/effects";
import { DashboardCommands } from "../commands/dashboard";
import { loadDashboardCommandHandler } from "./loadDashboard/handler";
import { DashboardContext } from "../types/commonTypes";

/**
 * Root command handler is the central point through which all command processing is done. The handler registers
 * for all actions starting with `GDC.CMD` === all dashboard commands.
 *
 * The commands are intended for serial processing, without any forking. A buffering action channel is in place to
 * prevent loss of commands.
 */
export function* rootCommandHandler() {
    // eslint-disable-next-line no-console
    console.debug("starting root command handler");

    const commandChannel = yield actionChannel((action: any) => action.type.startsWith("GDC.DASHBOARD.CMD"));

    while (true) {
        const action: DashboardCommands = yield take(commandChannel);
        const dashboardContext: DashboardContext = yield getContext("dashboardContext");

        switch (action.type) {
            case "GDC.DASHBOARD.CMD.LOAD": {
                yield call(loadDashboardCommandHandler, dashboardContext, action);
                break;
            }
            default:
                ((x: never) => {
                    throw new Error(`${x} was unhandled`);
                })(action.type);
        }
    }
}
