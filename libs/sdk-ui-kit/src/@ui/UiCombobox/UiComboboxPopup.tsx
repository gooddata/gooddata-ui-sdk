// (C) 2025-2026 GoodData Corporation

import { type CSSProperties, type ReactNode } from "react";

import { UiFloatingPanel } from "../UiFloatingPanel/UiFloatingPanel.js";

import { useComboboxState } from "./UiComboboxContext.js";

/** @internal */
export interface IUiComboboxPopupProps {
    children?: ReactNode;
    style?: CSSProperties;
}

/** @internal */
export function UiComboboxPopup({ children, style }: IUiComboboxPopupProps) {
    const { isOpen, setIsOpen, anchorRef, shouldRenderPopup } = useComboboxState();

    if (!shouldRenderPopup) {
        return null;
    }

    return (
        <UiFloatingPanel
            anchor={anchorRef}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            placement="bottom-start"
            width="same-as-anchor"
            padding="listbox"
            closeOnOutsideClick
            accessibilityConfig={{ role: undefined }}
            style={style}
        >
            {/* Prevent input blur on listbox option mousedown so the click
                lands while the popup is still open. */}
            <div onMouseDown={(event) => event.preventDefault()}>{children}</div>
        </UiFloatingPanel>
    );
}
