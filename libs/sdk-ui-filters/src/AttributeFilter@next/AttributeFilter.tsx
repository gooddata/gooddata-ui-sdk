// (C) 2007-2022 GoodData Corporation
import React from "react";
import { AttributeFilterBase, IAttributeFilterBaseProps } from "./AttributeFilterBase";
import {
    AttributeFilterSimpleDropdownButton,
    AttributeFilterSimpleDropdownButtonWithSelection,
} from "./Components/DropdownButton/AttributeFilterSimpleDropdownButton";

/**
 * @alpha
 */
export interface IAttributeFilterProps extends IAttributeFilterBaseProps {
    titleWithSelection?: boolean;
    fullscreenOnMobile?: boolean; //TODO: not handled
}

/**
 * AttributeFilter is a component that renders a dropdown populated with attribute values
 * for specified attribute display form.
 *
 * @alpha
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
            LoadingComponent={props.LoadingComponent ?? LoadingComponent}
        />
    );
};

function LoadingComponent() {
    return <AttributeFilterSimpleDropdownButton isLoading />;
}
