// (C) 2025 GoodData Corporation

import React, { forwardRef } from "react";

import { UiIconButtonRenderer, UiIconButtonPublicProps } from "../UiIconButton/UiIconButtonRenderer.js";

/**
 * @internal
 */
export interface UiDropdownIconButtonProps extends UiIconButtonPublicProps {
    isDropdownOpen: boolean;
}

/**
 * @internal
 */
export const UiDropdownIconButton = forwardRef<HTMLButtonElement, UiDropdownIconButtonProps>(
    ({ isDropdownOpen, ...props }, ref) => {
        return (
            <UiIconButtonRenderer
                ref={ref}
                {...props}
                iconAfter={isDropdownOpen ? "navigateUp" : "navigateDown"}
                isActive={isDropdownOpen}
            />
        );
    },
);

UiDropdownIconButton.displayName = "UiDropdownIconButton";
