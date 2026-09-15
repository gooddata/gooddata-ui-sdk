// (C) 2026 GoodData Corporation

import {
    type KeyboardEvent,
    type ReactNode,
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
} from "react";

import { useAutoupdateRef } from "@gooddata/sdk-ui";

import { accessibilityConfigToAttributes } from "../../typings/utilities.js";
import { bem } from "../@utils/bem.js";
import { makeRadioGroupKeyboardNavigation } from "../@utils/keyboardNavigation.js";
import { type UiToolbarNamingConfig } from "../UiToolbar/context.js";
import {
    TOOLBAR_COMPOSITE_ATTR,
    TOOLBAR_ROOT_ATTR,
    hasSystemModifier,
    isEligibleFocusable,
} from "../UiToolbar/rovingFocusUtils.js";

import {
    type IUiToolbarSegmentedControlContextValue,
    type UiToolbarSegmentedControlChangeEvent,
    UiToolbarSegmentedControlContext,
} from "./context.js";

/**
 * @internal
 */
export interface IUiToolbarSegmentedControlProps {
    value: string | undefined;
    onChange: (value: string, event: UiToolbarSegmentedControlChangeEvent) => void;
    /**
     * The group needs an accessible name.
     */
    accessibilityConfig: UiToolbarNamingConfig;
    isDisabled?: boolean;
    /**
     * Two to five {@link UiToolbarButton} or {@link UiToolbarIconButton} items, each with a `value`.
     */
    children: ReactNode;
    dataTestId?: string;
}

const { b } = bem("gd-ui-kit-toolbar-segmented-control");

// Decided from the DOM: a group rendered through a portal shares the toolbar's React tree but not
// its element tree, and only the element tree is what the toolbar's roving tabindex reaches. Only a
// UiToolbar manages the group; any other role="toolbar" ancestor does not.
function isInsideToolbar(group: HTMLElement): boolean {
    return group.parentElement?.closest(`[${TOOLBAR_ROOT_ATTR}]`) != null;
}

function getRadios(group: HTMLElement): HTMLElement[] {
    return Array.from(group.querySelectorAll<HTMLElement>('[role="radio"]'));
}

const NAVIGABLE_RADIO = { isDisabledFocusable: false };

/**
 * A radio the arrows may land on: rendered, visible and not disabled.
 */
function isNavigableRadio(group: HTMLElement, radio: HTMLElement): boolean {
    return isEligibleFocusable(group, radio, NAVIGABLE_RADIO);
}

/**
 * Next enabled radio in the given direction. Wraps when `loop` is set, otherwise returns null at the ends.
 */
function findNextRadio(
    group: HTMLElement,
    radios: HTMLElement[],
    from: number,
    delta: 1 | -1,
    loop: boolean,
): HTMLElement | null {
    // The current radio is never a candidate, so a wrap-around cannot re-select the same value.
    const maxStep = from >= 0 ? radios.length - 1 : radios.length;
    for (let step = 1; step <= maxStep; step++) {
        const index = from + step * delta;
        if (!loop && (index < 0 || index >= radios.length)) {
            return null;
        }
        const candidate = radios[(index + radios.length) % radios.length];
        if (candidate && isNavigableRadio(group, candidate)) {
            return candidate;
        }
    }
    return null;
}

/**
 * Mutually exclusive choices rendered as one borderless strip. Arrow keys move the selection and
 * the focus; the whole group is one tab stop. Standalone the arrows wrap; inside a {@link UiToolbar}
 * they continue to the neighbouring toolbar item at the ends.
 *
 * @example
 * ```
 * <UiToolbarSegmentedControl value={mode} onChange={setMode} accessibilityConfig={{ ariaLabel: "Scope" }}>
 *     <UiToolbarButton value="cell" label="Cell" />
 *     <UiToolbarButton value="row" label="Row" />
 * </UiToolbarSegmentedControl>
 * ```
 *
 * @internal
 */
