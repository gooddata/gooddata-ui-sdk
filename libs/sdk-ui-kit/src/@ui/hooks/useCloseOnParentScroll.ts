// (C) 2025 GoodData Corporation

import { type RefObject, useEffect } from "react";

import { type ReferenceType } from "@floating-ui/react";

import { GOODSTRAP_SCROLLED_EVENT } from "../../utils/scroll.js";

/**
 * Hook to trigger a callback when a parent of the anchor element scrolls.
 * Listens for the custom GOODSTRAP_SCROLLED_EVENT event.
 *
 * @internal
 */
export function useCloseOnParentScroll(
    isOpen: boolean,
    onClose: () => void,
    anchorRef: RefObject<ReferenceType | null>,
): void {
    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const handleScroll = (event: Event) => {
            const scrollTarget = (event as CustomEvent)?.detail?.node ?? event.target;
            if (anchorRef.current instanceof Element && scrollTarget?.contains?.(anchorRef.current)) {
                onClose();
            }
        };

        window.addEventListener(GOODSTRAP_SCROLLED_EVENT, handleScroll);
        return () => window.removeEventListener(GOODSTRAP_SCROLLED_EVENT, handleScroll);
    }, [isOpen, onClose, anchorRef]);
}
