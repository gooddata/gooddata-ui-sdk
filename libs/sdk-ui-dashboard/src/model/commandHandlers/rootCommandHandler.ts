// (C) 2021 GoodData Corporation
import { actionChannel, call, getContext, take } from "redux-saga/effects";
import { loadDashboardCommandHandler } from "./loadDashboard/handler";
import { DashboardContext } from "../types/commonTypes";
import { DashboardCommands, IDashboardCommand } from "../commands";
import { eventDispatcher } from "../eventEmitter/eventDispatcher";
import { commandRejected, internalErrorOccurred } from "../events/general";

const DefaultCommandHandlers = {
    "GDC.DASHBOARD.CMD.LOAD": loadDashboardCommandHandler,
    "GDC.DASHBOARD.CMD.SAVE": unhandledCommand,
    "GDC.DASHBOARD.CMD.SAVEAS": unhandledCommand,
    "GDC.DASHBOARD.CMD.RESET": unhandledCommand,
    "GDC.DASHBOARD.CMD.RENAME": unhandledCommand,
    "GDC.DASHBOARD.CMD.DF.CHANGE_SELECTION": unhandledCommand,
    "GDC.DASHBOARD.CMD.AF.ADD": unhandledCommand,
    "GDC.DASHBOARD.CMD.AF.REMOVE": unhandledCommand,
    "GDC.DASHBOARD.CMD.AF.MOVE": unhandledCommand,
    "GDC.DASHBOARD.CMD.AF.CHANGE_SELECTION": unhandledCommand,
    "GDC.DASHBOARD.CMD.AF.SET_PARENT": unhandledCommand,
    "GDC.DASHBOARD.CMD.FL.ADD_SECTION": unhandledCommand,
    "GDC.DASHBOARD.CMD.FL.MOVE_SECTION": unhandledCommand,
    "GDC.DASHBOARD.CMD.FL.REMOVE_SECTION": unhandledCommand,
    "GDC.DASHBOARD.CMD.FL.CHANGE_SECTION_HEADER": unhandledCommand,
    "GDC.DASHBOARD.CMD.FL.ADD_ITEMS": unhandledCommand,
    "GDC.DASHBOARD.CMD.FL.MOVE_ITEM": unhandledCommand,
    "GDC.DASHBOARD.CMD.FL.REMOVE_ITEM": unhandledCommand,
    "GDC.DASHBOARD.CMD.FL.UNDO": unhandledCommand,
};

function* unhandledCommand(ctx: DashboardContext, cmd: IDashboardCommand) {
    yield call(eventDispatcher, commandRejected(ctx, cmd.correlationId));
}

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
        const commandHandler = DefaultCommandHandlers[action.type] ?? unhandledCommand;

        try {
            yield call(commandHandler, dashboardContext, action);
        } catch (e) {
            // Errors during command handling should be caught and addressed in the handler, possibly with a
            // more meaningful error message. If the error bubbles up to here then there are holes in error
            // handling or something is seriously messed up.
            yield call(
                eventDispatcher,
                internalErrorOccurred(
                    dashboardContext,
                    `Internal error has occurred while handling ${action.type}`,
                    e,
                    action.correlationId,
                ),
            );
        }
    }
}
