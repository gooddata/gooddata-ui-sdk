// (C) 2025-2026 GoodData Corporation

import { useMemo, useRef } from "react";

import { Portal } from "react-portal";

import { bem } from "../@utils/bem.js";
import { makeDialogKeyboardNavigation } from "../@utils/keyboardNavigation.js";
import { OverlayContent, OverlayProvider } from "../@utils/OverlayStack.js";
import { useElementSize } from "../hooks/useElementSize.js";
import { UiAutofocus } from "../UiFocusManager/UiAutofocus.js";
import { UiFocusTrap } from "../UiFocusManager/UiFocusTrap.js";
import { UiReturnFocusOnUnmount } from "../UiFocusManager/UiReturnFocusOnUnmount.js";
import { UiIconButton } from "../UiIconButton/UiIconButton.js";
import { useToggleDrawer } from "./hooks/useToggleDrawer.js";
import { type IUiDrawerProps } from "./types.js";

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
    showBackdrop = true,
    header,
    onClickClose,
    refocusKey,
    initialFocus,
    returnFocusTo,
    accessibilityConfig,
}: IUiDrawerProps) {
    const ref = useRef(null);

    const { isOpen, isFullyOpen, view, backdropStyle, contentStyle } = useToggleDrawer(
        open ?? false,
        transition ?? {},
        showBackdrop,
    );

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

    const { ref: headerRef, height } = useElementSize<HTMLDivElement>([isOpen, ref.current]);

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
                                        ...backdropStyle,
                                    }}
                                    onClick={onClickOutside}
                                />
                                <UiFocusTrap root={<div />}>
                                    <div
                                        tabIndex={-1}
                                        style={{
                                            position: mode,
                                            ...contentStyle,
                                            ...(height ? { paddingTop: height } : {}),
                                        }}
                                        onKeyDown={handleKeyDown}
                                        role={accessibilityConfig?.role ?? "dialog"}
                                        aria-label={accessibilityConfig?.ariaLabel}
                                        aria-labelledby={accessibilityConfig?.ariaLabelledBy}
                                        aria-describedby={accessibilityConfig?.ariaDescribedBy}
                                        aria-modal="true"
                                        className={e("content", {
                                            showCloseButton: showCloseButton || Boolean(header),
                                        })}
                                        ref={showCloseButton ? undefined : ref}
                                    >
                                        <div className={e("header")} ref={headerRef}>
                                            {header}
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
                                        </div>
                                        <UiAutofocus
                                            root={<div className={e("scrollable")} />}
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
