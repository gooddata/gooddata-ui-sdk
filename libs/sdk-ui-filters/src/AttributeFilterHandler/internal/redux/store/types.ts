// (C) 2022-2026 GoodData Corporation

import { type Action, type AnyAction } from "@reduxjs/toolkit";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IAttributeElement, type IAttributeFilter, type ObjRef } from "@gooddata/sdk-model";

import { type IAttributeFilterState } from "./state.js";

/**
 * Event listener that can be used to listen dispatched AttributeFilterHandlerStore actions.
 *
 * @internal
 */
export type AttributeFilterHandlerEventListener = (
    action: Action,
    selectFromNextState: <T>(selector: (state: IAttributeFilterState) => T) => T,
) => void;

/**
 * Fully configured and initialized attribute filter handler redux store
 * along with root redux-saga task and context in which was created.
 *
 * @internal
 */
export interface IAttributeFilterHandlerStore {
    context: IAttributeFilterHandlerStoreContext;
    cancelRootSaga: () => void;
    dispatch: (action: AnyAction) => void;
    select: <T>(selector: (state: IAttributeFilterState) => T) => T;
}

/**
 * Context in which the attribute filter handler store was created.
 *
 * @internal
 */
export interface IAttributeFilterHandlerStoreContext {
    backend: IAnalyticalBackend;
    workspace: string;
    attributeFilter: IAttributeFilter;
    displayAsLabel?: ObjRef;
    hiddenElements?: string[];
    staticElements?: IAttributeElement[];
    eventListener: AttributeFilterHandlerEventListener;
    withoutApply?: boolean;
}
