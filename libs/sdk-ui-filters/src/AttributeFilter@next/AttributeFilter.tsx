// (C) 2007-2022 GoodData Corporation
import React from "react";
import { AttributeFilterBase, IAttributeFilterBaseProps } from "./AttributeFilterBase";
import { AttributeFilterSimpleButtonWithSelection } from "./Components/AttributeFilterSimpleButton";

/**
 * @internal
 */
export interface IAttributeFilterProps extends IAttributeFilterBaseProps {
    titleWithSelection?: boolean;
    fullscreenOnMobile?: boolean; //not handled
    FilterLoading?: React.ComponentType; //TODO it will be part of IAttributeFilterBaseProps
}

/**
 * AttributeFilter is a component that renders a dropdown populated with attribute values
 * for specified attribute display form.
 *
 * @internal
 */
export const AttributeFilter: React.FC<IAttributeFilterProps> = (props) => {
    const { titleWithSelection, ...baseProps } = props;

    const ButtonComponent = titleWithSelection ? AttributeFilterSimpleButtonWithSelection : undefined;

    return <AttributeFilterBase {...baseProps} AttributeFilterButton={ButtonComponent} />;
};
