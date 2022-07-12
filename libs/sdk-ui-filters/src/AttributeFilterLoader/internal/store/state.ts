// (C) 2022 GoodData Corporation
import { CaseReducer, AnyAction } from "@reduxjs/toolkit";
import { IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import {
    IAttributeElement,
    ObjRef,
    IAttributeMetadataObject,
    IMeasure,
    IRelativeDateFilter,
} from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface AttributeFilterState {
    displayForm?: ObjRef;
    elementsForm?: "uris" | "values";

    // Selection
    commitedSelection?: string[];
    isCommitedSelectionInverted?: boolean;
    workingSelection?: string[];
    isWorkingSelectionInverted?: boolean;

    // Loaded attribute of the display form
    attribute?: IAttributeMetadataObject;

    // Loaded attribute elements cache
    attributeElementsMap?: Record<string, IAttributeElement>;

    // Loaded attribute elements
    attributeElements?: string[];
    attributeElementsTotalCount?: number;
    attributeElementsTotalCountWithCurrentSettings?: number;

    // Load attribute elements options
    search?: string;
    limitingAttributeFilters?: IElementsQueryAttributeFilter[];
    limitingMeasures?: IMeasure[];
    limitingDateFilters?: IRelativeDateFilter[];
    hiddenElements?: string[];
    staticElements?: IAttributeElement[];
}

/**
 * @internal
 */
export const initialState: AttributeFilterState = {};

/**
 * @internal
 */
export type AttributeFilterReducer<A extends AnyAction = AnyAction> = CaseReducer<AttributeFilterState, A>;
