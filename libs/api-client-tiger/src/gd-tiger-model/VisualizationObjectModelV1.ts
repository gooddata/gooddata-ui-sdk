// (C) 2019-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { IBucket, IFilter, ISortItem, VisualizationProperties } from "@gooddata/sdk-model";
import {
    AfmObjectIdentifier,
    AfmLocalIdentifier,
    MeasureDefinition,
    SortKeyAttribute,
    SortKeyValue,
} from "../generated/afm-rest-api";

export namespace VisualizationObjectModelV1 {
    /**
     * Visualization object used to store its data as a metadata object
     *
     * @deprecated use {@link VisualizationObjectModelV2.IVisualizationObject} instead
     */
    export interface IVisualizationObject {
        visualizationObject: {
            title: string;
            visualizationUrl: string;
            buckets: IBucket[];
            filters: IFilter[];
            sorts: ISortItem[];
            properties: VisualizationProperties;
        };
    }

    /**
     * Attribute format used in executions
     *
     * @deprecated use {@link AttributeItem} instead
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
     */
    export interface ITotalItem {
        measureIdentifier: AfmLocalIdentifier;
        type: TotalType;
        attributeIdentifier: AfmLocalIdentifier;
    }

    type SortKey = SortKeyAttribute | SortKeyValue;

    type TotalType = "sum" | "avg" | "max" | "min" | "nat" | "med";

    type Identifier = string;

    export function isVisualizationObject(
        visualizationObject: unknown,
    ): visualizationObject is IVisualizationObject {
        return (
            !isEmpty(visualizationObject) &&
            !!(visualizationObject as IVisualizationObject).visualizationObject
        );
    }
}
