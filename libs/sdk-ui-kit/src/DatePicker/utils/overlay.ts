// (C) 2007-2020 GoodData Corporation
import mapValues from "lodash/mapValues";
import merge from "lodash/merge";
import { elementRegion } from "../../utils/domUtilities";
import {
    Region,
    GetOptimalAlignment,
    GetPositionedSelfRegion,
    GetOptimalAlignmentForRegion,
} from "../typings";
import { IOffset, IAlignPoint } from "../../typings/positioning";

const ALIGN_RATIOS_X = {
    l: 0,
    r: 1,
    c: 0.5,
};

const ALIGN_RATIOS_Y = {
    t: 0,
    b: 1,
    c: 0.5,
};

const DEFAULT_OFFSET_VALUES = {
    x: 0,
    y: 0,
};

export const DEFAULT_ALIGN_POINTS = [
    {
        align: "cc cc",
        offset: {
            x: 0,
            y: 0,
        },
    },
];

const FULLY_HIDDEN_ALIGNMENT = {
    alignment: {
        left: 0,
        top: 0,
        right: 0,
        align: DEFAULT_ALIGN_POINTS[0].align,
    },
    visiblePart: -1,
};

function getDefaultViewportRegion(ignoreScrollOffsets: boolean) {
    const region: any = elementRegion(document.body);

    return {
        top: ignoreScrollOffsets ? 0 : document.documentElement.scrollTop,
        left: ignoreScrollOffsets ? 0 : document.documentElement.scrollLeft,
        width: region.width,
        height: region.height,
    };
}

function getDefaultDocumentRegion() {
    return {
        top: 0,
        left: 0,
        height: document.documentElement.scrollHeight,
        width: document.documentElement.scrollWidth,
    };
}

function getAlignRatios(coordinatesString: string) {
    if (!(coordinatesString[0] in ALIGN_RATIOS_Y) || !(coordinatesString[1] in ALIGN_RATIOS_X)) {
        throw new Error(`Invalid point specification: ${coordinatesString}`);
    }

    return {
        x: ALIGN_RATIOS_X[coordinatesString[1]],
        y: ALIGN_RATIOS_Y[coordinatesString[0]],
    };
}

function getAlignPointRatios(alignPointAlign: string) {
    const alignPointPositions = alignPointAlign.split(" ");

    return {
        target: getAlignRatios(alignPointPositions[0]),
        self: getAlignRatios(alignPointPositions[1]),
    };
}

function getRegionOffset(region: Region, ratio: IOffset, direction: number = 1) {
    return {
        x: region.width * ratio.x * direction,
        y: region.height * ratio.y * direction,
    };
}

function getAlignPointOffset(alignPointOffset: IOffset) {
    return merge({}, DEFAULT_OFFSET_VALUES, alignPointOffset);
}

function addOffset(position: IOffset, offset: IOffset) {
    return {
        x: position.x + offset.x,
        y: position.y + offset.y,
    };
}

function getGlobalOffset(target: Region) {
    return {
        x: target.left,
        y: target.top,
    };
}

/**
 * Get left-top coordinates of a child summing up offsets of a child,
 * align points and left-top coordinates of target region
 */
function getGlobalPosition(targetRegion: Region, selfRegion: Region, alignPoint: IAlignPoint) {
    const alignRatio = getAlignPointRatios(alignPoint.align);

    const targetRegionOffset = getRegionOffset(targetRegion, alignRatio.target);
    const selfRegionOffset = getRegionOffset(selfRegion, alignRatio.self, -1);
    const alignPointOffset = getAlignPointOffset(alignPoint.offset);
    const cumulativeOffset = addOffset(alignPointOffset, addOffset(targetRegionOffset, selfRegionOffset));

    const globalOffset = getGlobalOffset(targetRegion);

    return addOffset(globalOffset, cumulativeOffset);
}

/**
 * Move region to position specified by anchor point,
 * using its left-top coordinates
 */
