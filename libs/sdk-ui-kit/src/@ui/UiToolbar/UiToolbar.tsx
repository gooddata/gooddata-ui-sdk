// (C) 2026 GoodData Corporation

import { type ReactNode, forwardRef, useImperativeHandle, useMemo, useRef } from "react";

import { FloatingDelayGroup } from "@floating-ui/react";

import { accessibilityConfigToAttributes } from "../../typings/utilities.js";
import { bem } from "../@utils/bem.js";

import {
    TOOLBAR_TOOLTIP_CLOSE_DELAY,
    TOOLBAR_TOOLTIP_OPEN_DELAY,
    TOOLBAR_TOOLTIP_WARM_TIMEOUT,
} from "./constants.js";
import { type IUiToolbarContextValue, UiToolbarContext, type UiToolbarNamingConfig } from "./context.js";
import { TOOLBAR_ROOT_ATTR } from "./rovingFocusUtils.js";
import { useToolbarRovingFocus } from "./useToolbarRovingFocus.js";

/**
 * @internal
 */
export interface IUiToolbarProps {
    /**
     * The toolbar needs an accessible name.
     */
    accessibilityConfig: UiToolbarNamingConfig;
    children: ReactNode;
    /**
     * Side of the toolbar on which item tooltips open. Use "above" for a toolbar docked at the bottom.
     * @defaultValue "below"
     */
    tooltipPlacement?: "below" | "above";
    /**
     * Keep disabled items reachable with arrow keys.
     * @defaultValue true
     */
    isDisabledFocusable?: boolean;
    /**
     * Wrap from the last item to the first one and back.
     * @defaultValue true
     */
    loop?: boolean;
    dataTestId?: string;
}

const { b } = bem("gd-ui-kit-toolbar");

/**
 * Horizontal toolbar with one tab stop. Arrow keys move between items, Home and End jump to the
 * ends, and the last focused item is remembered when focus leaves and comes back. Inside a
 * {@link UiToolbarSegmentedControl} the arrows change the selection first and continue to the
 * neighbouring item at the ends.
 *
 * Editable values inside a toolbar must be text-like inputs (`type="text"` with an `inputMode`, or
 * a textarea): the arrows move the caret and hand off to the neighbouring item at the text edges.
 * Inputs without a caret API, such as `type="number"`, cannot hand off; wrap such custom controls in
 * an element with {@link TOOLBAR_SKIP_ATTR} so they keep their own keyboard handling.
 *
 * @example
 * ```
 * <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
 *     <UiToolbarIconButton icon="bold" label="Bold" isSelected onClick={toggleBold} />
 *     <UiToolbarDivider />
 *     <UiToolbarButton label="Reset" onClick={reset} />
 * </UiToolbar>
 * ```
 *
 * @internal
 */
export const UiToolbar = forwardRef<HTMLDivElement, IUiToolbarProps>(function UiToolbar(
    {
        accessibilityConfig,
        children,
        tooltipPlacement = "below",
        isDisabledFocusable = true,
        loop = true,
        dataTestId,
    },
    ref,
) {
    const containerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement, []);

    const { onKeyDown, onFocusCapture, onBlurCapture } = useToolbarRovingFocus({
        containerRef,
        isDisabledFocusable,
        loop,
    });

    const contextValue = useMemo<IUiToolbarContextValue>(
        () => ({ tooltipArrowPlacement: tooltipPlacement === "above" ? "bottom" : "top" }),
        [tooltipPlacement],
    );

    return (
        <UiToolbarContext.Provider value={contextValue}>
            <FloatingDelayGroup
                delay={{ open: TOOLBAR_TOOLTIP_OPEN_DELAY, close: TOOLBAR_TOOLTIP_CLOSE_DELAY }}
                timeoutMs={TOOLBAR_TOOLTIP_WARM_TIMEOUT}
            >
                <div
                    ref={containerRef}
                    className={b()}
                    {...accessibilityConfigToAttributes(accessibilityConfig)}
                    role="toolbar"
                    aria-orientation="horizontal"
                    {...{ [TOOLBAR_ROOT_ATTR]: "" }}
                    data-testid={dataTestId}
                    onKeyDown={onKeyDown}
                    onFocusCapture={onFocusCapture}
                    onBlurCapture={onBlurCapture}
                >
                    {children}
                </div>
            </FloatingDelayGroup>
        </UiToolbarContext.Provider>
    );
});
