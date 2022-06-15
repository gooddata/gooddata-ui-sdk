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

const init: AttributeFilterReducer<
    PayloadAction<{ attributeFilter: IAttributeFilter; hiddenElements?: string[] }>
> = (state, action) => {
    state.displayForm = filterObjRef(action.payload.attributeFilter);
    const elements = filterAttributeElements(action.payload.attributeFilter);
    state.elementsForm = isAttributeElementsByValue(elements) ? "values" : "uris";
    const elementKeys = isAttributeElementsByValue(elements) ? elements.values : elements.uris;
    state.commitedSelection = elementKeys;
    state.workingSelection = elementKeys;
    const isInverted = isNegativeAttributeFilter(action.payload.attributeFilter);
    state.isCommitedSelectionInverted = isInverted;
    state.isWorkingSelectionInverted = isInverted;
    state.hiddenElements = action.payload.hiddenElements;
};

const initSuccess: AttributeFilterReducer = identity;
const initError: AttributeFilterReducer<PayloadAction<{ error: any }>> = identity;
const initCancel: AttributeFilterReducer = identity;

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

const setLimitingAttributeFilters: AttributeFilterReducer<
    PayloadAction<{ filters: IElementsQueryAttributeFilter[] }>
> = (state, action) => {
    state.limitingAttributeFilters = action.payload.filters;
};

const setLimitingMeasures: AttributeFilterReducer<PayloadAction<{ filters: IMeasure[] }>> = (
    state,
    action,
) => {
    state.limitingMeasures = action.payload.filters;
};

const setLimitingDateFilters: AttributeFilterReducer<PayloadAction<{ filters: IRelativeDateFilter[] }>> = (
    state,
    action,
) => {
    state.limitingDateFilters = action.payload.filters;
};

const setHiddenElements: AttributeFilterReducer<PayloadAction<{ hiddenElements: string[] | undefined }>> = (
    state,
    action,
) => {
    state.hiddenElements = action.payload.hiddenElements;
};

const loadElementsRangeRequest: AttributeFilterReducer<
    PayloadAction<{
        options: Omit<ILoadAttributeElementsOptions, "displayFormRef">;
        correlationId?: string;
    }>
> = identity;

const loadElementsRangeSuccess: AttributeFilterReducer<
    PayloadAction<{
        attributeElements: IAttributeElement[];
        totalCount: number;
        correlationId?: string;
        limit: number;
        offset: number;
    }>
> = identity;

const loadElementsRangeError: AttributeFilterReducer<PayloadAction<{ error: any; correlationId: string }>> =
    identity;

const loadElementsRangeCancelRequest: AttributeFilterReducer<PayloadAction<{ correlationId: string }>> =
    identity;

const loadElementsRangeCancel: AttributeFilterReducer<PayloadAction<{ correlationId: string }>> = identity;

/**
 * @internal
 */
export const mainReducers = {
    init,
    initSuccess,
    initError,
    initCancel,
    //
    setDisplayForm,
    setElementsForm,
    setSearch,
    setLimitingAttributeFilters,
    setLimitingMeasures,
    setLimitingDateFilters,
    setHiddenElements,
    //
    loadElementsRangeRequest,
    loadElementsRangeSuccess,
    loadElementsRangeError,
    loadElementsRangeCancelRequest,
    loadElementsRangeCancel,
    //
    reset,
};
