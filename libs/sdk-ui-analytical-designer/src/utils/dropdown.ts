// (C) 2007-2026 GoodData Corporation

import { type Subscription, fromEvent } from "rxjs";
import { debounceTime } from "rxjs/operators/index.js";

export const DROPDOWN_MIN_HEIGHT = 170;
export const DROPDOWN_MAX_HEIGHT = 400;
export const DROPDOWN_OFFSET_FROM_NODE = 5;
export const DROP_DOWN_BUTTON_HEIGHT = 30;
export const PADDING = 10;

export const EVENT_DEBOUNCE_MILLISECONDS = 60;

const alignPoints = ["bl tl", "tl bl", "br tr", "tr br"];

export const DROPDOWN_ALIGNMENTS = alignPoints.map((align, idx) => ({
    align,
    offset: { x: 0, y: DROPDOWN_OFFSET_FROM_NODE * (idx % 2 ? -1 : 1) },
}));

function calculateMaxHeight(buttonTop: number, windowObj: IDropdownWindow) {
    const nodeAboveHeight = buttonTop - DROPDOWN_OFFSET_FROM_NODE - PADDING;
    const nodeBelowHeight =
        windowObj.innerHeight - (buttonTop + DROP_DOWN_BUTTON_HEIGHT + DROPDOWN_OFFSET_FROM_NODE + PADDING);

    return Math.max(nodeAboveHeight, nodeBelowHeight);
}

/** The part of the window the dropdown sizing reads — a test can hand in a stand-in. */
export type IDropdownWindow = Pick<Window, "innerHeight" | "pageYOffset">;

export function getDialogHeight(
    buttonTop: number,
    windowObj: IDropdownWindow = window,
    fillWindowHeight = false,
) {
    const maxHeight = Math.max(calculateMaxHeight(buttonTop, windowObj), DROPDOWN_MIN_HEIGHT);
    if (fillWindowHeight) {
        return maxHeight;
    }

    return Math.min(DROPDOWN_MAX_HEIGHT, maxHeight);
}

export const DROPDOWN_ALIGN_POINTS = alignPoints.map((align) => ({ align }));

const DATE_DROPDOWN_BODY_MARGIN = 6;
const UNRELATED_HEIGHT = 37;

export function getDateConfigurationDropdownHeight(
    dropdownButtonTop: number,
    dropdownButtonHeight: number,
    dropdownBodyHeight: number,
    hasFooter = false,
) {
    const nodeAboveHeight =
        dropdownButtonTop - 2 * DATE_DROPDOWN_BODY_MARGIN - PADDING - Number(hasFooter) * UNRELATED_HEIGHT;
    const nodeBelowHeight =
        window.innerHeight -
        (dropdownButtonTop +
            dropdownButtonHeight +
            2 * DATE_DROPDOWN_BODY_MARGIN +
            PADDING +
            Number(hasFooter) * UNRELATED_HEIGHT);
    const maxHeight = Math.max(nodeAboveHeight, nodeBelowHeight);

    return Math.min(dropdownBodyHeight, maxHeight, DROPDOWN_MAX_HEIGHT);
}

export const MAX_DATE_DATASET_DROPDOWN_WIDTH = 350;

export function getDateDatasetDropdownWidth(
    minWidth: number,
    contentWidth: number,
    buttonLeft: number,
    buttonRight: number,
    windowObj: Pick<Window, "innerWidth"> = window,
): number {
    const isButtonLeftOnScreen = buttonLeft >= 0 && buttonLeft <= windowObj.innerWidth;
    const isButtonRightOnScreen = buttonRight >= 0 && buttonRight <= windowObj.innerWidth;
    const availableToTheRight = isButtonLeftOnScreen
        ? Math.max(0, windowObj.innerWidth - buttonLeft - PADDING)
        : 0;
    const availableToTheLeft = isButtonRightOnScreen ? Math.max(0, buttonRight - PADDING) : 0;
    const viewportLimit = Math.max(availableToTheRight, availableToTheLeft);
    const maxWidth = Math.max(minWidth, Math.min(MAX_DATE_DATASET_DROPDOWN_WIDTH, viewportLimit));

    return Math.min(Math.max(minWidth, contentWidth), maxWidth);
}

export type EventHandler = (value: Event) => void;

export function subscribeEvents(func: EventHandler, events = ["scroll", "resize"]): Subscription[] {
    return events.map((event) => {
        return fromEvent(window, event).pipe(debounceTime(EVENT_DEBOUNCE_MILLISECONDS)).subscribe(func);
    });
}
