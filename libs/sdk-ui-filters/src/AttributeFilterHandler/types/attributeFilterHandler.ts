// (C) 2022 GoodData Corporation
import { IAttributeFilterLoader } from "./attributeFilterLoader.js";
import { AttributeElementKey } from "./common.js";
import {
    InvertableSelection,
    IStagedInvertableSelectionHandler,
    IStagedSingleSelectionHandler,
} from "./selectionHandler.js";

/**
 * Invertable selection with list of the unique attribute elements keys.
 *
 * @public
 */
export type InvertableAttributeElementSelection = InvertableSelection<AttributeElementKey>;

/**
 * Core API for attribute filter components, that allows you to implement custom attribute filter components.
 *
 * @remarks
 * It has the following capabilities:
 *
 * - Load all the required metadata during the intitialization
 *
 * - Attribute elements paging and filtering
 *
 * - Loading of the additional attribute elements
 *
 * - Invertable multi selection handling with working and committed stage
 *
 * - Support for static attribute elements (if you don't want to load them from the backend)
 *
 * - Support for hiding particular attribute elements
 *
 * @public
 */
export interface IMultiSelectAttributeFilterHandler
    extends IAttributeFilterLoader,
        IStagedInvertableSelectionHandler<InvertableAttributeElementSelection> {}

/**
 * Core API for attribute filter components, that allows you to implement custom attribute filter components.
 *
 * @remarks
 * It has the following capabilities:
 *
 * - Load all the required metadata during the intitialization
 *
 * - Attribute elements paging and filtering
 *
 * - Loading of the additional attribute elements
 *
 * - Single selection handling with working and committed stage
 *
 * - Support for static attribute elements (if you don't want to load them from the backend)
 *
 * - Support for hiding particular attribute elements
 *
 * @public
 */
export interface ISingleSelectAttributeFilterHandler
    extends IAttributeFilterLoader,
        IStagedSingleSelectionHandler<AttributeElementKey | undefined> {}

/**
 * Core API for attribute filter components, that allows you to implement custom attribute filter components.
 *
 * @remarks
 * It has the following capabilities:
 *
 * - Load all the required metadata during the intitialization
 *
 * - Attribute elements paging and filtering
 *
 * - Loading of the additional attribute elements
 *
 * - Single selection handling with working and committed stage
 *
 * - Support for static attribute elements (if you don't want to load them from the backend)
 *
 * - Support for hiding particular attribute elements
 *
 * @public
 */
export type IAttributeFilterHandler =
    | IMultiSelectAttributeFilterHandler
    | ISingleSelectAttributeFilterHandler;
