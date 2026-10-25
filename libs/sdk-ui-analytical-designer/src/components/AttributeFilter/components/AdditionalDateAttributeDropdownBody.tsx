// (C) 2007-2026 GoodData Corporation

import {
    AttributeFilterDropdownBody,
    type IAttributeFilterDropdownBodyProps,
} from "@gooddata/sdk-ui-filters";

import { DATE_ATTRIBUTE_DROPDOWN_WIDTH } from "../constants.js";

export function AdditionalDateAttributeDropdownBody(props: IAttributeFilterDropdownBodyProps) {
    return <AttributeFilterDropdownBody {...props} width={DATE_ATTRIBUTE_DROPDOWN_WIDTH} />;
}
