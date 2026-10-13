// (C) 2026 GoodData Corporation

import { type ReactNode, createContext, useContext, useEffect, useMemo } from "react";

/**
 * Parent scroll behavior applied to every {@link Overlay} rendered in the subtree of
 * {@link OverlayAlignOnParentScrollProvider}.
 *
 * @internal
 */
export interface IOverlayParentScrollBehavior {
    /**
     * Re-align overlays to their anchor when any scrollable ancestor of the anchor is scrolled.
     */
    alignOnParentScroll: boolean;

    /**
     * Close overlays once their anchor gets fully hidden, e.g. scrolled out of view of a scrollable ancestor.
     */
    closeOnAnchorHidden: boolean;
}

/**
 * Context with the parent scroll behavior of the overlays rendered in its subtree.
 *
 * @internal
 */
export const OverlayAlignOnParentScrollContext = createContext<IOverlayParentScrollBehavior>({
    alignOnParentScroll: false,
    closeOnAnchorHidden: false,
});
OverlayAlignOnParentScrollContext.displayName = "OverlayAlignOnParentScrollContext";

/**
 * Properties for {@link OverlayAlignOnParentScrollProvider} component.
 *
 * @internal
 */
export interface IOverlayAlignOnParentScrollProviderProps {
    /**
     * Whether the overlays in the subtree should be re-aligned on parent scroll. Defaults to true.
     */
    enabled?: boolean;

    /**
     * Whether the overlays in the subtree should be closed once their anchor gets fully hidden,
     * e.g. scrolled out of view of a scrollable ancestor. Defaults to false.
     */
    closeOnAnchorHidden?: boolean;

    /**
     * React children
     */
    children?: ReactNode;
}

/**
 * Makes overlays rendered in its subtree stay attached to their anchor while a scrollable parent
 * of the anchor scrolls. Useful for overlays opened from a scrollable container, which would
 * otherwise stay at their original position until re-rendered.
 *
 * @internal
 */
export function OverlayAlignOnParentScrollProvider({
    enabled = true,
    closeOnAnchorHidden = false,
    children,
}: IOverlayAlignOnParentScrollProviderProps) {
    const value = useMemo(
        () => ({ alignOnParentScroll: enabled, closeOnAnchorHidden }),
        [enabled, closeOnAnchorHidden],
    );
    return (
        <OverlayAlignOnParentScrollContext.Provider value={value}>
            {children}
        </OverlayAlignOnParentScrollContext.Provider>
    );
}

interface IOverlayParentScrollAlignerProps {
    alignOnParentScroll?: boolean;
    closeOnAnchorHidden?: boolean;
    /**
     * Changes whenever the anchor may change, so the anchor is resolved again.
     */
    anchorKey: unknown;
    getAnchor: () => Element | null;
    onParentScroll: () => void;
    onAnchorHidden: () => void;
}

/**
 * Hook-based part of the class {@link Overlay}, so it can read the context next to the overlay controller one.
 *
 * @internal
 */
export function OverlayParentScrollAligner({
    alignOnParentScroll,
    closeOnAnchorHidden,
    anchorKey,
    getAnchor,
    onParentScroll,
    onAnchorHidden,
}: IOverlayParentScrollAlignerProps) {
    const behavior = useContext(OverlayAlignOnParentScrollContext);
    const isAlignEnabled = alignOnParentScroll ?? behavior.alignOnParentScroll;
    const isCloseEnabled = closeOnAnchorHidden ?? behavior.closeOnAnchorHidden;

    useEffect(() => {
        if (!isAlignEnabled) {
            return undefined;
        }

        let frameId = 0;
        const handleScroll = (event: Event) => {
            const anchor = getAnchor();
            if (anchor && event.target instanceof Node && event.target.contains(anchor)) {
                cancelAnimationFrame(frameId);
                frameId = requestAnimationFrame(onParentScroll);
            }
        };

        document.addEventListener("scroll", handleScroll, true);
        return () => {
            document.removeEventListener("scroll", handleScroll, true);
            cancelAnimationFrame(frameId);
        };
    }, [isAlignEnabled, getAnchor, onParentScroll]);

    useEffect(() => {
        const anchor = getAnchor();
        if (!isCloseEnabled || !anchor || typeof IntersectionObserver === "undefined") {
            return undefined;
        }

        // The implicit (viewport) root clips the anchor by every ancestor with overflow clipping,
        // so it stops intersecting once scrolled out of view of any scrollable ancestor.
        // Close only on a visible to hidden change, so an overlay opened from an already
        // clipped anchor stays open.
        let wasVisible = false;
        // one callback may deliver several queued entries of the anchor, oldest first
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (wasVisible && !entry.isIntersecting) {
                    onAnchorHidden();
                }
                wasVisible = entry.isIntersecting;
            }
        });
        observer.observe(anchor);
        return () => observer.disconnect();
    }, [isCloseEnabled, anchorKey, getAnchor, onAnchorHidden]);

    return null;
}
