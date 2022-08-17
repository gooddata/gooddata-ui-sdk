// (C) 2022 GoodData Corporation
import React from "react";
import { ObjRef } from "@gooddata/sdk-model";
import { IAlignPoint } from "@gooddata/sdk-ui-kit";
import { AttributeDisplayFormDropdown } from "./AttributeDisplayFormDropdown";
import { useAttributeFilterContext } from "../../../Context/AttributeFilterContext";

/**
 * @internal
 */
export interface IAttributeDisplayFormSelectProps {
    onSelect: (displayForm: ObjRef) => void;
    alignPoints?: IAlignPoint[];
}

/**
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
