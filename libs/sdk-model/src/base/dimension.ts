// (C) 2019 GoodData Corporation

import { Identifier } from "./index";
import { ITotal } from "./totals";

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IDimension {
    itemIdentifiers: Identifier[];
    totals?: ITotal[];
}
