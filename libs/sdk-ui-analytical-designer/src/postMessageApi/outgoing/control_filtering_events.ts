// (C) 2020-2026 GoodData Corporation

import {
    type AdFilterContextChangedBody,
    type FilterItem,
    type GdcAdCommandType,
    GdcAdEventType,
    GdcErrorType,
    type IAdAvailableCommands,
    type ICommandFailedBody,
} from "@gooddata/sdk-embedding";

import { adPostEvent } from "./post_event_helper.js";

export function setFilterContextFinishedEvent(
    availableCommands: GdcAdCommandType[],
    postMessageContextId?: string,
): void {
    const setFilterContextFinishedBody: IAdAvailableCommands = { availableCommands };
    adPostEvent(GdcAdEventType.SetFilterContextFinished, setFilterContextFinishedBody, postMessageContextId);
}

export function removeFilterContextFinishedEvent(
    availableCommands: GdcAdCommandType[],
    postMessageContextId?: string,
): void {
    const removeFilterContextFinishedBody: IAdAvailableCommands = { availableCommands };
    adPostEvent(
        GdcAdEventType.RemoveFilterContextFinished,
        removeFilterContextFinishedBody,
        postMessageContextId,
    );
}

// notify the parent window that filterContextChanged event is fired
export function postFilterContextChanged(availableCommands: GdcAdCommandType[], filter: FilterItem): void {
    const data: AdFilterContextChangedBody = {
        availableCommands,
        filters: [filter],
    };
    adPostEvent(GdcAdEventType.FilterContextChanged, data);
}

const invalidAttFilterDfUri: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The command has invalid attribute display form uri",
};

const hasNonDefaultAttributeDisplayFormError: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The command has non-default attribute display form.",
};

const invalidAttFilterId: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The command has invalid attribute display form identifier",
};

const computedAttributesDisabled: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage:
        "The command references a computed attribute, but computed attributes are not enabled in the workspace",
};

const invalidAttFilterValue: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The command has invalid attribute display form value",
};

const invalidAttFilterArgument: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The command contains invalid attribute",
};

const invalidDateDatasetUri: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The command has invalid date dataSet uri",
};

const invalidDateDatasetId: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The command has invalid date dataSet identifier",
};

const invalidDateIdentifier: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The command has invalid date filter local identifier",
};

const invalidDateFilterCountError: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The command has too many date filter value. Only one is supported",
};

const invalidDateFilterArgument: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The command contains invalid date dataset",
};

const invalidDateFilterGranularity: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The command has invalid date filter granularity",
};

const invalidDateFilterFromToValue: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The command has date filter with invalid date range",
};

const invalidFilterDataFormat: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The command has invalid filter format",
};

const invalidFilterItemsCount: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The app cannot be applied more than 20 items on filter bar",
};

const invalidRemoveFilterItemsCount: ICommandFailedBody = {
    errorCode: GdcErrorType.RuntimeError,
    errorMessage: "There is no filter item on the filter bar to remove",
};

const notExistedDateDataset: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "There is no such date dataset on the filter bar",
};

const noDateDatasetInProject: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidState,
    errorMessage: "There is no date dataset in your project",
};

const differentDateDatasetInBucket: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "There is different date in bucket where you are using date filter",
};

const duplicatedAttributeUris: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The command has duplicated attribute uris",
};

const duplicatedAttributeIdentifiers: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The command has duplicated attribute identifiers",
};

const invalidStateSetFilterContext: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidState,
    errorMessage: "The app is not in a state to process setFilterContext command",
};

const invalidStateRemoveFilterContext: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidState,
    errorMessage: "The app is not in a state to process removeFilterContext command",
};

const removeNonExistentFilterError: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The command try to remove nonexistent filters",
};

const invalidRankingFilterMeasure: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The command has invalid ranking filter measure",
};

const invalidRankingFilterAttributes: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The command has invalid ranking filter attributes",
};

const duplicateRankingFilterAttributes: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The command has duplicate ranking filter attributes",
};

const filterModeMismatch: ICommandFailedBody = {
    errorCode: GdcErrorType.InvalidArgument,
    errorMessage: "The command contains a filter whose mode does not match the existing filter",
};

export const CONTROL_FILTERING_ERRORS = {
    invalidStateSetFilterContext,
    invalidStateRemoveFilterContext,
    invalidAttFilterDfUri,
    invalidAttFilterId,
    invalidAttFilterValue,
    invalidAttFilterArgument,
    computedAttributesDisabled,
    invalidDateDatasetUri,
    invalidDateDatasetId,
    invalidDateIdentifier,
    invalidDateFilterCountError,
    invalidDateFilterArgument,
    invalidDateFilterGranularity,
    invalidDateFilterFromToValue,
    invalidFilterDataFormat,
    invalidFilterItemsCount,
    invalidRemoveFilterItemsCount,
    notExistedDateDataset,
    duplicatedAttributeUris,
    duplicatedAttributeIdentifiers,
    removeNonExistentFilterError,
    noDateDatasetInProject,
    differentDateDatasetInBucket,
    hasNonDefaultAttributeDisplayFormError,
    invalidRankingFilterMeasure,
    invalidRankingFilterAttributes,
    duplicateRankingFilterAttributes,
    filterModeMismatch,
};
