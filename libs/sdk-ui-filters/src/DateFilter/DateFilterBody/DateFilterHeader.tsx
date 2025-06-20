// (C) 2019-2025 GoodData Corporation
import React from "react";
import { DateFilterRoute } from "./types.js";
import { useUiAutofocusConnectors } from "@gooddata/sdk-ui-kit";

export const DateFilterHeader: React.FC<{
    children: any;
    changeRoute: (route: DateFilterRoute) => void;
}> = ({ children, changeRoute, ...otherProps }) => {
    const autofocusConnectors = useUiAutofocusConnectors<HTMLButtonElement>();

    return (
        <button
            tabIndex={0}
            className="gd-extended-date-filter-header s-do-not-close-dropdown-on-click"
            onClick={(e) => {
                e.preventDefault();
                changeRoute(null);
            }}
            {...otherProps}
            {...autofocusConnectors}
        >
            <span className="gd-icon-navigateleft" />
            &emsp;{children}
        </button>
    );
};
