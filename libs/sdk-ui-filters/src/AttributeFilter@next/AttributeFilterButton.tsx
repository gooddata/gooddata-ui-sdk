// (C) 2021-2022 GoodData Corporation
import React from "react";
import { AttributeFilterBase } from "./AttributeFilterBase";
import { AttributeFilterDropdownButton } from "./Components/DropdownButton/AttributeFilterDropdownButton";
import { IAttributeFilterBaseProps } from "./types";

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
            LoadingComponent={props.FilterLoading ?? props.LoadingComponent ?? LoadingComponent}
            ErrorComponent={props.FilterError ?? props.ErrorComponent}
        />
    );
};

function LoadingComponent() {
    return <AttributeFilterDropdownButton isLoading />;
}
