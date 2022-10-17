// (C) 2021-2022 GoodData Corporation
import React from "react";
import { useBackendStrict } from "@gooddata/sdk-ui";
import { AttributeFilterRenderer } from "./Components/AttributeFilterRenderer";
import { IAttributeFilterBaseProps } from "./types";
import { validateAttributeFilterProps } from "./utils";
import { AttributeFilterProviders } from "./AttributeFilterProviders";

/**
 * @internal
 */
export const AttributeFilterBase: React.FC<IAttributeFilterBaseProps> = (props) => {
    const backend = useBackendStrict(props.backend, "AttributeFilter");

    validateAttributeFilterProps({ backend, ...props });

    return (
        <AttributeFilterProviders {...props}>
            <AttributeFilterRenderer />
        </AttributeFilterProviders>
    );
};
