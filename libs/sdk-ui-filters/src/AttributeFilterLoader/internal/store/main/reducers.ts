// (C) 2021-2022 GoodData Corporation
import identity from "lodash/identity";
import { PayloadAction } from "@reduxjs/toolkit";
import { IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import { AttributeFilterReducer } from "../state";
import {
    filterObjRef,
    IMeasure,
    IRelativeDateFilter,
    IAttributeFilter,
    ObjRef,
    isAttributeElementsByValue,
    filterAttributeElements,
    isNegativeAttributeFilter,
    IAttributeElement,
} from "@gooddata/sdk-model";
import { ILoadAttributeElementsOptions } from "../attributeElements/effects";

const init: AttributeFilterReducer<PayloadAction<{ attributeFilter: IAttributeFilter }>> = (
    state,
    action,
) => {
    state.displayForm = filterObjRef(action.payload.attributeFilter);
    const elements = filterAttributeElements(action.payload.attributeFilter);
    state.elementsForm = isAttributeElementsByValue(elements) ? "values" : "uris";
    const elementKeys = isAttributeElementsByValue(elements) ? elements.values : elements.uris;
    state.commitedSelection = elementKeys;
    state.workingSelection = elementKeys;
    const isInverted = isNegativeAttributeFilter(action.payload.attributeFilter);
    state.isCommitedSelectionInverted = isInverted;
    state.isWorkingSelectionInverted = isInverted;
};
const reset: AttributeFilterReducer = identity;

const setDisplayForm: AttributeFilterReducer<PayloadAction<{ search: string }>> = (state, action) => {
    state.search = action.payload.search;
};

const setElementsForm: AttributeFilterReducer<PayloadAction<{ displayForm: ObjRef }>> = (state, action) => {
    state.displayForm = action.payload.displayForm;
};

const setSearch: AttributeFilterReducer<PayloadAction<{ search: string }>> = (state, action) => {
    state.search = action.payload.search;
};

const setAttributeFilters: AttributeFilterReducer<
    PayloadAction<{ filters: IElementsQueryAttributeFilter[] }>
> = (state, action) => {
    state.attributeFilters = action.payload.filters;
};

const setMeasureFilters: AttributeFilterReducer<PayloadAction<{ filters: IMeasure[] }>> = (state, action) => {
    state.measureFilters = action.payload.filters;
};

const setDateFilters: AttributeFilterReducer<PayloadAction<{ filters: IRelativeDateFilter[] }>> = (
    state,
    action,
) => {
    state.dateFilter = action.payload.filters;
};

const loadElementsRangeRequest: AttributeFilterReducer<
    PayloadAction<
        Omit<ILoadAttributeElementsOptions, "displayFormRef"> & {
            correlationId: string;
        }
    >
> = identity;

const loadElementsRangeSuccess: AttributeFilterReducer<
    PayloadAction<{
        attributeElements: IAttributeElement[];
        totalCount: number;
        correlationId: string;
    }>
> = identity;

const loadElementsRangeError: AttributeFilterReducer<PayloadAction<{ error: any; correlationId: string }>> =
    identity;

const loadElementsRangeCancelRequest: AttributeFilterReducer = identity;

const loadElementsRangeCancel: AttributeFilterReducer<PayloadAction<{ correlationId: string }>> = identity;

/**
 * @internal
 */
export const mainReducers = {
    init,
    reset,
    setDisplayForm,
    setElementsForm,
    setSearch,
    setAttributeFilters,
    setMeasureFilters,
    setDateFilters,
    //
    loadElementsRangeRequest,
    loadElementsRangeSuccess,
    loadElementsRangeError,
    loadElementsRangeCancelRequest,
    loadElementsRangeCancel,
};
