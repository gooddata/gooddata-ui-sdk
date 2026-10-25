// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";
import { omit } from "lodash-es";

import { type AdOpenInsightCommandData, type IPostMessageContextPayload } from "@gooddata/sdk-embedding";

import { type ICustomRouteParams } from "../../typings/location.js";
import {
    DEFAULT_POST_MESSAGE_CONTEXT_ID,
    createPostMessageContextFromId,
} from "../actions/post_message_action_helper.js";

import { PostEventActionTypeKeys } from "./action_types.js";

export interface IOpenInsightActionPayload extends IPostMessageContextPayload {
    customRouteParams: ICustomRouteParams;
}

export interface IOpenInsightFailedActionPayload extends IPostMessageContextPayload {
    isInsightNotFound?: boolean;
}

export interface IOpenInsightFinishedActionPayload extends IPostMessageContextPayload {
    time: number;
}

export const openInsightRequested = createAction(
    PostEventActionTypeKeys.OPEN_INSIGHT_REQUESTED,
    (openInsightCommandData: AdOpenInsightCommandData) => {
        const { data, contextId = DEFAULT_POST_MESSAGE_CONTEXT_ID } = openInsightCommandData.gdc.event;
        const postMessageContext: IPostMessageContextPayload = createPostMessageContextFromId(contextId);
        /**
         * Change from reportId to insightId.
         * But still keep reportId because of backward compatibility
         */
        const { insightId, reportId } = data;
        const customRouteParams = {
            ...omit(data, "insightId"),
            reportId: insightId || reportId,
        };

        const payload: IOpenInsightActionPayload = {
            customRouteParams,
            ...postMessageContext,
        };
        return { payload };
    },
);

export type IOpenInsightAction = ReturnType<typeof openInsightRequested>;

export const openInsightFailed = createAction(
    PostEventActionTypeKeys.OPEN_INSIGHT_EVENT_FAILED,
    (contextId: string, isInsightNotFound = false) => {
        const payload: IOpenInsightFailedActionPayload = {
            isInsightNotFound,
            ...createPostMessageContextFromId(contextId),
        };
        return { payload };
    },
);

export type IOpenInsightFailedAction = ReturnType<typeof openInsightFailed>;

export const openInsightFinished = createAction(
    PostEventActionTypeKeys.OPEN_INSIGHT_EVENT_FINISHED,
    (time: number, contextId: string) => {
        const payload: IOpenInsightFinishedActionPayload = {
            time,
            ...createPostMessageContextFromId(contextId),
        };
        return { payload };
    },
);
