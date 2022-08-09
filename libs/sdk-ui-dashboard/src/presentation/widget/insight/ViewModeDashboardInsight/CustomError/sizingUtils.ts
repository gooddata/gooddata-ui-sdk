// (C) 2007-2021 GoodData Corporation
const MINIMUM_LONGER_SIDE = 380;
const MINIMUM_SHORTER_SIDE = 200;

export const shouldRenderFullContent = (height: number | undefined, width: number | undefined): boolean => {
    if (!height || !width) {
        return false;
    }

    const shorter = Math.min(width, height);
    const longer = Math.max(width, height);

    return shorter >= MINIMUM_SHORTER_SIDE && longer >= MINIMUM_LONGER_SIDE;
};
