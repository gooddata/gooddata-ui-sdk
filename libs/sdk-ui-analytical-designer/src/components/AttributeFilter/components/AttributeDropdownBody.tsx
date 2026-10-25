// (C) 2007-2026 GoodData Corporation

import {
    AttributeFilterDropdownBody,
    type IAttributeFilterDropdownBodyProps,
} from "@gooddata/sdk-ui-filters";

import { ATTRIBUTE_DROPDOWN_WIDTH } from "../constants.js";

export function AttributeDropdownBody(props: IAttributeFilterDropdownBodyProps) {
    return <AttributeFilterDropdownBody {...props} width={ATTRIBUTE_DROPDOWN_WIDTH} />;
}
