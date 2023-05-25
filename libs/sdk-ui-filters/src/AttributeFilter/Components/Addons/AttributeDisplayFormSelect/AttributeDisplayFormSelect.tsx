// (C) 2022 GoodData Corporation
import React from "react";
import { ObjRef } from "@gooddata/sdk-model";
import { IAlignPoint } from "@gooddata/sdk-ui-kit";
import { AttributeDisplayFormDropdown } from "./AttributeDisplayFormDropdown.js";
import { useAttributeFilterContext } from "../../../Context/AttributeFilterContext.js";

/**
 * It is AttributeDisplayFormSelect
 * It represents selector for related Attribute display forms
 * @internal
 */
export interface IAttributeDisplayFormSelectProps {
    onSelect: (displayForm: ObjRef) => void;
    alignPoints?: IAlignPoint[];
}

/**
 * Component that render Attribute display forms selector as dropdown.
 * @internal
 */
export const AttributeDisplayFormSelect: React.FC<IAttributeDisplayFormSelectProps> = (props) => {
    const { onSelect, alignPoints } = props;

    const { displayForms, currentDisplayFormRef } = useAttributeFilterContext();

    return (
        <AttributeDisplayFormDropdown
            displayForms={displayForms}
            selectedDisplayForm={currentDisplayFormRef}
            alignPoints={alignPoints}
            onSelect={onSelect}
        />
    );
};
