// (C) 2007-2022 GoodData Corporation
import React from "react";
import { AttributeFilterBase } from "./AttributeFilterBase.js";
import {
    AttributeFilterSimpleDropdownButton,
    AttributeFilterSimpleDropdownButtonWithSelection,
} from "./Components/DropdownButton/AttributeFilterSimpleDropdownButton.js";
import { IAttributeFilterBaseProps } from "./types.js";

/**
 * @public
 */
export interface IAttributeFilterProps extends IAttributeFilterBaseProps {
    titleWithSelection?: boolean;
}

/**
 * AttributeFilter is a component that renders a simple button and a dropdown populated with attribute values
 * for specified attribute display form.
 *
 * @public
 */
export const AttributeFilter: React.FC<IAttributeFilterProps> = (props) => {
    const { titleWithSelection, ...baseProps } = props;

    const DropdownButtonComponent = titleWithSelection
        ? AttributeFilterSimpleDropdownButtonWithSelection
        : AttributeFilterSimpleDropdownButton;

    return (
        <AttributeFilterBase
            {...baseProps}
            DropdownButtonComponent={props.DropdownButtonComponent ?? DropdownButtonComponent}
        />
    );
};
