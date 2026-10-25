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

export function clearFinishedEvent(
    availableCommands: GdcAdCommandType[],
    postMessageContextId?: string,
): void {
    const clearFinishedBody: IAdAvailableCommands = { availableCommands };
    adPostEvent(GdcAdEventType.ClearFinished, clearFinishedBody, postMessageContextId);
}

export function clearFailedEvent(postMessageContextId?: string): void {
    const error: ICommandFailedBody = {
        errorCode: GdcErrorType.InvalidState,
        errorMessage: "The app is not in a state to process clear command",
    };
    adPostEvent(GdcEventType.AppCommandFailed, error, postMessageContextId);
}
