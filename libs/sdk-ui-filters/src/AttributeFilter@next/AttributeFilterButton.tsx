// (C) 2021-2022 GoodData Corporation
import React from "react";
import { AttributeFilterBase, IAttributeFilterBaseProps } from "./AttributeFilterBase";
import { AttributeFilterDropdownButton } from "./Components/DropdownButton/AttributeFilterDropdownButton";

/**
 * @alpha
 */
export type IAttributeFilterButtonProps = IAttributeFilterBaseProps;

/**
 * @alpha
 */
export const AttributeFilterButton: React.FC<IAttributeFilterButtonProps> = (props) => {
    return (
        <AttributeFilterBase
            {...props}
            DropdownButtonComponent={props.DropdownButtonComponent ?? AttributeFilterDropdownButton}
            LoadingComponent={props.LoadingComponent ?? LoadingComponent}
        />
    );
};

function LoadingComponent() {
    return <AttributeFilterDropdownButton isLoading />;
}
