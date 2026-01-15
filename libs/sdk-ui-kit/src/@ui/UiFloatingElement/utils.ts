// (C) 2025-2026 GoodData Corporation

import { type OffsetOptions, type Placement, type VirtualElement } from "@floating-ui/react";

import { type IFloatingAnchor, type ILegacyAlignPoint } from "./types.js";
import { type IRegion } from "../../typings/domUtilities.js";
import { elementRegion } from "../../utils/domUtilities.js";

const ALIGN_POINT_MAP: Record<string, Placement> = {
    "bl tl": "bottom-start",
    "br tr": "bottom-end",
    "tl bl": "top-start",
    "tr br": "top-end",
    "cl cr": "left",
    "cr cl": "right",
    "tc bc": "top",
    "bc tc": "bottom",
};

/**
 * @internal
 */
export function alignPointToPlacement(alignPoint: ILegacyAlignPoint): Placement {
    const placement = ALIGN_POINT_MAP[alignPoint.align];

    if (!placement) {
        throw new Error(`Align point not supported: ${alignPoint.align}`);
    }

    return placement;
}

/**
 * @internal
 */
export function alignPointsToPlacement(alignPoints: ILegacyAlignPoint[]): Placement {
    if (alignPoints.length === 0) {
        return "bottom-start";
    }
    return alignPointToPlacement(alignPoints[0]);
}

/**
 * @internal
 */
export function alignPointsToFallbackPlacements(alignPoints: ILegacyAlignPoint[]): Placement[] {
    return alignPoints.slice(1).map(alignPointToPlacement);
}

/**
 * Converts legacy alignPoint x/y offsets to floating-ui offset options.
 *
 * For vertical placements (top/bottom):
 * - y offset → mainAxis (distance from anchor)
 * - x offset → crossAxis (horizontal shift)
 *
 * For horizontal placements (left/right):
 * - x offset → mainAxis (distance from anchor)
 * - y offset → crossAxis (vertical shift)
 *
 * @internal
 */
export function getOffsetFromAlignPoint(alignPoint: ILegacyAlignPoint, placement: Placement): OffsetOptions {
    const offsetX = alignPoint.offset?.x ?? 0;
    const offsetY = alignPoint.offset?.y ?? 0;

    // If no offset is specified, return 0
    if (offsetX === 0 && offsetY === 0) {
        return 0;
    }

    // vertical placement
    if (placement.startsWith("top") || placement.startsWith("bottom")) {
        return {
            mainAxis: offsetY,
            crossAxis: offsetX,
        };
    }

    // horizontal placement
    return {
        mainAxis: offsetX,
        crossAxis: offsetY,
    };
}

/**
 * @internal
 */
export function resolveAnchor(anchor: IFloatingAnchor): HTMLElement | VirtualElement | null {
    if (anchor === null) {
        return null;
    }
    if (typeof anchor === "string") {
        return document.querySelector(anchor);
    }
    if ("current" in anchor) {
        return anchor.current;
    }
    return anchor;
}

/**
 * @internal
 */
export function getDimensionsFromRef(ref: HTMLElement | VirtualElement | null): IRegion {
    if (!ref) {
        return { width: 0, height: 0, left: 0, top: 0, right: 0, bottom: 0 };
    }
    if ("getBoundingClientRect" in ref && typeof ref.getBoundingClientRect === "function") {
        // VirtualElement from floating-ui only has getBoundingClientRect (and optionally contextElement),
        // but no DOM node properties like nodeType. HTMLElement has nodeType.
        // We must handle VirtualElement separately because elementRegion tries to access .style
        // which doesn't exist on VirtualElement.
        if (!("nodeType" in ref)) {
            const rect = ref.getBoundingClientRect();
            return {
                width: rect.width,
                height: rect.height,
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
            };
        }
        return elementRegion(ref);
    }
    return { width: 0, height: 0, left: 0, top: 0, right: 0, bottom: 0 };
}

/**
 * @internal
 */
export function isClickOnIgnoredElement(
    target: Element,
    ignoreClicksOn: Array<string | HTMLElement>,
): boolean {
    return ignoreClicksOn.some((ignored) => {
        if (typeof ignored === "string") {
            return target.closest(ignored);
        }
        return ignored.contains(target);
    });
}