export const UiToolbarSegmentedControl = forwardRef<HTMLDivElement, IUiToolbarSegmentedControlProps>(
    function UiToolbarSegmentedControl(
        { value, onChange, accessibilityConfig, isDisabled = false, children, dataTestId },
        ref,
    ) {
        const groupRef = useRef<HTMLDivElement>(null);
        useImperativeHandle(ref, () => groupRef.current as HTMLDivElement, []);

        const onChangeRef = useAutoupdateRef(onChange);

        const contextValue = useMemo<IUiToolbarSegmentedControlContextValue>(
            () => ({ value, onChange, isDisabled }),
            [value, onChange, isDisabled],
        );

        // Standalone the group owns the roving tabindex; inside a toolbar the toolbar does. Decided
        // from the DOM, because a group rendered through a portal shares the toolbar's React tree
        // but not its element tree.
        const syncStandaloneTabIndex = useCallback(() => {
            const group = groupRef.current;
            if (!group || isInsideToolbar(group)) {
                return;
            }

            const radios = getRadios(group).filter((radio) => isNavigableRadio(group, radio));
            const target = radios.find((radio) => radio.getAttribute("aria-checked") === "true") ?? radios[0];

            for (const radio of getRadios(group)) {
                radio.tabIndex = radio === target ? 0 : -1;
            }
        }, []);

        useLayoutEffect(() => {
            syncStandaloneTabIndex();
        });

        // Media queries can hide a radio without a render; a viewport change is the cue.
        useEffect(() => {
            window.addEventListener("resize", syncStandaloneTabIndex);
            return () => window.removeEventListener("resize", syncStandaloneTabIndex);
        }, [syncStandaloneTabIndex]);

        // A radio can change its own eligibility without re-rendering the group.
        useEffect(() => {
            const group = groupRef.current;
            if (!group || typeof MutationObserver === "undefined") {
                return undefined;
            }
            const observer = new MutationObserver(syncStandaloneTabIndex);
            observer.observe(group, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: [
                    "disabled",
                    "aria-disabled",
                    "aria-checked",
                    "aria-hidden",
                    "hidden",
                    "class",
                    "style",
                ],
            });
            return () => observer.disconnect();
        }, [syncStandaloneTabIndex]);

        const onKeyDown = useMemo(() => {
            const step = (event: KeyboardEvent<HTMLDivElement>, delta: 1 | -1) => {
                const group = groupRef.current;
                if (!group || event.defaultPrevented || hasSystemModifier(event)) {
                    return;
                }

                const radios = getRadios(group);
                const current = (event.target as HTMLElement).closest<HTMLElement>('[role="radio"]');
                const index = current ? radios.indexOf(current) : -1;
                // Only the horizontal keys mean something to the enclosing toolbar, so only they hand
                // off at the ends; vertical keys keep cycling inside the group.
                const isHorizontal = event.code === "ArrowLeft" || event.code === "ArrowRight";
                const loop = !isInsideToolbar(group) || !isHorizontal;
                const next = findNextRadio(group, radios, index, delta, loop);
                const nextValue = next?.dataset["value"];

                if (!next || nextValue === undefined) {
                    // Only a horizontal key at the end of a toolbar group is handed on; every other
                    // arrow stays contained in the group so it cannot scroll the page.
                    if (loop) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                onChangeRef.current(nextValue, event);
                next.focus();
            };

            return makeRadioGroupKeyboardNavigation<KeyboardEvent<HTMLDivElement>>(
                {
                    onFocusPrevious: (event) => step(event, -1),
                    onFocusNext: (event) => step(event, 1),
                },
                { shouldPreventDefault: false, shouldStopPropagation: false },
            );
        }, [onChangeRef]);

        return (
            <UiToolbarSegmentedControlContext.Provider value={contextValue}>
                <div
                    ref={groupRef}
                    className={b()}
                    {...accessibilityConfigToAttributes(accessibilityConfig)}
                    role="radiogroup"
                    aria-disabled={isDisabled || undefined}
                    data-testid={dataTestId}
                    onKeyDown={onKeyDown}
                    {...{ [TOOLBAR_COMPOSITE_ATTR]: "" }}
                >
                    {children}
                </div>
            </UiToolbarSegmentedControlContext.Provider>
        );
    },
);
