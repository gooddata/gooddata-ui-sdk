// (C) 2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { Action, EnhancedStore } from "@reduxjs/toolkit";
import { Task } from "redux-saga";
import { IAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilterState } from "./state";

/**
 * Fully configured and initialized attribute filter redux store
 * along with root redux-saga task and context in which was created.
 *
 * @internal
 */
export interface AttributeFilterStore {
    context: AttributeFilterStoreContext;
    store: EnhancedStore<AttributeFilterState>;
    rootSagaTask: Task;
}

/**
 * @internal
 */
export interface AttributeFilterStoreContext {
    backend: IAnalyticalBackend;
    workspace: string;
    attributeFilter: IAttributeFilter;
    eventListener: (action: Action, nextState: AttributeFilterState) => void;
}
