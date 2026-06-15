// (C) 2025-2026 GoodData Corporation

import { type RefObject, useCallback, useEffect } from "react";

import { type ReferenceType } from "@floating-ui/react";

import { isClickOnIgnoredElement } from "../UiFloatingElement/utils.js";

// Stable empty array to avoid re-creating on every render
const EMPTY_IGNORE_CLICKS_ON: Array<string | HTMLElement> = [];

/**
 * Data attribute to identify elements that should not trigger outside click closure.
 *
 * @internal
 */
export const FLOATING_ELEMENT_DATA_ATTR = "data-gd-floating-element";

/**
 * Module-scope registry tracking each floating panel's anchor (reference)
 * element. Lets `useCloseOnOutsideClick` distinguish a NESTED child popup
 * (whose anchor lives inside our floating element) from an unrelated SIBLING
 * popup that happens to be open at the same time — DOM containment alone
 * can't tell them apart because both portal to `body`.
 *
 * @internal
 */
const floatingPanelAnchors = new WeakMap<Element, Element>();

/**
 * Register a floating panel ↔ anchor association. The dismiss hook walks
 * the anchor's DOM ancestry to decide whether a click inside the panel is
 * actually inside our subtree.
 *
 * @internal
 */
export function registerFloatingAnchor(panel: Element | null, anchor: Element | null): void {
    if (!panel) return;
    if (!anchor) {
        floatingPanelAnchors.delete(panel);
        return;
    }
    floatingPanelAnchors.set(panel, anchor);
}

/**
 * Wraps a floating-ui `setFloating` callback so the resulting ref also
 * registers the panel↔anchor association in {@link floatingPanelAnchors}.
 * Co-locates the registry write next to its consumer so every floating
 * primitive gets nested-popup detection without re-implementing the wiring.
 *
 * Accepts the anchor as `Element | null` directly or as a getter — the
 * getter form lets consumers read a floating-ui MutableRefObject lazily,
 * at the moment the floating element mounts.
 *
 * @internal
 */
export function useRegisterFloatingAnchor(
    setFloating: (node: HTMLElement | null) => void,
    anchor: Element | null | (() => Element | null),
): (node: HTMLElement | null) => void {
    return useCallback(
        (node) => {
            setFloating(node);
            const anchorEl = typeof anchor === "function" ? anchor() : anchor;
            registerFloatingAnchor(node, anchorEl);
        },
        [setFloating, anchor],
    );
}

/**
 * Whether `target` lives inside the subtree owned by `ownFloating` — either
 * directly (DOM containment) or transitively through a nested floating panel
 * whose anchor chain leads back into `ownFloating`. Both portal to body, so
 * DOM containment alone can't distinguish nested children from foreign
 * siblings; the floating-panel-anchor registry bridges the gap.
 *
 * @internal
 */
export function isClickInsideOwnSubtree(target: Element | null, ownFloating: Element | null): boolean {
    if (!target || !ownFloating) return false;
    if (ownFloating.contains(target)) return true;
    let cursor: Element | null = target.closest(`[${FLOATING_ELEMENT_DATA_ATTR}]`);
    while (cursor) {
        const anchor = floatingPanelAnchors.get(cursor);
        if (!anchor) return false;
        if (ownFloating.contains(anchor)) return true;
        cursor = anchor.closest(`[${FLOATING_ELEMENT_DATA_ATTR}]`);
    }
    return false;
}

/**
 * @internal
 */
export interface IUseCloseOnOutsideClickOptions {
    floatingRef: RefObject<HTMLElement | null>;
    anchorRef: RefObject<ReferenceType | null>;
    ignoreClicksOn?: Array<string | HTMLElement>;
    shouldCloseOnClick?: (event: Event) => boolean;
}

/**
 * Hook to trigger a callback when clicking outside of a target element.
 *
 * @internal
 */
export function useCloseOnOutsideClick(
    isOpen: boolean,
    onClose: () => void,
    options: IUseCloseOnOutsideClickOptions,
): void {
    const { floatingRef, anchorRef, ignoreClicksOn = EMPTY_IGNORE_CLICKS_ON, shouldCloseOnClick } = options;

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const handleClick = (event: MouseEvent) => {
            const target = event.target as Element;

            if (isClickInsideOwnSubtree(target, floatingRef.current)) {
                return;
            }

            if (anchorRef.current instanceof Element && anchorRef.current.contains(target)) {
                return;
            }

            if (isClickOnIgnoredElement(target, ignoreClicksOn)) {
                return;
            }

            if (shouldCloseOnClick && !shouldCloseOnClick(event)) {
                return;
            }

            onClose();
        };

        document.addEventListener("click", handleClick, true);
        return () => document.removeEventListener("click", handleClick, true);
    }, [isOpen, onClose, floatingRef, anchorRef, ignoreClicksOn, shouldCloseOnClick]);
}
