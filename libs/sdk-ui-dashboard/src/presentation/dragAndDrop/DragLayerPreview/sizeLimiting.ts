// (C) 2022 GoodData Corporation
import clamp from "lodash/clamp.js";
import { ReachedResizingLimit } from "./types.js";

export function getLimitedSize(
    minimumSize: number,
    maximumSize: number,
    originalSize: number,
    deltaSize: number,
): number {
    const newSize = originalSize + deltaSize;
    return clamp(newSize, minimumSize, maximumSize);
}

function getLimitReached(
    unlimitedSize: number,
    limitedSize: number,
    maximumSize: number,
): ReachedResizingLimit {
    const isLimited = limitedSize !== unlimitedSize;

    if (!isLimited) {
        return "none";
    }

    return unlimitedSize > maximumSize ? "max" : "min";
}

export function applySizeLimitation(
    minimumSize: number,
    maximumSize: number,
    originalSize: number,
    deltaSize: number,
) {
    const unlimitedSize = originalSize + deltaSize;
    const limitedSize = clamp(unlimitedSize, minimumSize, maximumSize);

    return {
        limitedSize,
        unlimitedSize,
        isLimited: limitedSize !== unlimitedSize,
        limitReached: getLimitReached(unlimitedSize, limitedSize, maximumSize),
    };
}
