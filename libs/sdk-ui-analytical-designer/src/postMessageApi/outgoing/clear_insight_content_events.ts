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

export function clearInsightContentFinishedEvent(
    availableCommands: GdcAdCommandType[],
    postMessageContextId?: string,
): void {
    const clearInsightFinishedBody: IAdAvailableCommands = { availableCommands };
    adPostEvent(GdcAdEventType.ClearInsightFinished, clearInsightFinishedBody, postMessageContextId);
}

export function clearInsightContentFailedEvent(postMessageContextId?: string): void {
    const error: ICommandFailedBody = {
        errorCode: GdcErrorType.InvalidState,
        errorMessage: "The app is not in a state to process the clearInsight command",
    };
    adPostEvent(GdcEventType.AppCommandFailed, error, postMessageContextId);
}
