// (C) 2019-2020 GoodData Corporation
import { IMetadataObject } from "../types";

/**
 * Measure metadata object
 *
 * @public
 */
export interface IMeasureMetadataObject extends IMetadataObject {
    type: "measure";

    /**
     * Measure MAQL expression
     */
    expression: string;

    /**
     * Measure formatting
     */
    format: string;
}
