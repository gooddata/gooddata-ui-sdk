// (C) 2020-2026 GoodData Corporation

import {
    type GdcAdCommandType,
    GdcAdEventType,
    GdcErrorType,
    GdcEventType,
    type ICommandFailedBody,
    type IObjectMeta,
} from "@gooddata/sdk-embedding";
import { type IInsightDefinition } from "@gooddata/sdk-model";

import { adPostEvent } from "./post_event_helper.js";

export const insightNotFoundError: ICommandFailedBody = {
    errorCode: GdcErrorType.RuntimeError,
    errorMessage: "The insight is not found",
};

/**
 * Emit an event to notify outer app that the insight is opened.
 */
/**
 * What the InsightOpened event carries. Deliberately NOT sdk-embedding's AdInsightOpenedBody:
 * its `definition` differs from what AD has always posted (ONE-4679).
 */
export interface IAdInsightOpenedBody {
    availableCommands: GdcAdCommandType[];
    definition: IInsightDefinition;
    insight: IObjectMeta;
}

export function insightOpened(
    availableCommands: GdcAdCommandType[],
    insight: IObjectMeta,
    definition: IInsightDefinition,
    postMessageContextId?: string,
): void {
    const insightOpenedBody: IAdInsightOpenedBody = {
        availableCommands,
        definition,
        insight,
    };
    adPostEvent(GdcAdEventType.InsightOpened, insightOpenedBody, postMessageContextId);
}

export function insightNotFound(postMessageContextId?: string): void {
    adPostEvent(GdcEventType.AppCommandFailed, insightNotFoundError, postMessageContextId);
}

export function openInsightInvalidArgument(postMessageContextId?: string): void {
    const error: ICommandFailedBody = {
        errorCode: GdcErrorType.InvalidArgument,
        errorMessage: "Project id is not provided",
    };
    adPostEvent(GdcEventType.AppCommandFailed, error, postMessageContextId);
}
