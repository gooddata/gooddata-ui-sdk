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

export function redoFinishedEvent(
    availableCommands: GdcAdCommandType[],
    postMessageContextId?: string,
): void {
    const redoBody: IAdAvailableCommands = {
        availableCommands,
    };
    adPostEvent(GdcAdEventType.RedoFinished, redoBody, postMessageContextId);
}

export function redoFailedEvent(postMessageContextId?: string): void {
    const error: ICommandFailedBody = {
        errorCode: GdcErrorType.InvalidState,
        errorMessage: "The app is not in a state to process redo command",
    };
    adPostEvent(GdcEventType.AppCommandFailed, error, postMessageContextId);
}
