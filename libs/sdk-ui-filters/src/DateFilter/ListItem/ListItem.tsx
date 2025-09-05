// (C) 2007-2025 GoodData Corporation
import React from "react";

import cx from "classnames";
import { MediaQuery } from "react-responsive";

import { CustomizableCheckmark } from "@gooddata/sdk-ui-kit";

import { MediaQueries } from "../../constants/index.js";
import { DATE_FILTER_SELECTED_LIST_ITEM_ID } from "../accessibility/elementId.js";

export function ListItem({
    isSelected: isActive,
    isFocusFallback,
    className,
    children,
    ...restProps
}: { isSelected?: boolean; isFocusFallback?: boolean } & React.HTMLProps<HTMLButtonElement>) {
    return (
        <>
            <button
                id={isActive ? DATE_FILTER_SELECTED_LIST_ITEM_ID : undefined}
                role="option"
                className={cx(
                    "gd-list-item",
                    "gd-filter-list-item",
                    {
                        "is-selected": isActive,
                        "gd-filter-list-item-selected": isActive,
                    },
                    className,
                )}
                tabIndex={isActive || isFocusFallback ? 0 : -1}
                aria-selected={isActive}
                {...(restProps as any)}
            >
                {children}
                {isActive ? (
                    <MediaQuery query={MediaQueries.IS_MOBILE_DEVICE}>
                        <CustomizableCheckmark className="gd-customizable-checkmark-mobile-date-filter" />
                    </MediaQuery>
                ) : null}
            </button>
        </>
    );
}
