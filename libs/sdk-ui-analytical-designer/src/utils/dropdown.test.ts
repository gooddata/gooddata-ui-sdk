// (C) 2007-2026 GoodData Corporation

// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    DROPDOWN_MAX_HEIGHT,
    DROPDOWN_MIN_HEIGHT,
    DROPDOWN_OFFSET_FROM_NODE,
    DROP_DOWN_BUTTON_HEIGHT,
    EVENT_DEBOUNCE_MILLISECONDS,
    type IDropdownWindow,
    MAX_DATE_DATASET_DROPDOWN_WIDTH,
    PADDING,
    getDateDatasetDropdownWidth,
    getDialogHeight,
    subscribeEvents,
} from "./dropdown.js";

const LOW_WINDOW_HEIGHT = 360; // TWICE DROPDOWN_MIN_HEIGHT
const HIGH_WINDOW_HEIGHT = 1024;

describe("getDialogHeight", () => {
    let windowObj: IDropdownWindow;

    describe("when viewport height is low", () => {
        beforeEach(() => {
            windowObj = {
                innerHeight: LOW_WINDOW_HEIGHT,
                pageYOffset: 0,
            };
        });

        it("and button is near the vertical center, should equal minimum dialog height", () => {
            expect(getDialogHeight(LOW_WINDOW_HEIGHT / 2, windowObj)).toEqual(DROPDOWN_MIN_HEIGHT);
        });

        it("and button is near the top, should calc height to fit dropdown in bottom area", () => {
            const height = getDialogHeight(0, windowObj);

            expect(height).toBeGreaterThan(DROPDOWN_MIN_HEIGHT);
            expect(height).toBeLessThan(DROPDOWN_MAX_HEIGHT);
        });

        it("and button is near the bottom, should use height of top area", () => {
            const height = getDialogHeight(LOW_WINDOW_HEIGHT - 20, windowObj);

            expect(height).toBeGreaterThan(DROPDOWN_MIN_HEIGHT);
            expect(height).toBeLessThan(DROPDOWN_MAX_HEIGHT);
        });
    });

    describe("when viewport height is high", () => {
        it("should equal maximum dialog height", () => {
            windowObj = {
                innerHeight: HIGH_WINDOW_HEIGHT,
                pageYOffset: 0,
            };

            expect(getDialogHeight(0, windowObj)).toEqual(DROPDOWN_MAX_HEIGHT);
        });

        it("should stretch as much as possible", () => {
            windowObj = {
                innerHeight: HIGH_WINDOW_HEIGHT,
                pageYOffset: 0,
            };

            expect(getDialogHeight(0, windowObj, true)).toEqual(
                HIGH_WINDOW_HEIGHT - DROPDOWN_OFFSET_FROM_NODE - DROP_DOWN_BUTTON_HEIGHT - PADDING,
            );
        });
    });
});

