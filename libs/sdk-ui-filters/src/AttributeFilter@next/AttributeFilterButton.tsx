// (C) 2021-2022 GoodData Corporation
import React from "react";
import { AttributeFilterBase, IAttributeFilterBaseProps } from "./AttributeFilterBase";
import { AttributeFilterButton as AttributeFilterButtonComponent } from "./Components/AttributeFilterButton";

export type IAttributeFilterButtonProps = IAttributeFilterBaseProps;

/**
 * @internal
 */
export const AttributeFilterButton: React.FC<IAttributeFilterButtonProps> = (props) => {
    return <AttributeFilterBase {...props} FilterButton={AttributeFilterButtonComponent} />;
};
