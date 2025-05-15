// (C) 2007-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import DefaultMediaQuery from "react-responsive";
import { defaultImport } from "default-import";
import { CustomizableCheckmark } from "@gooddata/sdk-ui-kit";
import { MediaQueries } from "../../constants/index.js";
import { DATE_FILTER_SELECTED_LIST_ITEM_ID } from "../accessibility/elementId.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const MediaQuery = defaultImport(DefaultMediaQuery);

export const ListItem: React.FC<{ isSelected?: boolean } & React.HTMLProps<HTMLButtonElement>> = ({
    isSelected: isActive,
    className,
    children,
    ...restProps
}) => (
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
            tabIndex={isActive ? 0 : -1}
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
