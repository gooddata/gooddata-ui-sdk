// (C) 2019-2020 GoodData Corporation
import { IMetadataObject } from "../types";

/**
 * @public
 */
export interface IMeasureMetadataObject extends IMetadataObject {
    type: "measure";

    /**
     * Measure MAQL expressions
     */
    expression: string;

    /**
     * Measure formatting
     */
    format: string;
}
