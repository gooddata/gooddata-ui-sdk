// (C) 2022 GoodData Corporation
import {
    IMultiSelectAttributeFilterHandler,
    AsyncOperationStatus,
} from "../../AttributeFilterHandler/index.js";
import { IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import {
    IAttributeDisplayFormMetadataObject,
    IAttributeElement,
    IAttributeFilter,
    IAttributeMetadataObject,
    IMeasure,
    IRelativeDateFilter,
    SortDirection,
} from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

/**
 * @internal
 */
export interface IUseAttributeFilterHandlerStateResult {
    attributeFilter: IAttributeFilter;
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
            limitingDateFilters?: IRelativeDateFilter[];
        };
    };
    selection: {
        committed: {
            elements?: IAttributeElement[];
            keys?: string[];
            isInverted?: boolean;
        };
        working: {
            elements?: IAttributeElement[];
            keys?: string[];
            isInverted?: boolean;
            isChanged?: boolean;
            isEmpty?: boolean;
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
                order: handler.getOrder(),
            },
        },
        selection: {
            committed: {
                elements: initStatus === "success" ? handler.getElementsByKey(committedSelection.keys) : [],
                keys: committedSelection.keys,
                isInverted: committedSelection.isInverted,
            },
            working: {
                elements: initStatus === "success" ? handler.getElementsByKey(workingSelection.keys) : [],
                keys: workingSelection.keys,
                isInverted: workingSelection.isInverted,
                isChanged: handler.isWorkingSelectionChanged(),
                isEmpty: handler.isWorkingSelectionEmpty(),
            },
        },
    };
};
