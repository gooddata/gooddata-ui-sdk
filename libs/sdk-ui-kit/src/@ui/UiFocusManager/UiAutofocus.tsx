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

import {
    canStealFocusFrom,
    getFocusableElements,
    isElementFocusable,
    isElementTextInput,
} from "../../utils/domUtilities.js";

import { type IUiFocusHelperConnectors } from "./types.js";
import { isOwnershipAwareModal, useUiModalOwners } from "./UiModalOwner.js";
import { resolveRef } from "./utils.js";

/**
 * @internal
 */
export interface IUiAutofocusOptions {
    active?: boolean;
    refocusKey?: unknown;
    initialFocus?: string | RefObject<HTMLElement | null>;
    /**
     * CSS selectors or DOM elements from which autofocus may take text-entry focus.
     * Matches the focused element or its ancestors. Defaults to no exceptions.
     * Focus within this autofocus area or an unrelated modal remains protected.
     */
    stealFocusFrom?: readonly (string | HTMLElement)[];
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
    stealFocusFrom,
}: IUiAutofocusOptions = {}): IUiFocusHelperConnectors<T> => {
    const [element, setElement] = useState<HTMLElement | null>(null);
    const [modalsBeforeMount] = useState(getOpenModals);
    const owners = useUiModalOwners();

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

        const isFocusSettled = () => {
            const focusedElement = document.activeElement;
            return (
                element.contains(focusedElement) ||
                (isElementTextEntry(focusedElement) && !canStealFocusFrom(focusedElement, stealFocusFrom)) ||
                isFocusInModalItDoesNotBelongTo(element, owners, modalsBeforeMount)
            );
        };

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
    }, [refocusKey, element, initialFocus, active, owners, modalsBeforeMount, stealFocusFrom]);

    return useMemo(() => ({ ref, element: element as T }), [ref, element]);
};

// A field the user is typing into (or that focused itself, such as a search field with `autofocus`)
// already holds focus on purpose, so autofocus elsewhere must not take it away unless explicitly allowed.
// Search inputs count too:
// `isElementTextInput` leaves them out because it also decides whether Enter submits a dialog.
function isElementTextEntry(element: Element | null): boolean {
    return (
        isElementTextInput(element) ||
        (element instanceof HTMLInputElement && element.type.toLowerCase() === "search")
    );
}

const MODAL_SELECTOR = '[aria-modal="true"]';

function getOpenModals(): Set<Element> {
    return typeof document === "undefined" ? new Set() : new Set(document.querySelectorAll(MODAL_SELECTOR));
}

function isFocusInModalItDoesNotBelongTo(
    element: HTMLElement,
    owners: readonly Element[],
    modalsBeforeMount: Set<Element>,
): boolean {
    const modal = document.activeElement?.closest(MODAL_SELECTOR);
    if (!modal || modal.contains(element)) {
        return false;
    }
    if (isOwnershipAwareModal(modal)) {
        // Opened from inside the modal (e.g. a menu portaled out of it) — take focus.
        if (owners.includes(modal)) {
            return false;
        }
        // Not opened from it — only another dialog stacked on top of it may take focus,
        // never unrelated content outside any dialog, such as a background panel. The autofocus
        // area can sit inside that dialog or wrap it (DialogBase puts its focus manager around it).
        if (!isInOrWrapsDialog(element)) {
            return true;
        }
    }
    // Otherwise take focus only when stacked on top of a modal that was already open, such as
    // a dialog opened from another dialog; never from a modal opened later or one stacked above.
    return (
        !modalsBeforeMount.has(modal) ||
        !!(element.compareDocumentPosition(modal) & Node.DOCUMENT_POSITION_FOLLOWING)
    );
}

// Any dialog counts, not only `aria-modal` ones: some dialogs opened from a modal (e.g. the
// scheduled export form) are plain `role="dialog"` elements with their own focus trap.
const DIALOG_SELECTOR = `${MODAL_SELECTOR}, [role="dialog"], [role="alertdialog"]`;

function isInOrWrapsDialog(element: HTMLElement): boolean {
    return !!element.closest(DIALOG_SELECTOR) || !!element.querySelector(DIALOG_SELECTOR);
}

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
