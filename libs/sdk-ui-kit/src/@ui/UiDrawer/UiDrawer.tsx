// (C) 2025 GoodData Corporation

import React from "react";

import { Portal } from "react-portal";

import { useToggleDrawer } from "./hooks/useToggleDrawer.js";
import { UiDrawerProps } from "./types.js";
import { bem } from "../@utils/bem.js";
import { makeDialogKeyboardNavigation } from "../@utils/keyboardNavigation.js";
import { OverlayContent, OverlayProvider } from "../@utils/OverlayStack.js";
import { UiAutofocus } from "../UiFocusManager/UiAutofocus.js";
import { UiFocusTrap } from "../UiFocusManager/UiFocusTrap.js";
import { UiIconButton } from "../UiIconButton/UiIconButton.js";

const { b, e } = bem("gd-ui-kit-drawer");

/**
 * @internal
 */
export function UiDrawer({
    open,
    zIndex,
    dataTestId,
    children,
    anchor = "right",
    transition,
    onEscapeKey,
    onClickOutside,
    closeLabel = "Close",
    showCloseButton = true,
    onClickClose,
    refocusKey,
    initialFocus,
    forceFocusRetry,
    accessibilityConfig,
}: UiDrawerProps) {
    const ref = React.useRef(null);
    const { isOpen, view, style } = useToggleDrawer(open, transition);

    const handleKeyDown = React.useMemo(
        () =>
            makeDialogKeyboardNavigation(
                {
                    onClose: onEscapeKey,
                },
                {
                    shouldPreventDefault: true,
                    shouldStopPropagation: true,
                },
            ),
        [onEscapeKey],
    );

    if (!isOpen) {
        return null;
    }

    return (
        <OverlayProvider zIndex={zIndex}>
            <OverlayContent>
                {({ zIndex }) => (
                    <Portal>
                        <UiAutofocus
                            refocusKey={refocusKey}
                            forceFocusRetry={forceFocusRetry}
                            initialFocus={initialFocus || ref}
                        >
                            <div className={b({ anchor, view })} data-testid={dataTestId} style={{ zIndex }}>
                                <div className={e("backdrop")} style={style} onClick={onClickOutside} />
                                <UiFocusTrap>
                                    <div
                                        tabIndex={-1}
                                        style={style}
                                        onKeyDown={handleKeyDown}
                                        role={accessibilityConfig?.role ?? "dialog"}
                                        aria-label={accessibilityConfig?.ariaLabel}
                                        aria-labelledby={accessibilityConfig?.ariaLabelledBy}
                                        aria-describedby={accessibilityConfig?.ariaDescribedBy}
                                        aria-modal="true"
                                        className={e("content", { showCloseButton })}
                                        ref={showCloseButton ? undefined : ref}
                                    >
                                        {showCloseButton ? (
                                            <div className={e("close-button")}>
                                                <UiIconButton
                                                    label={closeLabel}
                                                    icon="close"
                                                    variant="tertiary"
                                                    onClick={onClickClose}
                                                    ref={ref}
                                                />
                                            </div>
                                        ) : null}
                                        <div tabIndex={-1} className={e("scrollable")}>
                                            {children}
                                        </div>
                                    </div>
                                </UiFocusTrap>
                            </div>
                        </UiAutofocus>
                    </Portal>
                )}
            </OverlayContent>
        </OverlayProvider>
    );
}
