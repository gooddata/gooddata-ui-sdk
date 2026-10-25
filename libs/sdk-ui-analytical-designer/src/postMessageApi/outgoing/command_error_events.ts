// (C) 2020-2026 GoodData Corporation

import { GdcErrorType, GdcEventType, GdcProductName, type ICommandFailedBody } from "@gooddata/sdk-embedding";

import { adPostEvent } from "./post_event_helper.js";

export function insecureCommandFailedEvent(commandType: string, contextId?: string): void {
    const secureCommandError: ICommandFailedBody = {
        errorCode: GdcErrorType.InvalidState,
        errorMessage: `Write commands are not enabled for this organization (${commandType})`,
    };
    adPostEvent(GdcEventType.AppCommandFailed, secureCommandError, contextId);
}

export function hostDomainVerificationFailedEvent(contextId?: string): void {
    const commandError: ICommandFailedBody = {
        errorCode: GdcErrorType.InvalidState,
        errorMessage: `The host domain is not allowed to control embedded ${GdcProductName.ANALYTICAL_DESIGNER}`,
    };
    adPostEvent(GdcEventType.AppCommandFailed, commandError, contextId);
}
