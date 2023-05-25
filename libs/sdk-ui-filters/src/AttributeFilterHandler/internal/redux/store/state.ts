// (C) 2022 GoodData Corporation
import { CaseReducer, AnyAction } from "@reduxjs/toolkit";
import { IAttributeElement, ObjRef, IAttributeMetadataObject } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import { ILoadElementsOptions, AsyncOperationStatus } from "../../../types/index.js";

/**
 * @internal
 */
export interface AttributeFilterState {
    displayFormRef: ObjRef;
    elementsForm: "uris" | "values";
    initialization: {
        status: AsyncOperationStatus;
        error?: GoodDataSdkError;
    };
    attribute: {
        data?: IAttributeMetadataObject;
        status: AsyncOperationStatus;
        error?: GoodDataSdkError;
    };
    elements: {
        data?: string[];
        totalCount?: number;
        totalCountWithCurrentSettings?: number;
        cache: Record<string, IAttributeElement>;
        initialPageLoad: {
            status: AsyncOperationStatus;
            error?: GoodDataSdkError;
        };
        nextPageLoad: {
            status: AsyncOperationStatus;
            error?: GoodDataSdkError;
        };
        lastLoadedOptions?: ILoadElementsOptions;
        currentOptions: ILoadElementsOptions;
        limitingAttributeFiltersAttributes: IAttributeMetadataObject[];
    };
    selection: {
        commited: {
            keys?: string[];
            isInverted?: boolean;
        };
        working: {
            keys?: string[];
            isInverted?: boolean;
        };
    };
    config: {
        hiddenElements?: string[];
        staticElements?: IAttributeElement[];
    };
}

/**
 * @internal
 */
export const initialState: Omit<AttributeFilterState, "displayFormRef" | "elementsForm"> = {
    initialization: {
        status: "pending",
    },
    attribute: {
        status: "pending",
    },
    elements: {
        cache: {},
        currentOptions: {
            offset: 0,
            limit: 500,
            search: "",
            limitingAttributeFilters: [],
            limitingDateFilters: [],
            limitingMeasures: [],
        },
        initialPageLoad: {
            status: "pending",
        },
        nextPageLoad: {
            status: "pending",
        },
        limitingAttributeFiltersAttributes: [],
        lastLoadedOptions: {},
    },
    config: {},
    selection: {
        commited: {},
        working: {},
    },
};

/**
 * @internal
 */
export type AttributeFilterReducer<A extends AnyAction = AnyAction> = CaseReducer<AttributeFilterState, A>;
