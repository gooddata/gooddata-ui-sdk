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
 * Options for initialization of the {@link IAttributeFilterHandler}
 *
 * @alpha
 */
export interface IAttributeFilterHandlerOptions {
    selectionMode?: "single" | "multi";
}

/**
 * @alpha
 */
export function newAttributeFilterHandler(
    backend: IAnalyticalBackend,
    workspace: string,
    filter: IAttributeFilter,
    options: {
        selectionMode: "single";
    },
): ISingleSelectAttributeFilterHandler;
/**
 * @alpha
 */
export function newAttributeFilterHandler(
    backend: IAnalyticalBackend,
    workspace: string,
    filter: IAttributeFilter,
    options: {
        selectionMode: "multi";
    },
): IMultiSelectAttributeFilterHandler;
/**
 * @alpha
 */
export function newAttributeFilterHandler(
    backend: IAnalyticalBackend,
    workspace: string,
    filter: IAttributeFilter,
    options: IAttributeFilterHandlerOptions = {},
): IAttributeFilterHandler {
    const { selectionMode = "muilti" } = options;

    if (selectionMode === "multi") {
        return new MultiSelectAttributeFilterHandler({ backend, workspace, filter });
    }

    return new SingleSelectAttributeFilterHandler({ backend, workspace, filter });
}
