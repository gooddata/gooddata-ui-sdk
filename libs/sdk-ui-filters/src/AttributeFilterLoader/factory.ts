// (C) 2022 GoodData Corporation
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IAttributeFilter } from "@gooddata/sdk-model";
import { MultiSelectAttributeFilterHandler, SingleSelectAttributeFilterHandler } from "./impl";

import {
    IAttributeFilterHandler,
    IMultiSelectAttributeFilterHandler,
    ISingleSelectAttributeFilterHandler,
} from "./types";

/**
 * Common options for initialization of the {@link IAttributeFilterHandler}.
 *
 * @alpha
 */
export interface IAttributeFilterHandlerOptionsBase {
    /**
     * If specified, these will be excluded from the elements available for selection and will also be removed from the resulting filter.
     * This effectively behaves as if those elements were not part of the underlying display form.
     *
     * @remarks
     * The meaning of the items is determined by the way the filter is specified: if the filter uses URIs,
     * then these are also interpreted as URIs, analogously with values.
     */
    hiddenElements?: string[];
}

/**
 * Options for initialization of the {@link IAttributeFilterHandler} with single selection.
 *
 * @alpha
 */
export interface ISingleSelectAttributeFilterHandlerOptions extends IAttributeFilterHandlerOptionsBase {
    selectionMode: "single";
}

/**
 * Options for initialization of the {@link IAttributeFilterHandler} with multi selection.
 *
 * @alpha
 */
export interface IMultiSelectAttributeFilterHandlerOptions extends IAttributeFilterHandlerOptionsBase {
    selectionMode: "multi";
}

/**
 * Options for initialization of the {@link IAttributeFilterHandler}.
 *
 * @alpha
 */
export type IAttributeFilterHandlerOptions =
    | ISingleSelectAttributeFilterHandlerOptions
    | IMultiSelectAttributeFilterHandlerOptions;

/**
 * @alpha
 */
export function newAttributeFilterHandler(
    backend: IAnalyticalBackend,
    workspace: string,
    filter: IAttributeFilter,
    options: ISingleSelectAttributeFilterHandlerOptions,
): ISingleSelectAttributeFilterHandler;
/**
 * @alpha
 */
export function newAttributeFilterHandler(
    backend: IAnalyticalBackend,
    workspace: string,
    filter: IAttributeFilter,
    options: IMultiSelectAttributeFilterHandlerOptions,
): IMultiSelectAttributeFilterHandler;
/**
 * @alpha
 */
export function newAttributeFilterHandler(
    backend: IAnalyticalBackend,
    workspace: string,
    filter: IAttributeFilter,
    options: IAttributeFilterHandlerOptions = { selectionMode: "multi" },
): IAttributeFilterHandler {
    const { selectionMode, hiddenElements } = options;

    if (selectionMode === "multi") {
        return new MultiSelectAttributeFilterHandler({ backend, workspace, filter, hiddenElements });
    }

    return new SingleSelectAttributeFilterHandler({ backend, workspace, filter, hiddenElements });
}
