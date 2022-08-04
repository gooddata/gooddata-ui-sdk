// (C) 2022 GoodData Corporation
import clamp from "lodash/clamp";

export function getLimitedSize(
    minimumSize: number,
    maximumSize: number,
    originalSize: number,
    deltaSize: number,
): number {
    const newSize = originalSize + deltaSize;
    return clamp(newSize, minimumSize, maximumSize);
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
    };
}
