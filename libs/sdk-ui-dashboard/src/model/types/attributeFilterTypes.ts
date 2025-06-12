// (C) 2022-2023 GoodData Corporation

import { IAttributeDisplayFormMetadataObject, IAttributeElement, ObjRef } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IDashboardAttributeFilterParentItem {
    localIdentifier: string;
    title?: string;
    displayForm: ObjRef;
    isSelected: boolean;
    overAttributes?: ObjRef[];
    selectedConnectingAttribute: ObjRef | undefined;
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

/**
 * @internal
 */
export interface IUseAttributeElements {
    elements: IAttributeElement[];
    totalCount: number;
}
