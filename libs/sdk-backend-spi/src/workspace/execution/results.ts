// (C) 2019-2020 GoodData Corporation

import isEmpty from "lodash/isEmpty";

/**
 * Single calculated data value. The data value may be 'null' - the semantics here are same as with
 * SQL nulls. The calculated numeric value WILL be returned in string representation - this is to
 * prevent float number precision errors.
 *
 * @public
 */
export type DataValue = null | string | number;

/**
 * Describes measure group and its contents.
 * @public
 */
export interface IMeasureGroupDescriptor {
    // TODO: rename this to measureGroupDescriptor ... the goal is to get rid of the overused 'header' nomenclature
    measureGroupHeader: {
        items: IMeasureDescriptor[];
        totalItems?: ITotalDescriptor[];
    };
}

/**
 * Describes measure included in a dimension.
 *
 * @public
 */
export interface IMeasureDescriptor {
    // TODO: rename this to measureDescriptor ... the goal is to get rid of the overused 'header' nomenclature
    measureHeaderItem: {
        uri?: string;
        identifier?: string;
        localIdentifier: string;
        name: string;
        format: string;
    };
}

/**
 * Describes total included in a dimension.
 *
 * @public
 */
export interface ITotalDescriptor {
    // TODO: rename this to totalDescriptor ... the goal is to get rid of the overused 'header' nomenclature
    totalHeaderItem: {
        name: string;
    };
}

/**
 * Describes attribute slicing of a dimension.
 *
 * @public
 */
export interface IAttributeDescriptor {
    // TODO: rename this to attributeDescriptor ... the goal is to get rid of the overused 'header' nomenclature
    attributeHeader: {
        uri: string;
        identifier: string;
        localIdentifier: string;
        name: string;
        totalItems?: ITotalDescriptor[];
        formOf: {
            uri: string;
            identifier: string;
            name: string;
        };
    };
}

/**
 * Headers describing contents of a dimension.
 *
 * @public
 */
export type IDimensionItemDescriptor = IMeasureGroupDescriptor | IAttributeDescriptor;

/**
 * Dimension descriptor is the output counter-part of the dimension specification that was included in the
 * execution definition.
 *
 * It describes in further detail the LDM objects which were used to obtain data and metadata for the dimension
 * in the cross-tabulated result.
 *
 * The information is provided in a form of attribute or measure group descriptors. The contract is that the
 * descriptors appear in the same order as they were specified in the execution definition.
 *
 * This best best demonstrated using examples.
 *
 * 1. Execution was done for attribute A1 and measures M1 and M2. Both attribute and measureGroup are in single
 *    dimension.
 *
 * The result dimension will contain two headers, first will be header describing the attribute {@link IAttributeDescriptor},
 * followed by {@link IMeasureGroupDescriptor}. The measure group header contains two items - one for each requested
 * measure.
 *
 * 2. Execution was done for attributes A1 and A2, measures M1 and M2. Attribute A1 is in first dimension and
 *    the remainder of objects (A2 and measureGroup) is in second dimension.
 *
 * There will be two result dimension descriptors. First descriptor will specify single header for A1 attribute,
 * second descriptor will have two headers, first will be header for attribute A2 and then measure group header
 * with two items.
 *
 * @public
 */
export interface IDimensionDescriptor {
    // TODO: consider renaming this to itemDescriptors or something ...
    //  the goal is to get rid of the overused 'header' nomenclature
    headers: IDimensionItemDescriptor[];
}

/**
 * Attribute header specifies name and URI of the attribute element to which the calculated measure
 * values in the particular data view slice belong.
 *
 * @public
 */
export interface IResultAttributeHeader {
    attributeHeaderItem: {
        uri: string;
        name: string;
    };
}

/**
 * Measure header specifes name of the measure to which the calculated values in the particular data view slice belong.
 *
 * Measure header also specifies 'order' - this is essentially an index into measure group descriptor's item array; it
 * can be used to obtain further information about the measure.
 *
 * @public
 */
