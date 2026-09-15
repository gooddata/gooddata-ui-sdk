// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent } from "react";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { type IUiDropdownButtonRenderProps } from "../UiDropdown/types.js";

/**
 * Props every interactive toolbar item shares.
 *
 * @internal
 */
export interface IUiToolbarItemBaseProps {
    /**
     * Identifies the item inside a {@link UiToolbarSegmentedControl}.
     */
    value?: string;
    /**
     * Toggle state, exposed as `aria-pressed`. Inside a segmented control the group's value wins.
     */
    isSelected?: boolean;
    isDestructive?: boolean;
    isDisabled?: boolean;
    /**
     * Pressed look held while a popup opened by the item is on screen.
     */
    isActive?: boolean;
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
    id?: string;
    dataId?: string;
    dataTestId?: string;
    accessibilityConfig?: IAccessibilityConfigBase;
    /**
     * Attributes from the `renderButton` callback of {@link UiDropdown}.
     */
    ariaAttributes?: IUiDropdownButtonRenderProps["ariaAttributes"];
}
