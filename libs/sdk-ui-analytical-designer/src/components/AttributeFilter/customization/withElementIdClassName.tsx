// (C) 2007-2026 GoodData Corporation

import cx from "classnames";

import {
    AttributeFilterElementsSelectItem,
    type IAttributeFilterElementsSelectItemProps,
} from "@gooddata/sdk-ui-filters";

import { getIdFromElement } from "../../../models/decorated_attribute_elements.js";

/**
 * This function customize AttributeFilterElementsSelectItem and add wrapped s-class for each AttributeFilter Item
 */
export function withElementIdClassName(props: IAttributeFilterElementsSelectItemProps) {
    const { item } = props;

    const id = getIdFromElement(item);
    const classNameByID = `s-id-${id}`;

    return (
        <div className={cx("s-filter-item", classNameByID)}>
            <AttributeFilterElementsSelectItem {...props} />
        </div>
    );
}
