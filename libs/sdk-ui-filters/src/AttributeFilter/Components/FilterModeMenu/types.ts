// (C) 2026 GoodData Corporation

import { type IAttributeDisplayFormMetadataObject, type ObjRef } from "@gooddata/sdk-model";

import { type AttributeFilterMode } from "../../filterModeTypes.js";

/**
 * Props for FilterModeMenu component.
 *
 * @alpha
 */
export interface IFilterModeMenuProps {
    /**
     * Current filter mode
     */
    currentMode: AttributeFilterMode;

    /**
     * Available filter modes
     */
    availableModes?: AttributeFilterMode[];

    /**
     * Callback when mode is selected
     */
    onModeChange: (mode: AttributeFilterMode) => void;

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

export type IModeItemData = {
    mode: AttributeFilterMode;
};

export type ILabelItemData = {
    labelRef: ObjRef;
};
