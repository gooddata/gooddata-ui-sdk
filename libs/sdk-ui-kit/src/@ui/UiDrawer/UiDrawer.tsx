// (C) 2025-2026 GoodData Corporation

import { useMemo, useRef } from "react";

import { Portal } from "react-portal";

import { useToggleDrawer } from "./hooks/useToggleDrawer.js";
import { type IUiDrawerProps } from "./types.js";
import { bem } from "../@utils/bem.js";
import { makeDialogKeyboardNavigation } from "../@utils/keyboardNavigation.js";
import { OverlayContent, OverlayProvider } from "../@utils/OverlayStack.js";
import { UiAutofocus } from "../UiFocusManager/UiAutofocus.js";
import { UiFocusTrap } from "../UiFocusManager/UiFocusTrap.js";
import { UiReturnFocusOnUnmount } from "../UiFocusManager/UiReturnFocusOnUnmount.js";
import { UiIconButton } from "../UiIconButton/UiIconButton.js";

const { b, e } = bem("gd-ui-kit-drawer");

/**
 * @internal
 */
export function UiDrawer({
    open,
    zIndex,
    node,
    mode = "absolute",
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
    returnFocusTo,
    accessibilityConfig,
}: IUiDrawerProps) {
    const ref = useRef(null);
    const { isOpen, isFullyOpen, view, style } = useToggleDrawer(open ?? false, transition ?? {});

    const handleKeyDown = useMemo(
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
                    <Portal node={node ?? document.body}>
                        <UiReturnFocusOnUnmount returnFocusTo={returnFocusTo}>
                            <div className={b({ anchor, view })} data-testid={dataTestId} style={{ zIndex }}>
                                <div
                                    className={e("backdrop")}
                                    style={{
                                        position: mode,
                                        ...style,
                                    }}
                                    onClick={onClickOutside}
                                />
                                <UiFocusTrap root={<div />}>
                                    <div
                                        tabIndex={-1}
                                        style={{ position: mode, ...style }}
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
                                        <UiAutofocus
                                            root={<div tabIndex={-1} className={e("scrollable")} />}
                                            active={isFullyOpen}
                                            refocusKey={refocusKey}
                                            initialFocus={initialFocus || ref}
                                        >
                                            {children}
                                        </UiAutofocus>
                                    </div>
                                </UiFocusTrap>
                            </div>
                        </UiReturnFocusOnUnmount>
                    </Portal>
                )}
            </OverlayContent>
        </OverlayProvider>
    );
}
