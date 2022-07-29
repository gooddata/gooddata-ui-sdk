// (C) 2021-2022 GoodData Corporation

import { IAnalyticalBackend, IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
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
import { AsyncOperationStatus, InvertableAttributeElementSelection } from "../../AttributeFilterHandler";

export interface AttributeFilterHandlerProps {
    backend: IAnalyticalBackend;
    workspace: string;
    filter: IAttributeFilter;
    limitingAttributeFilters?: IElementsQueryAttributeFilter[];
}

export interface IAttributeHandlerState {
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
        currentOptions?: {
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

export interface IAttributeHandlerCallbacks {
    getCurrentFilter: () => IAttributeFilter;
    isCurrentFilterInverted: () => boolean;
    commitSelection: () => void;
    changeSelection: (selection: InvertableAttributeElementSelection) => void;
    onSearch: (search: string) => void;
    onReset: () => void;
    onNextPageRequest: () => void;
    isWorkingSelectionEmpty: () => boolean;
    isWorkingSelectionChanged: () => boolean;
}

export type IAttributeFilterHandlerResult = IAttributeHandlerCallbacks & IAttributeHandlerState;
