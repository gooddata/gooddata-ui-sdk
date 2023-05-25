// (C) 2007-2020 GoodData Corporation
import { MenuAlignment } from "../MenuSharedTypes.js";

export interface IDimensions {
    width: number;
    height: number;
}

export interface ICoordinates {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export interface IDimensionsAndCoordinates extends IDimensions, ICoordinates {}

export type Dimension = "width" | "height";

export type Direction = "left" | "right" | "top" | "bottom";

export interface IMenuPosition {
    left: number;
    top: number;
}

export function getViewportDimensionsAndCoords(): IDimensionsAndCoordinates {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const left = window.pageXOffset;
    const top = window.pageYOffset;
    const right = left + width;
    const bottom = top + height;

    return { width, height, left, top, right, bottom };
}

export function getElementDimensionsAndCoords(element: HTMLElement): IDimensionsAndCoordinates {
    const rect = element.getBoundingClientRect();
    const window = getViewportDimensionsAndCoords();

    const width = rect.width;
    const height = rect.height;

    const left = rect.left + window.left;
    const top = rect.top + window.top;
    const right = left + width;
    const bottom = top + height;

    return { width, height, left, top, right, bottom };
}

export function getElementDimensions(element: Element): IDimensions {
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    return { width, height };
}

const reverseDirectionMap: { [key in Direction]: Direction } = {
    left: "right",
    right: "left",
    top: "bottom",
    bottom: "top",
};

const dimensionMap: { [key in Direction]: Dimension } = {
    left: "width",
    right: "width",
    top: "height",
    bottom: "height",
};

export interface IMenuPositionConfig {
    toggler: IDimensionsAndCoordinates;
    viewport: IDimensionsAndCoordinates;
    menu: IDimensions;
    alignment: MenuAlignment;
    spacing: number;
    offset: number;
    topLevelMenu: boolean;
}

export function calculateMenuPosition({
    toggler,
    viewport,
    menu,
    alignment = ["right", "bottom"],
    spacing = 0,
    offset = 0,
    topLevelMenu = true,
}: IMenuPositionConfig): IMenuPosition {
    const sharedArguments = { toggler, viewport, menu, spacing, offset };
    const [directionPreferredPrimary, directionPrefferedSecondary] = alignment;

    const [primaryCoordinateDirection, primaryCoordinate] = calculatePositionForDirection({
        ...sharedArguments,
        direction: directionPreferredPrimary,
        isPrimaryDimension: true,
    });
    const [secondaryCoordinateDirection, secondaryCoordinate] = calculatePositionForDirection({
        ...sharedArguments,
        direction: directionPrefferedSecondary,
        isPrimaryDimension: false,
    });

    const coordinates: Partial<ICoordinates> = {
        [primaryCoordinateDirection]: primaryCoordinate,
        [secondaryCoordinateDirection]: secondaryCoordinate,
    };

    // Convert from left/right+top/bottom coordinates to left+top coordinates
    const res: IMenuPosition = {
        left:
            typeof coordinates.left === "number"
                ? coordinates.left
                : toggler.width - menu.width - coordinates.right!,
        top:
            typeof coordinates.top === "number"
                ? coordinates.top
                : toggler.height - menu.height - coordinates.bottom!,
    };

    // Returned coordinates are relative to toggler.
    //   - Submenus are positioned relative to the toggler, so we do not do anything.
    //   - Top menu is inside portal positioned relative to the page, so we convert
    //     from coords relative to toggler to coords relative to page.
    if (topLevelMenu) {
        res.left += toggler.left;
        res.top += toggler.top;
    }

    return res;
}

function calculatePositionForDirection({
    toggler,
    viewport,
    menu,
    direction,
    spacing,
    offset,
    isPrimaryDimension,
}: {
    toggler: IDimensionsAndCoordinates;
    viewport: IDimensionsAndCoordinates;
    menu: IDimensions;
    direction: Direction;
    spacing: number;
    offset: number;
    isPrimaryDimension: boolean;
}): [Direction, number] {
    // Toggler and viewport coordinates are absolute to the page.
    // Returned coordinates are relative to the toggler.

    const directionReverse = reverseDirectionMap[direction];
    const dimension = dimensionMap[direction];

    const directionBottomRight = direction === "bottom" || direction === "right";
    const directionBottomRightMultiplier = directionBottomRight ? 1 : -1;

    const secondaryDimensionAdjust = isPrimaryDimension ? 0 : toggler[dimension];
    const spacingAdjust = isPrimaryDimension ? spacing : 0;
    const offsetAdjust = isPrimaryDimension ? 0 : offset;

    // Primary space is size of the ideal position on the screen.
    // eg.: for direction = "right" primary space would be space between
    // toggler right and viewport right.
    let primarySpace = viewport[direction] - toggler[direction];
    primarySpace = primarySpace + secondaryDimensionAdjust * directionBottomRightMultiplier;
    primarySpace = primarySpace * directionBottomRightMultiplier;
    primarySpace = primarySpace - spacingAdjust;
    primarySpace = primarySpace - offsetAdjust;
    primarySpace = Math.max(0, primarySpace);
    const fitsInPrimarySpace = menu[dimension] <= primarySpace;
    if (fitsInPrimarySpace) {
        // eg.: direction = "right"
        //  menu left side is placed to right side of toggler
        //  menu.left = toggler.width
        const distance = toggler[dimension] - secondaryDimensionAdjust + spacingAdjust + offsetAdjust;
        return [directionReverse, distance];
    }

    let secondarySpace = toggler[directionReverse] - viewport[directionReverse];
    secondarySpace = secondarySpace + secondaryDimensionAdjust * directionBottomRightMultiplier;
    secondarySpace = secondarySpace * directionBottomRightMultiplier;
    secondarySpace = secondarySpace - spacingAdjust;
    secondarySpace = secondarySpace - offsetAdjust;
    secondarySpace = Math.max(0, secondarySpace);
    const fitsInSecondarySpace = menu[dimension] <= secondarySpace;
    if (fitsInSecondarySpace) {
        // eg.: direction = "right"
        //  menu right side is placed to left side of toggler
        //  menu.left = -menu.width
        const distance = -menu[dimension] + secondaryDimensionAdjust - spacingAdjust - offsetAdjust;
        return [directionReverse, distance];
    }

    const doesNotFitInViewport = menu[dimension] > viewport[dimension];
    if (doesNotFitInViewport) {
        // eg.: direction = "right"
        //  menu left side is always placed to left side of viewport
        //  menu.left = viewport.left - menu.left
        const distance =
            (viewport[directionReverse] - toggler[directionReverse]) * directionBottomRightMultiplier;
        return [directionReverse, distance];
    }

    // eg.: direction = "right"
    //  menu right is placed to the same viewport side
    //  menu.right = toggler.right - menu.right
    const distance = (toggler[direction] - viewport[direction]) * directionBottomRightMultiplier;
    return [direction, distance];
}
