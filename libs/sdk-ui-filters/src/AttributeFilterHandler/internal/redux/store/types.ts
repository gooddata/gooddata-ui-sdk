// (C) 2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { Action, AnyAction } from "@reduxjs/toolkit";
import { IAttributeElement, IAttributeFilter, IAttributeMetadataObject } from "@gooddata/sdk-model";
import { AttributeFilterState } from "./state.js";

/**
 * Event listener that can be used to listen dispatched AttributeFilterHandlerStore actions.
 *
 * @internal
 */
export type AttributeFilterHandlerEventListener = (
    action: Action,
    selectFromNextState: <T>(selector: (state: AttributeFilterState) => T) => T,
) => void;

/**
 * Fully configured and initialized attribute filter handler redux store
 * along with root redux-saga task and context in which was created.
 *
 * @internal
 */
export interface AttributeFilterHandlerStore {
    context: AttributeFilterHandlerStoreContext;
    cancelRootSaga: () => void;
    dispatch: (action: AnyAction) => void;
    select: <T>(selector: (state: AttributeFilterState) => T) => T;
}

/**
 * Context in which the attribute filter handler store was created.
 *
 * @internal
 */
export interface AttributeFilterHandlerStoreContext {
    backend: IAnalyticalBackend;
    workspace: string;
    attributeFilter: IAttributeFilter;
    hiddenElements?: string[];
    staticElements?: IAttributeElement[];
    eventListener: AttributeFilterHandlerEventListener;
    attribute?: IAttributeMetadataObject;
}
