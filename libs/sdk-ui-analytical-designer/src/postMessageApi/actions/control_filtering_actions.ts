// (C) 2020-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import {
    type AdRemoveFilterContextCommandData,
    type AdSetFilterContextCommandData,
    type ICommandFailedBody,
    type IFilterContextContent,
    type IPostMessageContextPayload,
    type IRemoveFilterContextContent,
} from "@gooddata/sdk-embedding";
import { type ITransformedAttributeFilterItem as IBaseTransformedAttributeFilterItem } from "@gooddata/sdk-embedding/internal";

import { sanitizeRemoveFilterContext, sanitizeSetFilterContext } from "../../utils/id_prefix_sanitize.js";

import { PostEventActionTypeKeys } from "./action_types.js";
import {
    DEFAULT_POST_MESSAGE_CONTEXT_ID,
    createPostMessageContextFromId,
} from "./post_message_action_helper.js";

export interface ITransformedAttributeFilterItem extends IBaseTransformedAttributeFilterItem {
    localIdentifier?: string;
    cacheItemIdentifier?: string;
}

type SetFilterContextActionPayload = IFilterContextContent & IPostMessageContextPayload;
type ControlFilteringContextFailedActionPayload = {
    errorBody: ICommandFailedBody;
} & IPostMessageContextPayload;
type RemoveFilterContextActionPayload = IRemoveFilterContextContent & IPostMessageContextPayload;
type ControlFilteringContextFinishedActionPayload = {
    attributeFilterCount: number;
    hasDateFilter: boolean;
    hasRankingFilter: boolean;
} & IPostMessageContextPayload;

export const setFilterContextRequested = createAction(
    PostEventActionTypeKeys.SET_FILTER_CONTEXT_REQUESTED,
    (filterContext: AdSetFilterContextCommandData) => {
        const {
            data: { filters },
            contextId = DEFAULT_POST_MESSAGE_CONTEXT_ID,
        } = filterContext.gdc.event;
        const payload: SetFilterContextActionPayload = {
            filters: sanitizeSetFilterContext(filters),
            ...createPostMessageContextFromId(contextId),
        };
        return { payload };
    },
);

export type ISetFilterContextRequestedAction = ReturnType<typeof setFilterContextRequested>;

export const setFilterContextFailedAction = createAction(
    PostEventActionTypeKeys.SET_FILTER_CONTEXT_FAILED,
    (errorBody: ICommandFailedBody, contextId: string) => {
        const payload: ControlFilteringContextFailedActionPayload = {
            ...createPostMessageContextFromId(contextId),
            errorBody,
        };
        return { payload };
    },
);

export type ISetFilterContextFailedAction = ReturnType<typeof setFilterContextFailedAction>;

export const setFilterContextFinishedAction = createAction(
    PostEventActionTypeKeys.SET_FILTER_CONTEXT_FINISHED,
    (contextId: string, attributeFilterCount: number, hasDateFilter: boolean, hasRankingFilter: boolean) => {
        const payload: ControlFilteringContextFinishedActionPayload = {
            ...createPostMessageContextFromId(contextId),
            attributeFilterCount,
            hasDateFilter,
            hasRankingFilter,
        };
        return { payload };
    },
);

export type ISetFilterContextFinishedAction = ReturnType<typeof setFilterContextFinishedAction>;

export const removeFilterContextRequested = createAction(
    PostEventActionTypeKeys.REMOVE_FILTER_CONTEXT_REQUESTED,
    (filterContext: AdRemoveFilterContextCommandData) => {
        const {
            data: { filters },
            contextId = DEFAULT_POST_MESSAGE_CONTEXT_ID,
        } = filterContext.gdc.event;
        const payload: RemoveFilterContextActionPayload = {
            filters: sanitizeRemoveFilterContext(filters),
            ...createPostMessageContextFromId(contextId),
        };
        return { payload };
    },
);

export type IRemoveFilterContextRequestedAction = ReturnType<typeof removeFilterContextRequested>;

export const removeFilterContextFailedAction = createAction(
    PostEventActionTypeKeys.REMOVE_FILTER_CONTEXT_FAILED,
    (errorBody: ICommandFailedBody, contextId: string) => {
        const payload: ControlFilteringContextFailedActionPayload = {
            ...createPostMessageContextFromId(contextId),
            errorBody,
        };
        return { payload };
    },
);

export type IRemoveFilterContextFailedAction = ReturnType<typeof removeFilterContextFailedAction>;

export const removeFilterContextFinishedAction = createAction(
    PostEventActionTypeKeys.REMOVE_FILTER_CONTEXT_FINISHED,
    (contextId: string, attributeFilterCount: number, hasDateFilter: boolean, hasRankingFilter: boolean) => {
        const payload: ControlFilteringContextFinishedActionPayload = {
            ...createPostMessageContextFromId(contextId),
            attributeFilterCount,
            hasDateFilter,
            hasRankingFilter,
        };
        return { payload };
    },
);

export type IRemoveFilterContextFinishedAction = ReturnType<typeof removeFilterContextFinishedAction>;

export const removeFilterItemsFromState = createAction(
    PostEventActionTypeKeys.STORE_REMOVE_FILTER_ITEMS,
    (localIdentifiers: ReadonlyArray<string>, isFromFilterBarDropdown: boolean) => ({
        payload: {
            localIdentifiers,
            isFromFilterBarDropdown,
        },
    }),
);

export type IRemoveFilterItemsAction = ReturnType<typeof removeFilterItemsFromState>;
