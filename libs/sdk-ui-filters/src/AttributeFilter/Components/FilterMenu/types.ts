// (C) 2026 GoodData Corporation

import { type IAttributeDisplayFormMetadataObject, type ObjRef } from "@gooddata/sdk-model";

import { type AttributeFilterSelectionType } from "../../selectionTypes.js";

/**
 * Props for FilterMenu component.
 *
 * @alpha
 */
export interface IFilterMenuProps {
    /**
     * Current filter selection type
     */
    currentSelectionType: AttributeFilterSelectionType;

    /**
     * Available filter selection types
     */
    availableSelectionTypes?: AttributeFilterSelectionType[];

    /**
     * Callback when selection type is changed
     */
    onSelectionTypeChange: (selectionType: AttributeFilterSelectionType) => void;

    /**
     * Labels for "Values as" section.
     * When more than one, the section is shown.
     */
    labels?: IAttributeDisplayFormMetadataObject[];

    /**
     * Currently selected label ref.
     */
    selectedLabelRef?: ObjRef;

    /**
     * Callback when label is selected.
     */
    onLabelChange?: (labelRef: ObjRef) => void;

    /**
     * If true, tooltips in the menu are hidden.
     */
    hideTooltips?: boolean;
}

export type ISelectionTypeItemData = {
    selectionType: AttributeFilterSelectionType;
};

export type ILabelItemData = {
    labelRef: ObjRef;
};
