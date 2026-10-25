// (C) 2020-2026 GoodData Corporation

import { GdcErrorType, GdcEventType, type ICommandFailedBody } from "@gooddata/sdk-embedding";

import { adPostEvent } from "./post_event_helper.js";

export function invalidCommand(errorBody: ICommandFailedBody, contextId?: string): void {
    adPostEvent(GdcEventType.AppCommandFailed, errorBody, contextId);
}

export function postInvalidCommandArgument(errorMessage: string, contextId?: string): void {
    const invalidCommandError: ICommandFailedBody = {
        errorCode: GdcErrorType.InvalidArgument,
        errorMessage: errorMessage,
    };
    invalidCommand(invalidCommandError, contextId);
}
