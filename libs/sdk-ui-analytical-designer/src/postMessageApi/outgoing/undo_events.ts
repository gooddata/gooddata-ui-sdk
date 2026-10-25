// (C) 2020-2026 GoodData Corporation

import {
    type GdcAdCommandType,
    GdcAdEventType,
    GdcErrorType,
    GdcEventType,
    type IAdAvailableCommands,
    type ICommandFailedBody,
} from "@gooddata/sdk-embedding";

import { adPostEvent } from "./post_event_helper.js";

export function undoFinishedEvent(
    availableCommands: GdcAdCommandType[],
    postMessageContextId?: string,
): void {
    const undoBody: IAdAvailableCommands = {
        availableCommands,
    };
    adPostEvent(GdcAdEventType.UndoFinished, undoBody, postMessageContextId);
}

export function undoFailedEvent(postMessageContextId?: string): void {
    const error: ICommandFailedBody = {
        errorCode: GdcErrorType.InvalidState,
        errorMessage: "The app is not in a state to process undo command",
    };
    adPostEvent(GdcEventType.AppCommandFailed, error, postMessageContextId);
}
