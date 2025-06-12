// (C) 2022-2025 GoodData Corporation
import { CaseReducer, AnyAction } from "@reduxjs/toolkit";
import { IAttributeElement, ObjRef, IAttributeMetadataObject, IAttributeFilter } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import { ILoadElementsOptions, AsyncOperationStatus } from "../../../types/index.js";

/**
 * @internal
 */
export interface AttributeFilterState {
    localIdentifier?: string;
    displayFormRef: ObjRef; // primary label used for execution
    displayAsLabelRef?: ObjRef; // optional secondary label used for display elements in filter component
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
        totalCountInitialization: {
            status: AsyncOperationStatus;
            error?: GoodDataSdkError;
        };
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
        cacheId?: string;
    };
    selection: {
        commited: {
            keys?: string[];
            isInverted?: boolean;
            irrelevantKeys?: string[];
        };
        working: {
            keys?: string[];
            isInverted?: boolean;
            irrelevantKeys?: string[];
        };
    };
    config: {
        hiddenElements?: string[];
        staticElements?: IAttributeElement[];
        withoutApply?: boolean;
    };
    originalFilter?: IAttributeFilter;
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
            limitingValidationItems: [],
        },
        initialPageLoad: {
            status: "pending",
        },
        nextPageLoad: {
            status: "pending",
        },
        limitingAttributeFiltersAttributes: [],
        lastLoadedOptions: {},
        totalCountInitialization: {
            status: "pending",
        },
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
