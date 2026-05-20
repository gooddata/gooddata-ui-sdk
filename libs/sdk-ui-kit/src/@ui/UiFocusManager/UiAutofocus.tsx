// (C) 2025-2026 GoodData Corporation

import {
    type ReactElement,
    type ReactNode,
    type RefObject,
    cloneElement,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { getFocusableElements, isElementFocusable, isElementTextInput } from "../../utils/domUtilities.js";

import { type IUiFocusHelperConnectors } from "./types.js";
import { resolveRef } from "./utils.js";

/**
 * @internal
 */
export interface IUiAutofocusOptions {
    active?: boolean;
    refocusKey?: unknown;
    initialFocus?: string | RefObject<HTMLElement | null>;
}

/**
 * Provides a ref that will autofocus the element when it is mounted, or when `refocusKey` changes.
 *
 * @internal
 */
export const useUiAutofocusConnectors = <T extends HTMLElement = HTMLElement>({
    active = true,
    refocusKey,
    initialFocus,
}: IUiAutofocusOptions = {}): IUiFocusHelperConnectors<T> => {
    const [element, setElement] = useState<HTMLElement | null>(null);

    // Skip setState(null) on unmount — the effect cleanup handles observer teardown, and
    // calling setElement(null) during commit would trigger a state update outside act() in tests.
    // On re-mount, the ref callback fires with the new element, setting fresh state.
    const ref = useCallback((el: HTMLElement | null) => {
        if (el) {
            setElement(el);
        }
    }, []);

    // Focus the first focusable inside the wrapper. Robust against slow renders, virtualized lists
    // that recycle DOM nodes, and floating overlays that finish positioning after mount.
    //
    // `.focus()` is a no-op on elements that are not currently focusable (e.g. inside an ancestor
    // with `visibility: hidden`, which Overlay applies until alignment completes). The browser
    // does not throw or fire `focusin` in that case. To handle this we watch two signals:
    //
    //  - IntersectionObserver observes the resolved TARGET — fires when the target moves into the
    //    viewport (e.g. an Overlay completing alignment from off-screen to its real position).
    //    This is the moment `.focus()` will start taking.
    //  - MutationObserver observes the wrapper — fires on descendant additions/removals
    //    (lazy mount, virtualization) and on attribute changes (style/class/inert/hidden/...)
    //    that may affect focusability without a position change.
    //
    // Each signal re-runs `attemptFocus`, which re-resolves the target and re-attaches the
    // IntersectionObserver to it. A single rAF coalesces bursts into one attempt per frame.
    useEffect(() => {
        if (!element || !active) {
            return undefined;
        }

        let rafId = 0;
        let stopped = false;
        let observedTarget: HTMLElement | null = null;

        const intersectionObserver = new IntersectionObserver(() => {
            scheduleAttempt();
        });

        const observeTarget = (newTarget: HTMLElement | null | undefined) => {
            if (newTarget === observedTarget) {
                return;
            }
            if (observedTarget) {
                intersectionObserver.unobserve(observedTarget);
            }
            observedTarget = newTarget ?? null;
            if (observedTarget) {
                intersectionObserver.observe(observedTarget);
            }
        };

        const isFocusSettled = () =>
            element.contains(document.activeElement) || isElementTextInput(document.activeElement);

        const attemptFocus = () => {
            if (isFocusSettled()) {
                return true;
            }
            const target = getElementToFocus(element, initialFocus, true);
            // Always (re-)observe the resolved target; the IntersectionObserver wakes us up when
            // it moves into the viewport — the moment `.focus()` will take after Overlay alignment.
            observeTarget(target);
            if (!target?.isConnected) {
                return false;
            }
            target.focus();
            return document.activeElement === target;
        };

        const scheduleAttempt = () => {
            if (stopped) {
                return;
            }
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                if (attemptFocus()) {
                    stop();
                }
            });
        };

        const stop = () => {
            stopped = true;
            cancelAnimationFrame(rafId);
            mutationObserver.disconnect();
            intersectionObserver.disconnect();
        };

        const mutationObserver = new MutationObserver(scheduleAttempt);
        mutationObserver.observe(element, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["style", "class", "hidden", "inert", "disabled", "tabindex", "aria-hidden"],
        });

        // Initial attempt — fast path when the first focusable is already present and visible.
        scheduleAttempt();

        return stop;
    }, [refocusKey, element, initialFocus, active]);

    return useMemo(() => ({ ref }), [ref]);
};

function getElementToFocus(
    element: HTMLElement | null | undefined,
    initialFocus?: string | RefObject<HTMLElement | null>,
    includeHidden?: boolean,
) {
    const initialFocusElement = resolveRef(initialFocus);
    const elementToCheck = initialFocusElement ?? element;

    return isElementFocusable(elementToCheck, includeHidden)
        ? elementToCheck
        : getFocusableElements(elementToCheck, includeHidden).firstElement;
}

/**
 * Wrapper that focuses the first focusable child when it mounts, or when `refocusKey` changes.
 *
 * @internal
 */
export function UiAutofocus({
    root,
    children,
    ...options
}: {
    root?: ReactElement;
    children: ReactNode;
} & IUiAutofocusOptions) {
    const rootElement = root || <div style={{ display: "contents" }} />;
    const connectors = useUiAutofocusConnectors<HTMLDivElement>(options);

    return cloneElement(rootElement, { ...rootElement.props, ...connectors }, children);
}
