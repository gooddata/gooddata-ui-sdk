// (C) 2021 GoodData Corporation
import { actionChannel, call, getContext, take } from "redux-saga/effects";
import { loadDashboardCommandHandler } from "./loadDashboard/handler";
import { DashboardContext } from "../types/commonTypes";
import { DashboardCommands, IDashboardCommand } from "../commands";
import { dispatchDashboardEvent } from "../eventEmitter/eventDispatcher";
import { commandRejected, internalErrorOccurred } from "../events/general";

const DefaultCommandHandlers = {
    "GDC.DASH/CMD.LOAD": loadDashboardCommandHandler,
    "GDC.DASH/CMD.SAVE": unhandledCommand,
    "GDC.DASH/CMD.SAVEAS": unhandledCommand,
    "GDC.DASH/CMD.RESET": unhandledCommand,
    "GDC.DASH/CMD.RENAME": unhandledCommand,
    "GDC.DASH/CMD.DATE_FILTER.CHANGE_SELECTION": unhandledCommand,
    "GDC.DASH/CMD.ATTRIBUTE_FILTER.ADD": unhandledCommand,
    "GDC.DASH/CMD.ATTRIBUTE_FILTER.REMOVE": unhandledCommand,
    "GDC.DASH/CMD.ATTRIBUTE_FILTER.MOVE": unhandledCommand,
    "GDC.DASH/CMD.ATTRIBUTE_FILTER.CHANGE_SELECTION": unhandledCommand,
    "GDC.DASH/CMD.ATTRIBUTE_FILTER.SET_PARENT": unhandledCommand,
    "GDC.DASH/CMD.FLUID_LAYOUT.ADD_SECTION": unhandledCommand,
    "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_SECTION": unhandledCommand,
    "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_SECTION": unhandledCommand,
    "GDC.DASH/CMD.FLUID_LAYOUT.CHANGE_SECTION_HEADER": unhandledCommand,
    "GDC.DASH/CMD.FLUID_LAYOUT.ADD_ITEMS": unhandledCommand,
    "GDC.DASH/CMD.FLUID_LAYOUT.MOVE_ITEM": unhandledCommand,
    "GDC.DASH/CMD.FLUID_LAYOUT.REMOVE_ITEM": unhandledCommand,
    "GDC.DASH/CMD.FLUID_LAYOUT.UNDO": unhandledCommand,
};

function* unhandledCommand(ctx: DashboardContext, cmd: IDashboardCommand) {
    yield dispatchDashboardEvent(commandRejected(ctx, cmd.correlationId));
}

/**
 * Root command handler is the central point through which all command processing is done. The handler registers
 * for all actions starting with `GDC.CMD` === all dashboard commands.
 *
 * The commands are intended for serial processing, without any forking. A buffering action channel is in place to
 * prevent loss of commands.
 */
export function* rootCommandHandler() {
    const commandChannel = yield actionChannel((action: any) => action.type.startsWith("GDC.DASH/CMD"));

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
            yield dispatchDashboardEvent(
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