describe("getDateDatasetDropdownWidth", () => {
    const WIDE_WINDOW = { innerWidth: 1440 };

    it("never returns less than the trigger width, even when content is narrower", () => {
        expect(getDateDatasetDropdownWidth(120, 60, 100, 220, WIDE_WINDOW)).toEqual(120);
    });

    it("grows to fit content wider than the trigger", () => {
        expect(getDateDatasetDropdownWidth(120, 220, 100, 220, WIDE_WINDOW)).toEqual(220);
    });

    it("caps growth at MAX_DATE_DATASET_DROPDOWN_WIDTH", () => {
        expect(getDateDatasetDropdownWidth(120, 900, 100, 220, WIDE_WINDOW)).toEqual(
            MAX_DATE_DATASET_DROPDOWN_WIDTH,
        );
    });

    it("clamps to the available space when the trigger sits flush against the viewport edge", () => {
        const narrowWindow = { innerWidth: 300 };

        expect(getDateDatasetDropdownWidth(80, 900, 290, 300, narrowWindow)).toEqual(300 - PADDING);
    });

    it("does not overflow when the trigger is centered in a narrow viewport", () => {
        const narrowWindow = { innerWidth: 300 };

        expect(getDateDatasetDropdownWidth(80, 900, 120, 180, narrowWindow)).toEqual(180 - PADDING);
    });

    it("never shrinks below the trigger width even when neither side has room", () => {
        const veryNarrowWindow = { innerWidth: 50 };

        expect(getDateDatasetDropdownWidth(120, 900, 0, 50, veryNarrowWindow)).toEqual(120);
    });

    it("never shrinks below the trigger width, when the trigger's right edge sits outside the viewport after a resize", () => {
        const narrowWindow = { innerWidth: 150 };

        // Trigger spans x=100-180: its right edge is already past the 150px viewport, e.g.
        // because the window shrank after mount but before this recalculates. The raw
        // (unclamped) distance from the right edge to x=0 would report 170px of "room" to
        // open leftward, but a body anchored at that off-screen edge would still overflow —
        // this must fall back to the left-anchored capacity (40px) or the trigger width.
        expect(getDateDatasetDropdownWidth(80, 900, 100, 180, narrowWindow)).toEqual(80);
    });

    it("never shrinks below the trigger width, when the trigger's left edge sits outside the viewport after a resize", () => {
        const narrowWindow = { innerWidth: 150 };

        expect(getDateDatasetDropdownWidth(80, 900, -50, 30, narrowWindow)).toEqual(80);
    });
});

describe("subscribeEvents", () => {
    let windowTarget: EventTarget;

    beforeEach(() => {
        vi.useFakeTimers();
        windowTarget = new EventTarget();
        vi.stubGlobal("window", windowTarget);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const dispatch = (type: string) => {
        const event = new Event(type);
        windowTarget.dispatchEvent(event);
        return event;
    };

    it("calls the handler once with the last event, after a quiet period following a burst", () => {
        const handler = vi.fn();
        subscribeEvents(handler);

        dispatch("scroll");
        vi.advanceTimersByTime(EVENT_DEBOUNCE_MILLISECONDS - 1);
        const last = dispatch("scroll");
        vi.advanceTimersByTime(EVENT_DEBOUNCE_MILLISECONDS - 1);

        expect(handler).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(last);
    });

    it("debounces each event type on its own", () => {
        const handler = vi.fn();
        subscribeEvents(handler);

        const scroll = dispatch("scroll");
        const resize = dispatch("resize");
        vi.advanceTimersByTime(EVENT_DEBOUNCE_MILLISECONDS);

        expect(handler).toHaveBeenCalledTimes(2);
        expect(handler).toHaveBeenCalledWith(scroll);
        expect(handler).toHaveBeenCalledWith(resize);
    });

    it("listens only to the given events", () => {
        const handler = vi.fn();
        subscribeEvents(handler, ["resize"]);

        dispatch("scroll");
        vi.advanceTimersByTime(EVENT_DEBOUNCE_MILLISECONDS);

        expect(handler).not.toHaveBeenCalled();
    });

    it("stops calling the handler after unsubscribe", () => {
        const handler = vi.fn();
        subscribeEvents(handler).forEach((subscription) => subscription.unsubscribe());

        dispatch("scroll");
        dispatch("resize");
        vi.advanceTimersByTime(EVENT_DEBOUNCE_MILLISECONDS);

        expect(handler).not.toHaveBeenCalled();
    });

    it("drops a pending call on unsubscribe", () => {
        const handler = vi.fn();
        const subscriptions = subscribeEvents(handler);

        dispatch("scroll");
        dispatch("resize");
        subscriptions.forEach((subscription) => subscription.unsubscribe());
        vi.advanceTimersByTime(EVENT_DEBOUNCE_MILLISECONDS);

        expect(handler).not.toHaveBeenCalled();
    });

    it("unsubscribes one event type without affecting the other", () => {
        const handler = vi.fn();
        const [scrollSubscription] = subscribeEvents(handler);

        scrollSubscription.unsubscribe();
        dispatch("scroll");
        const resize = dispatch("resize");
        vi.advanceTimersByTime(EVENT_DEBOUNCE_MILLISECONDS);

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(resize);
    });
});
