// (C) 2021-2025 GoodData Corporation

import { AttributeFilterBase } from "./AttributeFilterBase.js";
import { AttributeFilterDropdownButton } from "./Components/DropdownButton/AttributeFilterDropdownButton.js";
import { IAttributeFilterBaseProps } from "./types.js";
import { VisibilityMode } from "../shared/index.js";

/**
 * @public
 */
export type IAttributeFilterButtonProps = Omit<IAttributeFilterBaseProps, "disabled"> & {
    attributeFilterMode?: VisibilityMode;
};

/**
 * AttributeFilterButton is a component that renders a rich button and a dropdown populated with attribute values
 * for specified attribute display form.
 * @public
 */
export function AttributeFilterButton(props: IAttributeFilterButtonProps) {
    const { attributeFilterMode, ...filterBaseProps } = props;
    return attributeFilterMode === "hidden" ? null : (
        <AttributeFilterBase
            {...filterBaseProps}
            disabled={attributeFilterMode === "readonly"}
            DropdownButtonComponent={props.DropdownButtonComponent ?? AttributeFilterDropdownButton}
        />
    );
}
