// (C) 2022-2026 GoodData Corporation

import { type ObjRef } from "@gooddata/sdk-model";
import { type IAlignPoint } from "@gooddata/sdk-ui-kit";

import { useAttributeFilterContext } from "../../../Context/AttributeFilterContext.js";
import { AttributeDisplayFormDropdown } from "./AttributeDisplayFormDropdown.js";

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
export function AttributeDisplayFormSelect({ onSelect, alignPoints }: IAttributeDisplayFormSelectProps) {
    const { displayForms, currentDisplayAsDisplayFormRef } = useAttributeFilterContext();

    return (
        <AttributeDisplayFormDropdown
            displayForms={displayForms}
            selectedDisplayForm={currentDisplayAsDisplayFormRef}
            alignPoints={alignPoints}
            onSelect={onSelect}
        />
    );
}
