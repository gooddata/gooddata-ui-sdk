// (C) 2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { Action, AnyAction } from "@reduxjs/toolkit";
import { IAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilterState } from "./state";

/**
 * @internal
 */
export type AttributeFilterEventListener = (
    action: Action,
    selectFromNextState: <T>(selector: (state: AttributeFilterState) => T) => T,
) => void;

/**
 * Fully configured and initialized attribute filter redux store
 * along with root redux-saga task and context in which was created.
 *
 * @internal
 */
export interface AttributeFilterStore {
    context: AttributeFilterStoreContext;
    cancelRootSaga: () => void;
    dispatch: (action: AnyAction) => void;
    select: <T>(selector: (state: AttributeFilterState) => T) => T;
}

/**
 * @internal
 */
export interface AttributeFilterStoreContext {
    backend: IAnalyticalBackend;
    workspace: string;
    attributeFilter: IAttributeFilter;
    eventListener: AttributeFilterEventListener;
}
