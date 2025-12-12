// (C) 2021-2025 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import {
    type DashboardLayoutCommands,
    type UndoLayoutChanges,
    type UndoPointSelector,
} from "../../commands/index.js";
import { invalidArgumentsProvided } from "../../events/general.js";
import { type DashboardLayoutChanged, layoutChanged } from "../../events/layout.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectLayout, selectUndoableLayoutCommands } from "../../store/tabs/layout/layoutSelectors.js";
import { type DashboardContext } from "../../types/commonTypes.js";

/*
 * Default impl returns 0 -> meaning drop everything that the latest command achieved.
 */
const latestCommandUndoSelector: UndoPointSelector = (
    _cmds: ReadonlyArray<DashboardLayoutCommands>,
): number => {
    return 0;
};

export function* undoLayoutChangesHandler(
    ctx: DashboardContext,
    cmd: UndoLayoutChanges,
): SagaIterator<DashboardLayoutChanged> {
    const undoableCommands: ReturnType<typeof selectUndoableLayoutCommands> = yield select(
        selectUndoableLayoutCommands,
    );
    const { undoPointSelector = latestCommandUndoSelector } = cmd.payload;
    const undoUpToIncludingCmd = undoPointSelector(undoableCommands.map((entry) => entry.cmd));

    if (undoUpToIncludingCmd < 0 || undoUpToIncludingCmd >= undoableCommands.length) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Undo point selector returned result out of bounds. Undoable commands: ${undoableCommands.length}. Got index: ${undoUpToIncludingCmd}`,
        );
    }

    const selectedCommand = undoableCommands[undoUpToIncludingCmd];

    yield put(
        tabsActions.undoLayout({
            undoDownTo: selectedCommand.firstOccurrenceOnStack,
        }),
    );

    const layout: ReturnType<typeof selectLayout> = yield select(selectLayout);

    return layoutChanged(ctx, layout, cmd.correlationId);
}
