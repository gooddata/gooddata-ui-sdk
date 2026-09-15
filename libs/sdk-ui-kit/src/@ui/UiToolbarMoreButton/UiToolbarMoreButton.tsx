// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, type ReactNode, forwardRef } from "react";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { type IconType } from "../@types/icon.js";
import { type IUiDropdownButtonRenderProps } from "../UiDropdown/types.js";
import { UiToolbarIconButton } from "../UiToolbarIconButton/UiToolbarIconButton.js";

/**
 * @internal
 */
export interface IUiToolbarMoreButtonProps {
    /**
     * Accessible name, for example "More actions". It is also the tooltip text.
     */
    label: string;
    /**
     * @defaultValue "ellipsis"
     */
    icon?: IconType | ReactNode;
    /**
     * Held while the menu is on screen.
     * @defaultValue false
     */
    isOpen?: boolean;
    isDisabled?: boolean;
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
    id?: string;
    dataId?: string;
    dataTestId?: string;
    accessibilityConfig?: IAccessibilityConfigBase;
    /**
     * Attributes from the `renderButton` callback of {@link UiDropdown}. Without them the trigger
     * announces a menu popup.
     */
    ariaAttributes?: IUiDropdownButtonRenderProps["ariaAttributes"];
}

/**
 * Overflow trigger of a toolbar. Build the menu it opens from {@link UiMenu} in a {@link UiDropdown}.
 *
 * @internal
 */
export const UiToolbarMoreButton = forwardRef<HTMLButtonElement, IUiToolbarMoreButtonProps>(
    function UiToolbarMoreButton({ icon = "ellipsis", isOpen = false, ariaAttributes, ...props }, ref) {
        return (
            <UiToolbarIconButton
                ref={ref}
                icon={icon}
                isActive={isOpen}
                ariaAttributes={
                    ariaAttributes ?? { role: "button", "aria-haspopup": "menu", "aria-expanded": isOpen }
                }
                {...props}
            />
        );
    },
);
