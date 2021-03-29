// (C) 2019-2021 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { ISortItem, ITotal } from "@gooddata/sdk-model";
import {
    FilterDefinition,
    LocalIdentifier,
    MeasureDefinition,
    ObjectIdentifier,
    SortKeyAttribute,
    SortKeyValue,
} from "../generated/afm-rest-api";

export namespace VisualizationObjectModelV1 {
    /**
     * @deprecated use {@link VisualizationObjectModelV2.IVisualizationObject} instead
     */
    export interface IVisualizationObject {
        visualizationObject: {
            title: string;
            visualizationUrl: string;
            buckets: IBucket[];
            filters: FilterDefinition[];
            sorts: ISortItem[];
            properties: VisualizationProperties;
        };
    }

    /**
     * @deprecated use {@link VisualizationObjectModelV2.IBucket} instead
     */
    export interface IBucket {
        localIdentifier?: string;
        items: IAttributeOrMeasure[];
        totals?: ITotal[];
    }

    /**
     * @deprecated use {@link VisualizationObjectModelV2.IAttribute} instead
     */
    export interface IAttribute {
        localIdentifier: Identifier;
        displayForm: ObjectIdentifier;
        alias?: string;
    }

    /**
     * @deprecated use {@link VisualizationObjectModelV2.IMeasure} instead
     */
    export interface IMeasure {
        localIdentifier: Identifier;
        definition: MeasureDefinition;
        alias?: string;
        format?: string;
    }

    /**
     * @deprecated use {@link VisualizationObjectModelV2.IDimension} instead
     */
    export interface IDimension {
        localIdentifier: string;
        itemIdentifiers: Identifier[];
        sorting?: SortKey[];
        totals?: ITotalItem[];
    }

    /**
     * @deprecated use {@link VisualizationObjectModelV2.ITotalItem} instead
     */
    export interface ITotalItem {
        measureIdentifier: LocalIdentifier;
        type: TotalType;
        attributeIdentifier: LocalIdentifier;
    }

    type SortKey = SortKeyAttribute | SortKeyValue;

    type TotalType = "sum" | "avg" | "max" | "min" | "nat" | "med";

    /**
     * @deprecated use {@link VisualizationObjectModelV2.IAttributeOrMeasure} instead
     */
    export type IAttributeOrMeasure = IMeasure | IAttribute;
    type Identifier = string;

    type VisualizationProperties = {
        [key: string]: any;
    };

    export function isVisualizationObject(
        visualizationObject: unknown,
    ): visualizationObject is IVisualizationObject {
        return (
            !isEmpty(visualizationObject) &&
            !!(visualizationObject as IVisualizationObject).visualizationObject
        );
    }

    export function isMeasure(obj: unknown): obj is IMeasure {
        return !isEmpty(obj) && !!(obj as IMeasure).definition;
    }

    export function isAttribute(obj: unknown): obj is IAttribute {
        return !isEmpty(obj) && !!(obj as IAttribute).displayForm;
    }
}
