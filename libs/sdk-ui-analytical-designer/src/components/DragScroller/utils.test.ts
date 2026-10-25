// (C) 2021-2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import { isEventWithinRect } from "./utils.js";

describe("drag scroller utils", () => {
    describe("#isEventWithinRect", () => {
        it("should return true if event is within provided rect", () => {
            const rect = { top: 50, bottom: 100, left: 100, right: 200 } as DOMRect;
            const event = { pageX: 150, pageY: 75 } as MouseEvent;

            const withinRect = isEventWithinRect(event, rect);

            expect(withinRect).toEqual(true);
        });

        it("should return false if event is outside provided rect on the x axis", () => {
            const rect = { top: 50, bottom: 100, left: 100, right: 200 } as DOMRect;
            const event = { pageX: 75, pageY: 201 } as MouseEvent;

            const withinRect = isEventWithinRect(event, rect);

            expect(withinRect).toEqual(false);
        });

        it("should return false if event is outside provided rect on the y axis", () => {
            const rect = { top: 50, bottom: 100, left: 100, right: 200 } as DOMRect;
            const event = { pageX: 150, pageY: 101 } as MouseEvent;

            const withinRect = isEventWithinRect(event, rect);

            expect(withinRect).toEqual(false);
        });
    });
});
