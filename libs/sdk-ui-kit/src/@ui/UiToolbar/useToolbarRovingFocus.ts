// (C) 2026 GoodData Corporation

import {
    type FocusEvent,
    type KeyboardEvent,
    type RefObject,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
} from "react";

import { useAutoupdateRef } from "@gooddata/sdk-ui";

import { makeHorizontalKeyboardNavigation } from "../@utils/keyboardNavigation.js";

import {
    TOOLBAR_COMPOSITE_ATTR,
    TOOLBAR_SKIP_ATTR,
    applyRovingTabIndex,
    getStopFocusTarget,
    getToolbarStops,
    hasSystemModifier,
    isCaretAtEdge,
    isEditingTarget,
    isEligibleFocusable,
    isSkipped,
    resolveStop,
} from "./rovingFocusUtils.js";

export interface IUseToolbarRovingFocusOptions {
    containerRef: RefObject<HTMLElement | null>;
    isDisabledFocusable: boolean;
    loop: boolean;
}

export interface IUseToolbarRovingFocusResult {
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
    onFocusCapture: (event: FocusEvent<HTMLElement>) => void;
    onBlurCapture: (event: FocusEvent<HTMLElement>) => void;
}

/**
 * Roving tabindex over the focusable descendants of a container, driven by the DOM.
 *
 * Children must not render a tabIndex that changes between renders. React only rewrites the
 * attribute when the prop changes, so a constant value never overrides what this hook writes.
 */
export function useToolbarRovingFocus({
    containerRef,
    isDisabledFocusable,
    loop,
}: IUseToolbarRovingFocusOptions): IUseToolbarRovingFocusResult {
    const rememberedRef = useRef<HTMLElement | null>(null);
    const hadFocusRef = useRef(false);
    const optionsRef = useAutoupdateRef({ isDisabledFocusable, loop });

    const sync = useCallback(() => {
        const container = containerRef.current;
        if (!container) {
            return null;
        }

        return applyRovingTabIndex(container, rememberedRef.current, optionsRef.current);
    }, [containerRef, optionsRef]);

    // Re-applies the tabindexes and, when the focused item stopped being an eligible stop (removed,
    // hidden, disabled, or excluded by an option change), hands focus to the fallback. Browsers move
    // focus to <body> silently on removal; a hidden element may keep it.
    const syncAndRepairFocus = useCallback(() => {
        const container = containerRef.current;
        const remembered = rememberedRef.current;
        const target = sync();
        if (
            !container ||
            !hadFocusRef.current ||
            remembered === null ||
            target === null ||
            target === remembered
        ) {
            return;
        }
        // A subtree that opted out keeps its focus; it only leaves the roving management.
        if (isSkipped(container, remembered)) {
            return;
        }

        const rememberedIsGone = !isEligibleFocusable(container, remembered, optionsRef.current);
        const active = document.activeElement;
        const focusWasLost = active === null || active === document.body || active === remembered;
        if (rememberedIsGone && focusWasLost) {
            target.focus();
        }
    }, [containerRef, optionsRef, sync]);

    useLayoutEffect(() => {
        syncAndRepairFocus();
    });

    // Media queries can hide an item without any DOM mutation; a viewport change is the cue.
    useEffect(() => {
        window.addEventListener("resize", syncAndRepairFocus);
        return () => window.removeEventListener("resize", syncAndRepairFocus);
    }, [syncAndRepairFocus]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || typeof MutationObserver === "undefined") {
            return undefined;
        }

        const observer = new MutationObserver(syncAndRepairFocus);

        // "tabindex" is excluded so the observer does not react to its own writes. "class" and
        // "style" are included because CSS can hide an item.
        observer.observe(container, {
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
                // Attributes that make an element focusable or not.
                "href",
                "contenteditable",
                "type",
                "role",
                TOOLBAR_COMPOSITE_ATTR,
                TOOLBAR_SKIP_ATTR,
            ],
        });

        return () => observer.disconnect();
    }, [containerRef, syncAndRepairFocus]);

    const onFocusCapture = useCallback(
        (event: FocusEvent<HTMLElement>) => {
            const container = containerRef.current;
            // Portaled popups bubble React focus events through the toolbar tree.
            if (!container || !container.contains(event.target)) {
                return;
            }

            rememberedRef.current = event.target;
            hadFocusRef.current = true;
            sync();
        },
        [containerRef, sync],
    );

    const onBlurCapture = useCallback(
        (event: FocusEvent<HTMLElement>) => {
            const container = containerRef.current;
            if (!container) {
                return;
            }

            const next = event.relatedTarget;
            const leftToOutside = next instanceof Node && !container.contains(next);
            // A null relatedTarget with the item still mounted is a click on non-focusable content.
            const leftToNothing = next === null && (event.target as Node).isConnected;
            if (leftToOutside || leftToNothing) {
                hadFocusRef.current = false;
            }
        },
        [containerRef],
    );

    const moveTo = useCallback(
        (index: number) => {
            const container = containerRef.current;
            if (!container) {
                return;
            }

            const stops = getToolbarStops(container, optionsRef.current);
            const stop = stops.at(index);
            if (!stop) {
                return;
            }

            getStopFocusTarget(stop, null, optionsRef.current)?.focus();
        },
        [containerRef, optionsRef],
    );

    const moveBy = useCallback(
        (delta: 1 | -1) => {
            const container = containerRef.current;
            if (!container) {
                return;
            }

            const stops = getToolbarStops(container, optionsRef.current);
            const current = resolveStop(container, document.activeElement);
            const index = current ? stops.indexOf(current) : -1;

            if (index === -1) {
                moveTo(0);
                return;
            }

            const last = stops.length - 1;
            const next = optionsRef.current.loop
                ? (index + delta + stops.length) % stops.length
                : Math.min(last, Math.max(0, index + delta));

            moveTo(next);
        },
        [containerRef, moveTo, optionsRef],
    );

    const navigate = useMemo(
        () =>
            makeHorizontalKeyboardNavigation<KeyboardEvent<HTMLElement>>({
                onFocusPrevious: () => moveBy(-1),
                onFocusNext: () => moveBy(1),
                onFocusFirst: () => moveTo(0),
                onFocusLast: () => moveTo(-1),
            }),
        [moveBy, moveTo],
    );

    const onKeyDown = useCallback(
        (event: KeyboardEvent<HTMLElement>) => {
            const container = containerRef.current;
            const target = event.target;

            if (!container || !(target instanceof HTMLElement) || !container.contains(target)) {
                return;
            }
            // A skipped subtree owns its own keyboard handling. While an IME is composing, the
            // arrows walk its candidate list, so the toolbar keeps its hands off every key.
            if (
                event.defaultPrevented ||
                event.nativeEvent.isComposing ||
                hasSystemModifier(event) ||
                isSkipped(container, target)
            ) {
                return;
            }
            // Inside a text input the keys move the caret; a horizontal arrow at the edge of the
            // text is the way out to the neighbouring item.
            if (isEditingTarget(target)) {
                const isEdgeExit =
                    (event.code === "ArrowLeft" || event.code === "ArrowRight") &&
                    isCaretAtEdge(target, event.code);
                if (!isEdgeExit) {
                    return;
                }
            }

            navigate(event);
        },
        [containerRef, navigate],
    );

    return { onKeyDown, onFocusCapture, onBlurCapture };
}
