// (C) 2025-2026 GoodData Corporation

import { forwardRef } from "react";

import { type IUiIconButtonPublicProps, UiIconButtonRenderer } from "../UiIconButton/UiIconButtonRenderer.js";

/**
 * @internal
 */
export interface IUiDropdownIconButtonProps extends IUiIconButtonPublicProps {
    isDropdownOpen: boolean;
}

/**
 * @internal
 */
export const UiDropdownIconButton = forwardRef<HTMLButtonElement, IUiDropdownIconButtonProps>(
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
