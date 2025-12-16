// (C) 2025 GoodData Corporation

import { type MutableRefObject, useCallback, useMemo, useRef } from "react";

import {
    type Middleware,
    type OffsetOptions,
    type Placement,
    arrow,
    autoUpdate,
    flip,
    offset,
    shift,
    size,
    useFloating,
} from "@floating-ui/react";

import { type IUseFloatingPositionOptions, type IUseFloatingPositionResult } from "./types.js";
import { alignPointsToFallbackPlacements, alignPointsToPlacement, getOffsetFromAlignPoint } from "./utils.js";
import { useOverlayZIndexWithRegister } from "../../Overlay/OverlayContext.js";

// Stable empty array to avoid re-creating on every render
const EMPTY_MIDDLEWARE: Middleware[] = [];

/**
 * Hook for floating element positioning using floating-ui.
 *
 * @internal
 */
export function useFloatingPosition({
    isOpen,
    onOpenChange,
    placement: placementProp = "bottom-start",
    alignPoints,
    strategy = "absolute",
    offset: offsetProp,
    autoFlip = true,
    fallbackPlacements: fallbackPlacementsProp,
    arrowRef,
    customMiddleware = EMPTY_MIDDLEWARE,
    maxWidth,
    maxHeight,
    zIndex: zIndexProp,
    shiftPadding = 8,
}: IUseFloatingPositionOptions): IUseFloatingPositionResult {
    const floatingRef = useRef<HTMLElement>(null);
    const registeredZIndex = useOverlayZIndexWithRegister();

    const placement = useMemo<Placement>(() => {
        if (alignPoints && alignPoints.length > 0) {
            return alignPointsToPlacement(alignPoints);
        }
        return placementProp;
    }, [alignPoints, placementProp]);

    const computedOffset = useMemo<OffsetOptions>(() => {
        if (offsetProp !== undefined) {
            return offsetProp;
        }
        if (alignPoints && alignPoints.length > 0) {
            return getOffsetFromAlignPoint(alignPoints[0], placement);
        }
        return 0;
    }, [alignPoints, offsetProp, placement]);

    const fallbackPlacements = useMemo(() => {
        if (fallbackPlacementsProp) {
            return fallbackPlacementsProp;
        }
        if (alignPoints && alignPoints.length > 1) {
            return alignPointsToFallbackPlacements(alignPoints);
        }
        return undefined;
    }, [alignPoints, fallbackPlacementsProp]);

    const middleware = useMemo(() => {
        const mw: Middleware[] = [offset(computedOffset), ...customMiddleware];

        if (autoFlip) {
            mw.push(
                flip({
                    fallbackPlacements,
                    fallbackStrategy: "initialPlacement",
                }),
            );
        }

        mw.push(shift({ padding: shiftPadding }));

        if (maxWidth !== undefined || maxHeight !== undefined) {
            mw.push(
                size({
                    apply({ availableWidth, availableHeight, elements }) {
                        const maxW = typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth;
                        const maxH = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;
                        Object.assign(elements.floating.style, {
                            maxWidth: maxW ?? `${availableWidth}px`,
                            maxHeight: maxH ?? `${availableHeight}px`,
                        });
                    },
                }),
            );
        }

        if (arrowRef) {
            mw.push(arrow({ element: arrowRef }));
        }

        return mw;
    }, [
        computedOffset,
        customMiddleware,
        autoFlip,
        shiftPadding,
        maxWidth,
        maxHeight,
        arrowRef,
        fallbackPlacements,
    ]);

    const {
        refs,
        floatingStyles,
        context,
        middlewareData,
        placement: actualPlacement,
    } = useFloating({
        open: isOpen,
        onOpenChange,
        placement,
        strategy,
        whileElementsMounted: autoUpdate,
        middleware,
    });

    const zIndex = zIndexProp ?? registeredZIndex;

    // Memoize setFloating to maintain referential stability
    const setFloating = useCallback(
        (node: HTMLElement | null) => {
            refs.setFloating(node);
            (floatingRef as MutableRefObject<HTMLElement | null>).current = node;
        },
        [refs],
    );

    // Memoize the refs object to prevent unnecessary effect runs in consumers
    const stableRefs = useMemo(
        () => ({
            setReference: refs.setReference,
            setFloating,
            reference: refs.reference,
            floating: floatingRef,
        }),
        [refs, setFloating],
    );

    return {
        refs: stableRefs,
        floatingStyles,
        placement: actualPlacement,
        zIndex,
        context,
        middlewareData,
    };
}
