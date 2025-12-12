// (C) 2022-2025 GoodData Corporation

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IAttributeElement, type IAttributeFilter, type ObjRef } from "@gooddata/sdk-model";

import { MultiSelectAttributeFilterHandler, SingleSelectAttributeFilterHandler } from "./internal/index.js";
import {
    type IAttributeFilterHandler,
    type IMultiSelectAttributeFilterHandler,
    type ISingleSelectAttributeFilterHandler,
} from "./types/index.js";

/**
 * Common options for initialization of the {@link IAttributeFilterHandler}.
 *
 * @public
 */
export interface IAttributeFilterHandlerOptionsBase {
    /**
     * If specified, these will be excluded from the elements available for selection and will also be removed from the resulting filter.
     * This effectively behaves as if those elements were not part of the underlying display form.
     *
     * @remarks
     * The meaning of the items is determined by the way the filter is specified: if the filter uses URIs,
     * then these are also interpreted as URIs, analogously with values.
     *
     * If using hiddenElements, make sure your input filter excludes the hidden elements, otherwise it could lead to
     * non-intuitive behavior.
     * So, for positive filters, make sure their elements do NOT contain any of the `hiddenElements`.
     * Inversely for negative filters, make sure their elements do contain all of the `hiddenElements`.
     *
     * @example
     * This is how to correctly create a filter that has some items hidden but is set to All:
     *
     * ```tsx
     * const hiddenUris: ["uri1", "uri2"];
     * // make sure to use the uris both in the filter...
     * const filter = newNegativeAttributeFilter("displayForm", { uris: hiddenUris });
     * // ...and also in the config
     * const handler = newAttributeFilterHandler(backend, workspace, filter, { hiddenElements: hiddenUris });
     * ```
     */
    hiddenElements?: string[];

    /**
     * If specified, these elements will replace the elements that would be loaded from the server.
     * Note that if using this, limiting measures and/or filters will not work: it is your responsibility to filter
     * the static elements yourself.
     */
    staticElements?: IAttributeElement[];

    /**
     * If specified, the attribute filter will display the elements in specified label form.
     */
    displayAsLabel?: ObjRef;

    /**
     * if true, the attribute filter will not display the apply button
     * Several other behaviours are also affected by this option like dependent filters
     */
    withoutApply?: boolean;

    /**
     * If true, preserves existing filter selection during initialization. Prevents overriding by default selection.
     *
     * @internal
     */
    enablePreserveSelectionDuringInit?: boolean;
}

/**
 * Options for initialization of the {@link IAttributeFilterHandler} with single selection.
 *
 * @public
 */
export interface ISingleSelectAttributeFilterHandlerOptions extends IAttributeFilterHandlerOptionsBase {
    selectionMode: "single";
}

/**
 * Options for initialization of the {@link IAttributeFilterHandler} with multi selection.
 *
 * @public
 */
export interface IMultiSelectAttributeFilterHandlerOptions extends IAttributeFilterHandlerOptionsBase {
    selectionMode: "multi";
}

/**
 * Options for initialization of the {@link IAttributeFilterHandler}.
 *
 * @public
 */
export type IAttributeFilterHandlerOptions =
    | ISingleSelectAttributeFilterHandlerOptions
    | IMultiSelectAttributeFilterHandlerOptions;

/**
 * @public
 */
export function newAttributeFilterHandler(
    backend: IAnalyticalBackend,
    workspace: string,
    attributeFilter: IAttributeFilter,
    options: ISingleSelectAttributeFilterHandlerOptions,
): ISingleSelectAttributeFilterHandler;
/**
 * @public
 */
export function newAttributeFilterHandler(
    backend: IAnalyticalBackend,
    workspace: string,
    attributeFilter: IAttributeFilter,
    options: IMultiSelectAttributeFilterHandlerOptions,
): IMultiSelectAttributeFilterHandler;
/**
 * @public
 */
export function newAttributeFilterHandler(
    backend: IAnalyticalBackend,
    workspace: string,
    attributeFilter: IAttributeFilter,
    options: IAttributeFilterHandlerOptions = {
        selectionMode: "multi",
        displayAsLabel: undefined,
        withoutApply: false,
    },
): IAttributeFilterHandler {
    const {
        selectionMode,
        hiddenElements,
        staticElements,
        displayAsLabel,
        withoutApply,
        enablePreserveSelectionDuringInit,
    } = options;

    if (selectionMode === "multi") {
        return new MultiSelectAttributeFilterHandler({
            backend,
            workspace,
            attributeFilter,
            hiddenElements,
            staticElements,
            displayAsLabel,
            withoutApply,
            enablePreserveSelectionDuringInit,
        });
    }

    return new SingleSelectAttributeFilterHandler({
        backend,
        workspace,
        attributeFilter,
        hiddenElements,
        staticElements,
        displayAsLabel,
        withoutApply,
        enablePreserveSelectionDuringInit,
    });
}
