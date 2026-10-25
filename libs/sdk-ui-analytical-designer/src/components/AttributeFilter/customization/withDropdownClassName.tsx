// (C) 2007-2026 GoodData Corporation

import { type ComponentType } from "react";

import cx from "classnames";

import { type IAttributeFilterDropdownBodyProps } from "@gooddata/sdk-ui-filters";

/**
 * This function customize IAttributeFilterDropdownBody and add wrapper for custom classNames
 */
export function withDropdownClassName(
    BodyComponent: ComponentType<IAttributeFilterDropdownBodyProps>,
    dropdownClassName: string,
) {
    function Component(props: IAttributeFilterDropdownBodyProps) {
        const classNames = cx(dropdownClassName, "s-filter-picker");
        return (
            <div className={classNames}>
                <BodyComponent {...props} />
            </div>
        );
    }

    return Component;
}
