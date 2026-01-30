// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent, type RefObject, useCallback, useMemo, useRef } from "react";

import { usePropState } from "@gooddata/sdk-ui";

import {
    type IUiDropdownBodyRenderProps,
    type IUiDropdownButtonRenderProps,
    type IUiDropdownProps,
} from "./types.js";
import { isElementTextInput } from "../../utils/domUtilities.js";
import { useId } from "../../utils/useId.js";
import { bem } from "../@utils/bem.js";
import { UiFloatingElement } from "../UiFloatingElement/UiFloatingElement.js";
import { UiFocusManager } from "../UiFocusManager/UiFocusManager.js";
import { resolveRef } from "../UiFocusManager/utils.js";

const { e } = bem("gd-ui-kit-dropdown");

// Stable empty array to avoid re-creating on every render
const EMPTY_IGNORE_CLICKS_ON: string[] = [];

/**
 * A dropdown component that combines a trigger button with a floating body.
 * Built on top of UiFloatingElement for positioning.
 *
 * @remarks
 * This component provides a similar API to the legacy Dropdown component
 * but uses floating-ui for positioning instead of the custom Overlay component.
 *
 * Key features:
 * - Render prop pattern for flexible button and body rendering
 * - Full accessibility support with ARIA attributes
 * - Focus management with trapping and return focus
 * - Support for legacy align points
 *
 * @internal
 */
export function UiDropdown({
    renderButton,
    renderBody,
    isOpen: isOpenProp,
    onOpenChange,
    openOnInit = false,
    placement = "bottom-start",
    offset,
    alignPoints,
    closeOnOutsideClick = true,
    closeOnEscape = false,
    closeOnParentScroll = false,
    closeOnMouseDrag = false,
    ignoreClicksOnByClass = EMPTY_IGNORE_CLICKS_ON,
    zIndex,
    width,
    fullWidthButton,
    enableFocusTrap = true,
    autofocusOnOpen = false,
    initialFocus,
    returnFocusTo,
    onOpen,
    onClose,
    accessibilityConfig,
}: IUiDropdownProps) {
    const [isOpen, setIsOpen] = usePropState(isOpenProp ?? openOnInit);
    const buttonWrapperRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLElement>(null);

    const id = useId();
    const dropdownId = `dropdown-${id}`;
    const buttonId = `dropdown-button-${id}`;

    const openDropdown = useCallback(() => {
        if (onOpenChange) {
            onOpenChange(true);
        } else {
            setIsOpen(true);
        }
        onOpen?.();
    }, [onOpenChange, setIsOpen, onOpen]);

    const closeDropdown = useCallback(() => {
        if (onOpenChange) {
            onOpenChange(false);
        } else {
            setIsOpen(false);
        }
        onClose?.();
    }, [onOpenChange, setIsOpen, onClose]);

    const toggleDropdown = useCallback(() => {
        if (isOpen) {
            closeDropdown();
        } else {
            openDropdown();
        }
    }, [isOpen, openDropdown, closeDropdown]);

    const handleTabOut = useCallback(() => {
        closeDropdown();
        resolveRef(returnFocusTo)?.focus();
    }, [closeDropdown, returnFocusTo]);

    // Keyboard handler for the button wrapper
    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
            const isInputFocused = isElementTextInput(document.activeElement);

            if (event.code === "Enter" || (event.code === "Space" && !isInputFocused)) {
                toggleDropdown();
                event.preventDefault();
                event.stopPropagation();
            }
            if (event.code === "ArrowUp" && isOpen) {
                closeDropdown();
                event.preventDefault();
                event.stopPropagation();
            }
            if (event.code === "ArrowDown" && !isOpen) {
                openDropdown();
                event.preventDefault();
                event.stopPropagation();
            }
        },
        [isOpen, toggleDropdown, closeDropdown, openDropdown],
    );

    // Button render props
    const buttonRenderProps = useMemo<IUiDropdownButtonRenderProps>(() => {
        const triggerRole = accessibilityConfig?.triggerRole ?? "button";
        const popupRole = accessibilityConfig?.popupRole ?? "dialog";

        return {
            ref: buttonRef as RefObject<HTMLElement>,
            isOpen,
            dropdownId,
            openDropdown,
            closeDropdown,
            toggleDropdown,
            ariaAttributes: {
                role: triggerRole,
                "aria-haspopup": popupRole,
                "aria-expanded": isOpen,
                "aria-controls": isOpen ? dropdownId : undefined,
            },
        };
    }, [
        isOpen,
        dropdownId,
        openDropdown,
        closeDropdown,
        toggleDropdown,
        accessibilityConfig?.triggerRole,
        accessibilityConfig?.popupRole,
    ]);

    // Body render props
    const bodyRenderProps = useMemo<IUiDropdownBodyRenderProps>(
        () => ({
            closeDropdown,
            ariaAttributes: {
                id: dropdownId,
            },
        }),
        [closeDropdown, dropdownId],
    );

    return (
        <>
            <div
                ref={buttonWrapperRef}
                id={buttonId}
                className={e("button", { fullWidth: !!fullWidthButton })}
                onKeyDown={handleKeyDown}
            >
                {renderButton(buttonRenderProps)}
            </div>

            <UiFloatingElement
                anchor={buttonWrapperRef}
                isOpen={isOpen}
                onClose={closeDropdown}
                placement={placement}
                offset={offset}
                alignPoints={alignPoints}
                closeOnOutsideClick={closeOnOutsideClick}
                closeOnEscape={closeOnEscape}
                closeOnParentScroll={closeOnParentScroll}
                closeOnMouseDrag={closeOnMouseDrag}
                ignoreClicksOn={ignoreClicksOnByClass}
                zIndex={zIndex}
                width={width}
                accessibilityConfig={{
                    role: accessibilityConfig?.popupRole ?? "dialog",
                    ariaLabelledBy: buttonId,
                }}
            >
                <UiFocusManager
                    tabOutHandler={enableFocusTrap ? undefined : handleTabOut}
                    enableFocusTrap={enableFocusTrap}
                    enableAutofocus={autofocusOnOpen ? { initialFocus } : false}
                    enableReturnFocusOnUnmount={{ returnFocusTo: returnFocusTo ?? buttonRef }}
                >
                    <div className={e("body")}>{renderBody(bodyRenderProps)}</div>
                </UiFocusManager>
            </UiFloatingElement>
        </>
    );
}
