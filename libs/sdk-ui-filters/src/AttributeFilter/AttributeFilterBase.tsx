// (C) 2021-2023 GoodData Corporation
import React from "react";
import { useBackendStrict } from "@gooddata/sdk-ui";
import { IAttributeFilterBaseProps } from "./types.js";
import { validateAttributeFilterProps } from "./utils.js";
import { AttributeFilterProviders } from "./AttributeFilterProviders.js";
import { AttributeFilterDropdown } from "./Components/Dropdown/AttributeFilterDropdown.js";

/**
 * @internal
 */
export const AttributeFilterBase: React.FC<IAttributeFilterBaseProps> = (props) => {
    const backend = useBackendStrict(props.backend, "AttributeFilter");

    validateAttributeFilterProps({ backend, ...props });

    return (
        <AttributeFilterProviders {...props}>
            <AttributeFilterDropdown />
        </AttributeFilterProviders>
    );
};
