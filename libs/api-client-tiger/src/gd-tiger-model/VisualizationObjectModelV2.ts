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

export namespace VisualizationObjectModelV2 {
    export interface IVisualizationObject {
        version: "2";
        visualizationUrl: string;
        buckets: IBucket[];
        filters: FilterDefinition[];
        sorts: ISortItem[];
        properties: VisualizationProperties;
    }

    interface IBucket {
        localIdentifier?: string;
        items: IAttributeOrMeasure[];
        totals?: ITotal[];
    }

    export interface IAttribute {
        localIdentifier: Identifier;
        label: ObjectIdentifier;
        alias?: string;
    }

    export interface IMeasure {
        localIdentifier: Identifier;
        definition: MeasureDefinition;
        alias?: string;
        format?: string;
    }

    export interface IDimension {
        localIdentifier: string;
        itemIdentifiers: Identifier[];
        sorting?: SortKey[];
        totals?: ITotalItem[];
    }

    export interface ITotalItem {
        measureIdentifier: LocalIdentifier;
        type: TotalType;
        attributeIdentifier: LocalIdentifier;
    }

    type SortKey = SortKeyAttribute | SortKeyValue;

    type TotalType = "sum" | "avg" | "max" | "min" | "nat" | "med";

    type IAttributeOrMeasure = IMeasure | IAttribute;
    type Identifier = string;

    type VisualizationProperties = {
        [key: string]: any;
    };

    export function isVisualizationObject(
        visualizationObject: unknown,
    ): visualizationObject is IVisualizationObject {
        return !isEmpty(visualizationObject) && (visualizationObject as IVisualizationObject).version === "2";
    }
}