function moveRegionToPosition(region: Region, anchorPoint: IOffset) {
    return merge({}, region, {
        left: anchorPoint.x,
        top: anchorPoint.y,
        width: region.width,
        height: region.height,
    });
}

/**
 * Move self region to new position using its left-top coordinates
 */
function getPositionedSelfRegion({ targetRegion, selfRegion, alignPoint }: GetPositionedSelfRegion) {
    const globalPosition = getGlobalPosition(targetRegion, selfRegion, alignPoint);

    return moveRegionToPosition(selfRegion, globalPosition);
}

/**
 * Get fraction of visible area
 */
function getRatioOfVisibleRegion(boundaryRegion: Region, region: Region) {
    const maximalVisibleArea = region.width * region.height;

    if (maximalVisibleArea === 0) {
        return 0;
    }

    const leftBorder = Math.max(boundaryRegion.left, region.left);
    const rightBorder = Math.min(boundaryRegion.left + boundaryRegion.width, region.left + region.width);

    const topBorder = Math.max(boundaryRegion.top, region.top);
    const bottomBorder = Math.min(boundaryRegion.top + boundaryRegion.height, region.top + region.height);

    const visibleWidth = Math.max(rightBorder - leftBorder, 0);
    const visibleHeight = Math.max(bottomBorder - topBorder, 0);

    const visibleArea = visibleWidth * visibleHeight;
    const visibleRatio = visibleArea / maximalVisibleArea;

    return Math.max(0, visibleRatio);
}

function isFullyVisible(alignment: any) {
    return alignment.visiblePart === 1;
}

function isFullyHidden(alignment: any) {
    return alignment.visiblePart === 0;
}

/**
 * Calculate most visible alignment of self region which
 * would be positioned to target region using specified
 * align points
 */
export function getOptimalAlignmentForRegion({
    boundaryRegion,
    targetRegion,
    selfRegion,
    alignPoints,
}: GetOptimalAlignmentForRegion) {
    let mostVisibleAlignment = FULLY_HIDDEN_ALIGNMENT;

    for (let i = 0; i < alignPoints.length; i += 1) {
        const positionedSelfRegion = getPositionedSelfRegion({
            alignPoint: alignPoints[i],
            targetRegion,
            selfRegion,
        });

        const visiblePart = getRatioOfVisibleRegion(boundaryRegion, positionedSelfRegion);

        if (visiblePart > mostVisibleAlignment.visiblePart) {
            const coordinates = {
                left: positionedSelfRegion.left,
                top: positionedSelfRegion.top,
                right:
                    boundaryRegion.left + boundaryRegion.width - positionedSelfRegion.left - selfRegion.width,
            };

            mostVisibleAlignment = {
                alignment: merge(mapValues(coordinates, Math.floor), {
                    align: alignPoints[i].align,
                }),
                visiblePart,
            };
        }

        if (isFullyVisible(mostVisibleAlignment)) {
            return mostVisibleAlignment;
        }
    }

    return mostVisibleAlignment;
}

/**
 * Calculate optimal alignment of self region
 * using viewport boundaries. Try to position
 * using body boundaries if the region
 * is fully hidden in the viewport
 */
export function getOptimalAlignment({
    targetRegion,
    selfRegion,
    ignoreScrollOffsets,
    alignPoints,
    getViewportRegion = getDefaultViewportRegion,
    getDocumentRegion = getDefaultDocumentRegion,
}: GetOptimalAlignment) {
    let optimalAlign = getOptimalAlignmentForRegion({
        boundaryRegion: getViewportRegion(ignoreScrollOffsets),
        targetRegion,
        selfRegion,
        alignPoints,
    });

    if (isFullyHidden(optimalAlign)) {
        optimalAlign = getOptimalAlignmentForRegion({
            boundaryRegion: getDocumentRegion(),
            targetRegion,
            selfRegion,
            alignPoints,
        });
    }

    return optimalAlign;
}
