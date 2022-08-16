// (C) 2021-2022 GoodData Corporation
import React from "react";
import { AttributeFilterRenderer } from "./Components/AttributeFilterRenderer";
import { IAttributeFilterBaseProps } from "./types";
import { validateAttributeFilterProps } from "./utils";
import { AttributeFilterProviders } from "./AttributeFilterProviders";

/**
 * @internal
 */
export const AttributeFilterBase: React.FC<IAttributeFilterBaseProps> = (props) => {
    validateAttributeFilterProps(props);

    return (
        <AttributeFilterProviders {...props}>
            <AttributeFilterRenderer />
        </AttributeFilterProviders>
    );
};
