// (C) 2020-2026 GoodData Corporation

import {
    type AdExportFinishedBody,
    type GdcAdCommandType,
    GdcAdEventType,
    GdcErrorType,
    GdcEventType,
    type ICommandFailedBody,
} from "@gooddata/sdk-embedding";

import { adPostEvent } from "./post_event_helper.js";

export function getInvalidExportFormatError(format: string): ICommandFailedBody {
    return {
        errorCode: GdcErrorType.InvalidArgument,
        errorMessage: `Cannot export the insight with format ${format}`,
    };
}

export function getInvalidExportStateError(format: string): ICommandFailedBody {
    return {
        errorCode: GdcErrorType.InvalidState,
        errorMessage: `The app is not in a state to export to ${format}`,
    };
}

export function exportInvalidFormat(format: string, postMessageContextId?: string): void {
    adPostEvent(GdcEventType.AppCommandFailed, getInvalidExportFormatError(format), postMessageContextId);
}

export function exportInvalidState(format: string, postMessageContextId?: string): void {
    adPostEvent(GdcEventType.AppCommandFailed, getInvalidExportStateError(format), postMessageContextId);
}

export function exportFailed(postMessageContextId?: string): void {
    const error: ICommandFailedBody = {
        errorCode: GdcErrorType.RuntimeError,
        errorMessage: "Export insight failed",
    };
    adPostEvent(GdcEventType.AppCommandFailed, error, postMessageContextId);
}

/**
 * Emit an event to notify outer app that the insight is exported.
 */
export function exportFinished(
    availableCommands: GdcAdCommandType[],
    exportFileLink: string,
    postMessageContextId?: string,
): void {
    const exportFinishedBody: AdExportFinishedBody = {
        availableCommands,
        link: exportFileLink,
    };
    adPostEvent(GdcAdEventType.ExportFinished, exportFinishedBody, postMessageContextId);
}
