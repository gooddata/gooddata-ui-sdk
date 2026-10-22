// (C) 2022-2026 GoodData Corporation

import { type AnyAction, type CaseReducer } from "@reduxjs/toolkit";

import {
    type IAttributeElement,
    type IAttributeFilter,
    type IAttributeMetadataObject,
    type ISeparators,
    type ObjRef,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { type AsyncOperationStatus, type AttributeElementKey } from "../../../types/common.js";
import { type ILoadElementsOptions } from "../../../types/elementsLoader.js";

/**
 * @internal
 */
export interface IAttributeFilterState {
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
        data?: AttributeElementKey[];
        totalCount?: number;
        totalCountInitialization: {
            status: AsyncOperationStatus;
            error?: GoodDataSdkError;
        };
        totalCountWithCurrentSettings?: number;
        cache: Record<string, IAttributeElement>;
        /**
         * Number format of the loaded element values (numeric computed attributes); the element titles
         * are formatted with it and the separators when read from the cache.
         */
        numberFormat?: string;
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
            keys?: AttributeElementKey[];
            isInverted?: boolean;
            irrelevantKeys?: AttributeElementKey[];
        };
        working: {
            keys?: AttributeElementKey[];
            isInverted?: boolean;
            irrelevantKeys?: AttributeElementKey[];
        };
    };
    config: {
        hiddenElements?: string[];
        staticElements?: IAttributeElement[];
        withoutApply?: boolean;
        /**
         * Number separators used when formatting element values of numeric computed attributes.
         */
        separators?: ISeparators;
    };
    originalFilter?: IAttributeFilter;
}

/**
 * @internal
 */
export const initialState: Omit<IAttributeFilterState, "displayFormRef" | "elementsForm"> = {
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
export type AttributeFilterReducer<A extends AnyAction = AnyAction> = CaseReducer<IAttributeFilterState, A>;
