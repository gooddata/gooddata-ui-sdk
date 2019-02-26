// (C) 2019 GoodData Corporation
import { AFM } from './AFM';
import { VisualizationObject } from './VisualizationObject';

/**
 * This namespace implements types that are used as inputs to various visualization components.
 *
 * At the moment these types are mere aliases to types defined in VisualizationObject and/or AFM. This may change
 * in the future if VisualizationObject and or AFM change incompatibly - in that case we MAY add backward compatible
 * types here in order not to break existing users.
 */
export namespace VisualizationInput {
    export type IAttribute = VisualizationObject.IVisualizationAttribute;
    export type IMeasure = VisualizationObject.IMeasure;

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
        return VisualizationObject.isMeasure(obj as VisualizationObject.IMeasure);
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
