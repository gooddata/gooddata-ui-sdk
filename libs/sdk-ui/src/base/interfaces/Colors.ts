// (C) 2019 GoodData Corporation

import { IHeaderPredicate } from "./HeaderPredicate";
import { IColor } from "@gooddata/sdk-model";
import { IMappingHeader } from "./MappingHeader";

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IColorMapping {
    // sent to SDK
    predicate: IHeaderPredicate;
    color: IColor;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IColorAssignment {
    // << send from SDK up
    headerItem: IMappingHeader;
    color: IColor;
}
