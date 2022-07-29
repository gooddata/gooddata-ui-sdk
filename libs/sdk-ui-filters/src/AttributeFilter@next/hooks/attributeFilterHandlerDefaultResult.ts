// (C) 2022 GoodData Corporation
import { IAttributeFilterHandlerResult, IAttributeHandlerCallbacks, IAttributeHandlerState } from "./types";
import { throwMissingCallbackError } from "../utils/MissingComponent";

export const DefaultState: IAttributeHandlerState = {
    initialization: {
        status: "pending",
    },
    attribute: {
        status: "pending",
    },
    elements: {
        initialPageLoad: {
            status: "pending",
        },
        nextPageLoad: {
            status: "pending",
        },
    },
    selection: {
        committed: {
            elements: [],
            keys: [],
            isInverted: false,
        },
        working: {
            elements: [],
            keys: [],
            isInverted: false,
            isChanged: false,
            isEmpty: false,
        },
    },
};

export const DefaultCallbacks: IAttributeHandlerCallbacks = {
    getCurrentFilter: throwMissingCallbackError("getCurrentFilter", "AttributeFilterContext"),
    isCurrentFilterInverted: throwMissingCallbackError("isCurrentFilterInverted", "AttributeFilterContext"),
    commitSelection: throwMissingCallbackError("commitSelection", "AttributeFilterContext"),
    changeSelection: throwMissingCallbackError("changeSelection", "AttributeFilterContext"),
    onSearch: throwMissingCallbackError("onSearch", "AttributeFilterContext"),
    onReset: throwMissingCallbackError("onReset", "AttributeFilterContext"),
    onNextPageRequest: throwMissingCallbackError("onNextPageRequest", "AttributeFilterContext"),
    isWorkingSelectionEmpty: throwMissingCallbackError("isWorkingSelectionEmpty", "AttributeFilterContext"),
    isWorkingSelectionChanged: throwMissingCallbackError(
        "isWorkingSelectionChanged",
        "AttributeFilterContext",
    ),
};

export const DefaultResult: IAttributeFilterHandlerResult = {
    ...DefaultState,
    ...DefaultCallbacks,
};
