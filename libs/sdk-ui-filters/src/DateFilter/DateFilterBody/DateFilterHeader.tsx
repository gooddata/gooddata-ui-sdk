// (C) 2019-2025 GoodData Corporation
import React from "react";

import { useUiAutofocusConnectors } from "@gooddata/sdk-ui-kit";

export function DateFilterHeader({
    onBack,
    title,
    ariaLabel,
    ...otherProps
}: {
    title: string;
    onBack: () => void;
    ariaLabel?: string;
}) {
    const autofocusConnectors = useUiAutofocusConnectors<HTMLButtonElement>();

    return (
        <button
            tabIndex={0}
            className="gd-extended-date-filter-header s-do-not-close-dropdown-on-click"
            onClick={(e) => {
                e.preventDefault();
                onBack();
            }}
            aria-label={ariaLabel}
            {...otherProps}
            {...autofocusConnectors}
        >
            <span className="gd-icon-navigateleft" />
            &emsp;{title}
        </button>
    );
}
