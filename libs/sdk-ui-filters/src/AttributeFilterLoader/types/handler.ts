// (C) 2022 GoodData Corporation
import { IAttributeElement } from "@gooddata/sdk-model";
import { IAttributeFilterLoader } from "./loader";
import {
    InvertableSelection,
    IStagedInvertableSelectionHandler,
    IStagedSingleSelectionHandler,
} from "./selection";

//
// Multi select attribute filter handler
//

/**
 * @alpha
 */
export type InvertableAttributeElementSelection = InvertableSelection<IAttributeElement>;

/**
 * Handles the whole attribute filter experience
 * @alpha
 */
export interface IMultiSelectAttributeFilterHandler
    extends IAttributeFilterLoader,
        IStagedInvertableSelectionHandler<InvertableAttributeElementSelection> {
    //
    // selectors
    //
}

//
// Single select attribute filter handler
//

/**
 * Handles the whole single-select attribute filter experience.
 *
 * @alpha
 */
export interface ISingleSelectAttributeFilterHandler
    extends IAttributeFilterLoader,
        IStagedSingleSelectionHandler<IAttributeElement | undefined> {
    //
    // selectors
    //
}

/**
 * Handles the whole attribute filter experience
 * @alpha
 */
export type IAttributeFilterHandler =
    | IMultiSelectAttributeFilterHandler
    | ISingleSelectAttributeFilterHandler;
