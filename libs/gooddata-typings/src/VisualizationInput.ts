// (C) 2019 GoodData Corporation
import { AFM } from './AFM';
import { VisualizationObject } from './VisualizationObject';

/**
 * This namespace implements types that are used as inputs to various visualization components.
 *
 * At the moment these most of the types are mere aliases to types in VisualizationObject, AFM, or unions
 * to different types. There is one notable exception: the measure & (simple) measure definition, this type
 * is redefined here to allow simple measure filters be defined as text filters; this is not possible with the
 * standard visualization object.
 */
export namespace VisualizationInput {
    export type ObjQualifier = VisualizationObject.ObjQualifier;

    export type IAttribute = VisualizationObject.IVisualizationAttribute;

    export type IPreviousPeriodDateDataSet = VisualizationObject.IPreviousPeriodDateDataSet;
    export type ArithmeticMeasureOperator = VisualizationObject.ArithmeticMeasureOperator;
    export type IArithmeticMeasureDefinition = VisualizationObject.IArithmeticMeasureDefinition;
    export type IPoPMeasureDefinition = VisualizationObject.IPoPMeasureDefinition;
    export type IPreviousPeriodMeasureDefinition = VisualizationObject.IPreviousPeriodMeasureDefinition;
    export type MeasureAggregation = VisualizationObject.MeasureAggregation;
    export type IMeasureDefinitionType = IMeasureDefinition
        | IArithmeticMeasureDefinition
        | IPoPMeasureDefinition
        | IPreviousPeriodMeasureDefinition;

    export interface IMeasureDefinition {
        measureDefinition: {
            item: ObjQualifier;
            aggregation?: MeasureAggregation;
            filters?: IFilter[];
            computeRatio?: boolean;
        };
    }

    export interface IMeasure {
        measure: {
            localIdentifier: VisualizationObject.Identifier;
            definition: IMeasureDefinitionType;
            alias?: string;
            title?: string;
            format?: string;
        };
    }

    export type AttributeOrMeasure = IAttribute | IMeasure;

    export type IPositiveAttributeFilter = AFM.IPositiveAttributeFilter;
    export type INegativeAttributeFilter = AFM.INegativeAttributeFilter;
    export type IAbsoluteDateFilter = VisualizationObject.IVisualizationObjectAbsoluteDateFilter;
    export type IRelativeDateFilter = VisualizationObject.IVisualizationObjectRelativeDateFilter;

    export type IFilter =
        IAbsoluteDateFilter
        | IRelativeDateFilter
        | IPositiveAttributeFilter
        | INegativeAttributeFilter;

    export type ISort = AFM.IAttributeSortItem | AFM.IMeasureSortItem;
    export type ITotal = VisualizationObject.IVisualizationTotal;

    export function isMeasure(obj: any): obj is IMeasure {
        return VisualizationObject.isMeasure(obj);
    }

    export function isMeasureDefinition(obj: IMeasureDefinitionType): obj is IMeasureDefinition {
        return VisualizationObject.isMeasureDefinition(obj);
    }

    export function isArithmeticMeasureDefinition(obj: IMeasureDefinitionType): obj is IArithmeticMeasureDefinition {
        return VisualizationObject.isArithmeticMeasureDefinition(obj);
    }

    export function isPopMeasureDefinition(obj: IMeasureDefinitionType): obj is IPoPMeasureDefinition {
        return VisualizationObject.isPopMeasureDefinition(obj);
    }

    export function isPreviousPeriodMeasureDefinition(obj: any): obj is any {
        return VisualizationObject.isPreviousPeriodMeasureDefinition(obj);
    }

    export function isAttribute(obj: any): obj is IAttribute {
        return VisualizationObject.isAttribute(obj as VisualizationObject.IVisualizationAttribute);
    }

    export function isPositiveAttributeFilter(obj: any): obj is IPositiveAttributeFilter {
        return AFM.isPositiveAttributeFilter(obj);
    }

    export function isNegativeAttributeFilter(obj: any): obj is INegativeAttributeFilter {
        return AFM.isNegativeAttributeFilter(obj);
    }

    export function isAbsoluteDateFilter(obj: any): obj is IAbsoluteDateFilter {
        return VisualizationObject.isAbsoluteDateFilter(obj);
    }

    export function isRelativeDateFilter(obj: any): obj is IRelativeDateFilter {
        return VisualizationObject.isRelativeDateFilter(obj);
    }

    export function isSort(obj: any): obj is ISort {
        return AFM.isAttributeSortItem(obj) || AFM.isMeasureSortItem(obj);
    }
}
