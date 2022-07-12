// (C) 2022 GoodData Corporation

import { IAttributeDisplayFormMetadataObject, ObjRef } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IDashboardAttributeFilterParentItem {
    localIdentifier: string;
    title: string;
    isSelected: boolean;
    overAttributes?: ObjRef[];
    selectedConnectingAttribute: ObjRef;
}

/**
 * @internal
 */
export interface IDashboardAttributeFilterDisplayForms {
    selectedDisplayForm: ObjRef;
    availableDisplayForms: IAttributeDisplayFormMetadataObject[];
}

/**
 * @internal
 */
export interface IConnectingAttribute {
    title: string;
    ref: ObjRef;
}

/**
 * The matrix to save connecting attributes for all attribute filter pairs.
 *
 * @remarks
 * The rows of the matrix represent the attribute filter currently opened. Columns represent
 * the other filters. The mapping is made through the {@link FilterContextState#filtersToIndexMap}.
 *
 * To get the relevant connecting attributes, get the index for the filter from the {@link FilterContextState#filtersToIndexMap}
 * according to filters local identifiers.
 *
 * @example
 * const connectingAttributes = connectingAttributesMatrix[currentFilterIndex][neighborFilterIndex];
 *
 * @internal
 */
export type ConnectingAttributeMatrix = IConnectingAttribute[][][];

/**
 * @internal
 */
export interface IParentWithConnectingAttributes {
    /**
     * Local identifier of the parent filter.
     */
    filterLocalId: string;

    /**
     * Common attributes with the currently opened attribute filter.
     */
    connectingAttributes: IConnectingAttribute[];
}
