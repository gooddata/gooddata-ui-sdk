// (C) 2021-2025 GoodData Corporation
import { useBackendStrict } from "@gooddata/sdk-ui";
import { IAttributeFilterBaseProps } from "./types.js";
import { validateAttributeFilterProps } from "./utils.js";
import { AttributeFilterProviders } from "./AttributeFilterProviders.js";
import { AttributeFilterDropdown } from "./Components/Dropdown/AttributeFilterDropdown.js";

/**
 * @internal
 */
export function AttributeFilterBase(props: IAttributeFilterBaseProps) {
    const backend = useBackendStrict(props.backend, "AttributeFilter");

    validateAttributeFilterProps({ backend, ...props });

    return (
        <AttributeFilterProviders {...props}>
            <AttributeFilterDropdown />
        </AttributeFilterProviders>
    );
}
