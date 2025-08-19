// (C) 2022-2025 GoodData Corporation
import { IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import {
    IAbsoluteDateFilter,
    IAttributeDisplayFormMetadataObject,
    IAttributeElement,
    IAttributeFilter,
    IAttributeMetadataObject,
    IMeasure,
    IRelativeDateFilter,
    ObjRef,
    SortDirection,
} from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import {
    AsyncOperationStatus,
    IMultiSelectAttributeFilterHandler,
} from "../../AttributeFilterHandler/index.js";

/**
 * @internal
 */
export interface IUseAttributeFilterHandlerStateResult {
    attributeFilter: IAttributeFilter;
    attributeFilterToDisplay?: IAttributeFilter;
    displayForm?: IAttributeDisplayFormMetadataObject;
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
        data?: IAttributeElement[];
        totalCount?: number;
        totalCountWithCurrentSettings?: number;
        initialPageLoad: {
            status: AsyncOperationStatus;
            error?: GoodDataSdkError;
        };
        nextPageLoad: {
            status: AsyncOperationStatus;
            error?: GoodDataSdkError;
        };
        options?: {
            offset: number;
            limit: number;
            order?: SortDirection;
            search?: string;
            limitingAttributeFilters?: IElementsQueryAttributeFilter[];
            limitingMeasures?: IMeasure[];
            limitingDateFilters?: (IRelativeDateFilter | IAbsoluteDateFilter)[];
            limitingValidationItems?: ObjRef[];
        };
    };
    selection: {
        committed: {
            elements?: IAttributeElement[];
            keys?: string[];
            isInverted?: boolean;
            irrelevantElements?: IAttributeElement[];
        };
        working: {
            elements?: IAttributeElement[];
            keys?: string[];
            isInverted?: boolean;
            isChanged?: boolean;
            isEmpty?: boolean;
            irrelevantElements?: IAttributeElement[];
        };
    };
    config?: {
        hiddenElements?: string[];
        staticElements?: IAttributeElement[];
    };
}

/**
 * @internal
 */
export const useAttributeFilterHandlerState = (
    handler: IMultiSelectAttributeFilterHandler,
): IUseAttributeFilterHandlerStateResult => {
    const workingSelection = handler.getWorkingSelection();
    const committedSelection = handler.getCommittedSelection();
    const initStatus = handler.getInitStatus();

    return {
        attributeFilter: handler.getFilter(),
        attributeFilterToDisplay: handler.getFilterToDisplay(),
        initialization: {
            status: handler.getInitStatus(),
            error: handler.getInitError(),
        },
        attribute: {
            data: handler.getAttribute(),
            status: handler.getAttributeStatus(),
            error: handler.getAttributeError(),
        },
        elements: {
            data: handler.getAllElements(),
            totalCount: handler.getTotalElementsCount(),
            totalCountWithCurrentSettings: handler.getTotalElementsCountWithCurrentSettings(),
            initialPageLoad: {
                status: handler.getInitialElementsPageStatus(),
                error: handler.getInitialElementsPageError(),
            },
            nextPageLoad: {
                status: handler.getNextElementsPageStatus(),
                error: handler.getNextElementsPageError(),
            },
            options: {
                search: handler.getSearch(),
                offset: handler.getOffset(),
                limit: handler.getLimit(),
                limitingAttributeFilters: handler.getLimitingAttributeFilters(),
                limitingDateFilters: handler.getLimitingDateFilters(),
                limitingMeasures: handler.getLimitingMeasures(),
                limitingValidationItems: handler.getLimitingValidationItems(),
                order: handler.getOrder(),
            },
        },
        selection: {
            committed: {
                elements: initStatus === "success" ? handler.getElementsByKey(committedSelection.keys) : [],
                keys: committedSelection.keys,
                isInverted: committedSelection.isInverted,
                irrelevantElements:
                    initStatus === "success"
                        ? handler.getElementsByKey(committedSelection.irrelevantKeys)
                        : [],
            },
            working: {
                elements: initStatus === "success" ? handler.getElementsByKey(workingSelection.keys) : [],
                keys: workingSelection.keys,
                isInverted: workingSelection.isInverted,
                isChanged: handler.isWorkingSelectionChanged(),
                isEmpty: handler.isWorkingSelectionEmpty(),
                irrelevantElements:
                    initStatus === "success" ? handler.getElementsByKey(workingSelection.irrelevantKeys) : [],
            },
        },
    };
};
