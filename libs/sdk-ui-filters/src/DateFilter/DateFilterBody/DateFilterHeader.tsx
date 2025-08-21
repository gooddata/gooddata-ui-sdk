// (C) 2019-2025 GoodData Corporation
import React from "react";

import { useUiAutofocusConnectors } from "@gooddata/sdk-ui-kit";

import { DateFilterRoute } from "./types.js";

export function DateFilterHeader({
    children,
    changeRoute,
    ...otherProps
}: {
    children: any;
    changeRoute: (route: DateFilterRoute) => void;
}) {
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
}
