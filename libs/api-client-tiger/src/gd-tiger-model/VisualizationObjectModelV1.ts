// (C) 2019-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import {
    type ITigerBucket,
    type ITigerFilter,
    type ITigerSortItem,
    type ITigerVisualizationProperties,
} from "./TigerTypes.js";
import {
    type AfmLocalIdentifier,
    type AfmObjectIdentifier,
    type MeasureDefinition,
    type SortKeyAttribute,
    type SortKeyValue,
} from "../generated/afm-rest-api/index.js";

/**
 * Visualization object used to store its data as a metadata object
 *
 * @deprecated use {@link VisualizationObjectModelV2.IVisualizationObject} instead
 * @public
 */
export interface IVisualizationObject {
    visualizationObject: {
        title: string;
        visualizationUrl: string;
        buckets: ITigerBucket[];
        filters: ITigerFilter[];
        sorts: ITigerSortItem[];
        properties: ITigerVisualizationProperties;
    };
}

/**
 * Attribute format used in executions
 *
 * @deprecated use {@link AttributeItem} instead
 * @public
 */
export interface IAttribute {
    localIdentifier: Identifier;
    displayForm: AfmObjectIdentifier;
    alias?: string;
}

/**
 * Measure format used in executions
 *
 * @deprecated use {@link MeasureItem} instead
 * @public
 */
export interface IMeasure {
    localIdentifier: Identifier;
    definition: MeasureDefinition;
    alias?: string;
    format?: string;
}

/**
 * Dimension format used in executions
 *
 * @deprecated use {@link Dimension} instead
 * @public
 */
export interface IDimension {
    localIdentifier: string;
    itemIdentifiers: Identifier[];
    sorting?: SortKey[];
    totals?: ITotalItem[];
}

/**
 * Total format used in executions
 *
 * @deprecated use {@link GrandTotal} instead
 * @public
 */
export interface ITotalItem {
    measureIdentifier: AfmLocalIdentifier;
    type: TotalType;
    attributeIdentifier: AfmLocalIdentifier;
}

/**
 * @public
 */
export type SortKey = SortKeyAttribute | SortKeyValue;

/**
 * @public
 */
export type TotalType = "sum" | "avg" | "max" | "min" | "nat" | "med";

/**
 * @public
 */
export type Identifier = string;

/**
 * @public
 */
export function isVisualizationObject(
    visualizationObject: unknown,
): visualizationObject is IVisualizationObject {
    return (
        !isEmpty(visualizationObject) && !!(visualizationObject as IVisualizationObject).visualizationObject
    );
}
