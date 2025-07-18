// (C) 2007-2025 GoodData Corporation
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
export function AttributeFilter(props: IAttributeFilterProps) {
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
}
