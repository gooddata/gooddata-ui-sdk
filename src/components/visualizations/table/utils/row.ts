// (C) 2007-2019 GoodData Corporation
import { IPositions } from "../../../../interfaces/Table";
import { DEFAULT_ROW_HEIGHT } from "../constants/layout";

function setPosition(element: HTMLElement, position: string, top: number, isSticking: boolean = false): void {
    const { style, classList } = element;

    classList[isSticking ? "add" : "remove"]("sticking");
    style.position = position;
    style.top = `${Math.round(top)}px`;
}

export function updatePosition(
    element: HTMLElement,
    positions: IPositions,
    isDefaultPosition: boolean,
    isEdgePosition: boolean,
    isScrollingStopped: boolean,
): void {
    const { defaultTop, edgeTop, fixedTop, absoluteTop } = positions;

    if (isDefaultPosition) {
        return setPosition(element, "absolute", defaultTop);
    }

    if (isEdgePosition) {
        return setPosition(element, "absolute", edgeTop, true);
    }

    if (isScrollingStopped) {
        return setPosition(element, "absolute", absoluteTop, true);
    }

    return setPosition(element, "fixed", fixedTop, true);
}

export function getHiddenRowsOffset(hasHiddenRows: boolean): number {
    return hasHiddenRows ? 0.5 * DEFAULT_ROW_HEIGHT : 0;
}
