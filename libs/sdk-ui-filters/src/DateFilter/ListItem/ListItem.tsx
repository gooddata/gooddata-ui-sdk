// (C) 2007-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import MediaQuery from "react-responsive";

import { CustomizableCheckmark } from "@gooddata/sdk-ui-kit";

import { MediaQueries } from "../../constants";

export const ListItem: React.FC<{ isSelected?: boolean } & React.HTMLProps<HTMLButtonElement>> = ({
    isSelected: isActive,
    className,
    children,
    ...restProps
}) => (
    <>
        <button
            className={cx(
                "gd-list-item",
                "gd-filter-list-item",
                {
                    "is-selected": isActive,
                    "gd-filter-list-item-selected": isActive,
                },
                className,
            )}
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
