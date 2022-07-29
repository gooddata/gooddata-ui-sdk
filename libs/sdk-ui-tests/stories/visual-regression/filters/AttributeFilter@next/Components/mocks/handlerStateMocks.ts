// (C) 2022 GoodData Corporation
import { DefaultState } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/hooks/attributeFilterHandlerDefaultResult";
import { IAttributeHandlerState } from "@gooddata/sdk-ui-filters/dist/AttributeFilter@next/hooks/types";

export const stateWithEmptySelection: IAttributeHandlerState = {
    ...DefaultState,
    initialization: {
        status: "success",
    },
    elements: {
        initialPageLoad: {
            status: "success",
        },
        data: [
            { title: "item 1", uri: "uri1" },
            { title: "item 2", uri: "uri2" },
        ],
        nextPageLoad: {
            status: "pending",
        },
        currentOptions: {
            offset: 0,
            limit: 20,
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

export const stateWithSelectionAndSearch: IAttributeHandlerState = {
    ...DefaultState,
    initialization: {
        status: "success",
    },
    elements: {
        initialPageLoad: {
            status: "success",
        },
        data: [
            { title: "item 1", uri: "uri1" },
            { title: "item 2", uri: "uri2" },
        ],
        nextPageLoad: {
            status: "pending",
        },
        currentOptions: {
            offset: 0,
            limit: 20,
            search: "bla",
        },
    },
    selection: {
        committed: {
            elements: [],
            keys: [],
            isInverted: false,
        },
        working: {
            elements: [{ title: "item 1", uri: "uri1" }],
            keys: ["uri1"],
            isInverted: false,
            isChanged: false,
            isEmpty: false,
        },
    },
};
