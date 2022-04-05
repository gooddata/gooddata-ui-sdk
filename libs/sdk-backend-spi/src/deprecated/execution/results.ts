// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * Single calculated data value.
 *
 * @remarks
 * The data value may be `null` - the semantics here are same as with
 * SQL nulls. The calculated numeric value WILL be returned in string representation - this is to
 * prevent float number precision errors.
 *
 * @deprecated Use {@link @gooddata/sdk-model#DataValue}
 * @public
 */
export type DataValue = m.DataValue;

/**
 * Descriptor of the measure and its contents.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IMeasureDescriptorObject}
 * @public
 */
export interface IMeasureDescriptorObject extends m.IMeasureDescriptorObject {}

/**
 * Describes measure group and its contents.
 * @deprecated Use {@link @gooddata/sdk-model#IMeasureGroupDescriptor}
 * @public
 */
export interface IMeasureGroupDescriptor extends m.IMeasureGroupDescriptor {}

/**
 * Measure descriptor object.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IMeasureDescriptorItem}
 * @public
 */
export interface IMeasureDescriptorItem extends m.IMeasureDescriptorItem {}

/**
 * Describes measure included in a dimension.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IMeasureDescriptor}
 * @public
 */
export interface IMeasureDescriptor extends m.IMeasureDescriptor {}

/**
 * Describes total included in a dimension.
 *
 * @deprecated Use {@link @gooddata/sdk-model#ITotalDescriptorItem}
 * @public
 */
export interface ITotalDescriptorItem extends m.ITotalDescriptorItem {}

/**
 * Describes total included in a dimension.
 *
 * @deprecated Use {@link @gooddata/sdk-model#ITotalDescriptor}
 * @public
 */
export interface ITotalDescriptor extends m.ITotalDescriptor {}

/**
 * Describes attributes to which the display form belongs.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IAttributeHeaderFormOf}
 * @public
 */
export interface IAttributeHeaderFormOf extends m.IAttributeHeaderFormOf {}

/**
 * Attribute descriptior header.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IAttributeDescriptorBody}
 * @public
 */
export interface IAttributeDescriptorBody extends m.IAttributeDescriptorBody {}

/**
 * Describes attribute slicing of a dimension.
 *
 * @remarks
 * The primary descriptor is the attribute display form which was
 * used to slice the dimension. Description of the attribute to which the display form belongs is provided in the
 * `formOf` property.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IAttributeDescriptor}
 * @public
 */
export interface IAttributeDescriptor extends m.IAttributeDescriptor {}

/**
 * Headers describing contents of a dimension.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IDimensionItemDescriptor}
 * @public
 */
export type IDimensionItemDescriptor = m.IDimensionItemDescriptor;

/**
 * Dimension descriptor is the output counter-part of the dimension specification that was included in the
 * execution definition.
 *
 * @remarks
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
 * @deprecated Use {@link @gooddata/sdk-model#IDimensionDescriptor}
 * @public
 */
export interface IDimensionDescriptor extends m.IDimensionDescriptor {}

/**
 * Attribute header item specifies name and URI of the attribute element to which the calculated measure
 * values in the particular data view slice belong.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IResultAttributeHeaderItem}
 * @public
 */
export interface IResultAttributeHeaderItem extends m.IResultAttributeHeaderItem {}

/**
 * Attribute header specifies name and URI of the attribute element to which the calculated measure
 * values in the particular data view slice belong.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IResultAttributeHeader}
 * @public
 */
export interface IResultAttributeHeader extends m.IResultAttributeHeader {}

/**
 * Measure header specifes name of the measure to which the calculated values in the particular data view slice belong.
 *
 * @remarks
 * Measure header also specifies 'order' - this is essentially an index into measure group descriptor's item array; it
 * can be used to obtain further information about the measure.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IResultMeasureHeaderItem}
 * @public
 */
export interface IResultMeasureHeaderItem extends m.IResultMeasureHeaderItem {}

/**
 * Measure header specifes name of the measure to which the calculated values in the particular data view slice belong.
 *
 * @remarks
 * Measure header also specifies 'order' - this is essentially an index into measure group descriptor's item array; it
 * can be used to obtain further information about the measure.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IResultMeasureHeader}
 * @public
 */
export interface IResultMeasureHeader extends m.IResultMeasureHeader {}

/**
 * Total header specifies name and type of total to which the calculated values in particular data view slice belong.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IResultTotalHeaderItem}
 * @public
 */
export interface IResultTotalHeaderItem extends m.IResultTotalHeaderItem {}

/**
 * Total header specifies name and type of total to which the calculated values in particular data view slice belong.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IResultTotalHeader}
 * @public
 */
export interface IResultTotalHeader extends m.IResultTotalHeader {}

/**
 * Result headers provide metadata about data included in the data view.
 *
 * @remarks
 * They are integral part of the data view and are organized in per-dimension and per-dimension-item arrays.
 *
 * @remarks see {@link IDataView} for further detail on the organization.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IResultHeader}
 * @public
 */
export type IResultHeader = m.IResultHeader;

/**
 * Represents an execution result warning.
 * (e.g. when execution was executed successfully, but backend didn't take something into the account)
 *
 * @deprecated Use {@link @gooddata/sdk-model#IResultWarning}
 * @public
 */
export interface IResultWarning extends m.IResultWarning {}

//
// Type guards
//

/**
 * Type-guard testing whether the provided object is an instance of {@link IAttributeDescriptor}.
 *
 * @deprecated Use {@link @gooddata/sdk-model#isAttributeDescriptor}
 * @public
 */
export const isAttributeDescriptor = m.isAttributeDescriptor;

/**
 * Type-guard testing whether the provided object is an instance of {@link IMeasureGroupDescriptor}.
 *
 * @deprecated Use {@link @gooddata/sdk-model#isMeasureGroupDescriptor}
 * @public
 */
export const isMeasureGroupDescriptor = m.isMeasureGroupDescriptor;

/**
 * Type-guard testing whether the provided object is an instance of {@link IMeasureDescriptor}.
 *
 * @deprecated Use {@link @gooddata/sdk-model#isMeasureDescriptor}
 * @public
 */
export const isMeasureDescriptor = m.isMeasureDescriptor;

/**
 * Type-guard testing whether the provided object is an instance of {@link ITotalDescriptor}.
 *
 * @deprecated Use {@link @gooddata/sdk-model#isTotalDescriptor}
 * @public
 */
export const isTotalDescriptor = m.isTotalDescriptor;

/**
 * Type-guard testing whether the provided object is an instance of {@link IResultAttributeHeader}.
 *
 * @deprecated Use {@link @gooddata/sdk-model#isResultAttributeHeader}
 * @public
 */
export const isResultAttributeHeader = m.isResultAttributeHeader;

/**
 * Type-guard testing whether the provided object is an instance of {@link IResultMeasureHeader}.
 *
 * @deprecated Use {@link @gooddata/sdk-model#isResultMeasureHeader}
 * @public
 */
export const isResultMeasureHeader = m.isResultMeasureHeader;

/**
 * Type-guard testing whether the provided object is an instance of {@link IResultTotalHeader}.
 *
 * @deprecated Use {@link @gooddata/sdk-model#isResultTotalHeader}
 * @public
 */
export const isResultTotalHeader = m.isResultTotalHeader;

//
//
//

/**
 * Returns item name contained within a result header.
 *
 * @param header - header of any type
 * @deprecated Use {@link @gooddata/sdk-model#resultHeaderName}
 * @public
 */
export const resultHeaderName = m.resultHeaderName;

/**
 * Returns local identifier of attribute described in the provided attribute descriptor.
 *
 * @param descriptor - attribute descriptor, must be specified
 * @deprecated Use {@link @gooddata/sdk-model#attributeDescriptorLocalId}
 * @public
 */
export const attributeDescriptorLocalId = m.attributeDescriptorLocalId;

/**
 * Returns name of attribute described in the provided attribute descriptor.
 *
 * @param descriptor - attribute descriptor, must be specified
 * @deprecated Use {@link @gooddata/sdk-model#attributeDescriptorName}
 * @public
 */
export const attributeDescriptorName = m.attributeDescriptorName;
