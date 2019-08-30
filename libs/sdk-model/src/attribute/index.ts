// (C) 2019 GoodData Corporation
import { Identifier, ObjQualifier } from "../base";

/**
 * TODO: SDK8: Add docs
 *
 * @public
 */
export interface IAttribute {
    attribute: {
        localIdentifier: Identifier;
        displayForm: ObjQualifier;
        alias?: string;
    };
}
