// (C) 2025 GoodData Corporation

import { Placement, ReferenceType } from "@floating-ui/react";
import { ARROW_WIDTH, ARROW_EDGE_OFFSET, oppositeSides, DEFAULT_BORDER_RADIUS } from "./constants.js";
import { Dimensions, PlacementShift, TooltipArrowPlacement } from "./types.js";

const parsePlacement = (placement: TooltipArrowPlacement) => {
    const [basicPlacement, axisPlacement] = placement.split("-");
    return { basicPlacement, axisPlacement };
};

export const getOppositeBasicPlacement = (arrowPlacement: TooltipArrowPlacement) => {
    const basicPlacement = parsePlacement(arrowPlacement).basicPlacement;
    return oppositeSides[basicPlacement] as Placement;
};

export const getFlipFallbackOrder = (arrowPlacement: TooltipArrowPlacement) => {
    const basicPlacement = parsePlacement(arrowPlacement).basicPlacement;
    const oppositePlacement = getOppositeBasicPlacement(arrowPlacement);
    const remaining = Object.values(oppositeSides).filter(
        (side) => side !== basicPlacement && side !== oppositePlacement,
    );

    return [basicPlacement, oppositePlacement, ...remaining] as Array<Placement>;
};

export const getDimensionsFromRect = (rect: DOMRect | { width: number; height: number } | null) => {
    return { width: rect?.width ?? 0, height: rect?.height ?? 0 };
};

export const getDimensionsFromRef = (ref: React.MutableRefObject<ReferenceType | null>) => {
    const rect = ref?.current?.getBoundingClientRect?.();
    return getDimensionsFromRect(rect);
};

export const getArrowEdgeOffset = () => {
    const tooltipBorderRadius = getComputedStyle(document.documentElement)
        .getPropertyValue("--gd-modal-borderRadius")
        .trim();
    return (
        (tooltipBorderRadius ? parseInt(tooltipBorderRadius, 10) : DEFAULT_BORDER_RADIUS) + ARROW_EDGE_OFFSET
    );
};

export const computeTooltipShift = (
    arrowPlacement: TooltipArrowPlacement,
    floatingDimensions: Dimensions,
    isEnabled: boolean,
): PlacementShift => {
    const { basicPlacement, axisPlacement } = parsePlacement(arrowPlacement);
    const borderArrowOffset = getArrowEdgeOffset() + ARROW_WIDTH / 2;

    if (isEnabled) {
        let shiftProp = "";
        let shiftValue = 0;
        if (["top", "bottom"].includes(basicPlacement)) {
            shiftProp = "x";
            shiftValue = floatingDimensions.width / 2 - borderArrowOffset;
        } else if (["left", "right"].includes(basicPlacement)) {
            shiftProp = "y";
            shiftValue = floatingDimensions.height / 2 - borderArrowOffset;
        }
        if (axisPlacement === "start") {
            return { [shiftProp]: shiftValue };
        } else if (axisPlacement === "end") {
            return { [shiftProp]: -shiftValue };
        }
    }

    return {};
};

export const computeArrowOffset = (
    arrowPlacement: TooltipArrowPlacement,
    floatingDimensions: Dimensions,
    isEnabled: boolean,
) => {
    if (isEnabled) {
        const arrowEdgeOffset = getArrowEdgeOffset();
        const { basicPlacement, axisPlacement } = parsePlacement(arrowPlacement);
        const sideLength = ["top", "bottom"].includes(basicPlacement)
            ? floatingDimensions.width
            : floatingDimensions.height;
        if (axisPlacement === "start") {
            return arrowEdgeOffset;
        } else if (axisPlacement === "end") {
            return sideLength - (ARROW_WIDTH + arrowEdgeOffset);
        }
    }
    return 0;
};