export interface IResultMeasureHeader {
    measureHeaderItem: {
        name: string;
        order: number;
    };
}

/**
 * Total header specifies name and type of total to which the calculated values in particular data view slice belong.
 *
 * @public
 */
export interface IResultTotalHeader {
    totalHeaderItem: {
        name: string;
        type: string;
    };
}

/**
 * Result headers provide metadata about data included in the data view. They are integral part of the data view
 * and are organized in per-dimension and per-dimension-item arrays.
 *
 * @remarks see IDataView for further detail on the organization.
 *
 * @public
 */
export type IResultHeader = IResultAttributeHeader | IResultMeasureHeader | IResultTotalHeader;

//
// Type guards
//

/**
 * Type-guard testing whether the provided object is an instance of {@link IAttributeDescriptor}.
 *
 * @public
 */
export function isAttributeDescriptor(obj: unknown): obj is IAttributeDescriptor {
    return !isEmpty(obj) && (obj as IAttributeDescriptor).attributeHeader !== undefined;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IMeasureGroupDescriptor}.
 *
 * @public
 */
export function isMeasureGroupDescriptor(obj: unknown): obj is IMeasureGroupDescriptor {
    return !isEmpty(obj) && (obj as IMeasureGroupDescriptor).measureGroupHeader !== undefined;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IMeasureDescriptor}.
 *
 * @public
 */
export function isMeasureDescriptor(obj: unknown): obj is IMeasureDescriptor {
    return !isEmpty(obj) && (obj as IMeasureDescriptor).measureHeaderItem !== undefined;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link ITotalDescriptor}.
 *
 * @public
 */
export function isTotalDescriptor(obj: unknown): obj is ITotalDescriptor {
    return !isEmpty(obj) && (obj as ITotalDescriptor).totalHeaderItem !== undefined;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IResultAttributeHeader}.
 *
 * @public
 */
export function isResultAttributeHeader(obj: unknown): obj is IResultAttributeHeader {
    return !isEmpty(obj) && (obj as IResultAttributeHeader).attributeHeaderItem !== undefined;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IResultMeasureHeader}.
 *
 * @public
 */
export function isResultMeasureHeader(obj: unknown): obj is IResultMeasureHeader {
    return (
        !isEmpty(obj) &&
        (obj as IResultMeasureHeader).measureHeaderItem !== undefined &&
        (obj as IResultMeasureHeader).measureHeaderItem.order !== undefined
    );
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IResultTotalHeader}.
 *
 * @public
 */
export function isResultTotalHeader(obj: unknown): obj is IResultTotalHeader {
    return (
        !isEmpty(obj) &&
        (obj as IResultTotalHeader).totalHeaderItem !== undefined &&
        (obj as IResultTotalHeader).totalHeaderItem.type !== undefined
    );
}

//
//
//

/**
 * Returns item name contained within a result header.
 *
 * @param header - header of any type
 * @public
 */
export function resultHeaderName(header: IResultHeader): string {
    if (isResultAttributeHeader(header)) {
        return header.attributeHeaderItem.name;
    } else if (isResultMeasureHeader(header)) {
        return header.measureHeaderItem.name;
    }

    return header.totalHeaderItem.name;
}

/**
 * Returns local identifier of attribute described in the provided attribute descriptor.
 *
 * @param descriptor - attribute descriptor, must be specified
 * @public
 */
export function attributeDescriptorLocalId(descriptor: IAttributeDescriptor): string {
    return descriptor.attributeHeader.localIdentifier;
}

/**
 * Returns name of attribute described in the provided attribute descriptor.
 *
 * @param descriptor - attribute descriptor, must be specified
 * @public
 */
export function attributeDescriptorName(descriptor: IAttributeDescriptor): string {
    return descriptor.attributeHeader.formOf.name;
}
