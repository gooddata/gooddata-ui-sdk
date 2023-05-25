// (C) 2007-2020 GoodData Corporation
import { fireDrillEvent } from "../drilling.js";
import { IDrillEvent } from "../DrillEvents.js";
import { describe, expect, it, vi } from "vitest";

describe("fireDrillEvent", () => {
    it("should dispatch expected drill post message", () => {
        const eventData = {
            dataView: {},
            drillContext: {},
        };
        const eventHandler = vi.fn();
        const drillFunction = vi.fn();
        const target = {
            dispatchEvent: eventHandler,
        };

        fireDrillEvent(drillFunction, eventData as IDrillEvent, target as any as EventTarget);

        expect(eventHandler).toHaveBeenCalledTimes(1);
        expect(eventHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: {
                    dataView: {},
                    drillContext: {},
                },
                bubbles: true,
                type: "drill",
            }),
        );
    });

    it("should dispatch expected drill event and post message to the provided target", () => {
        const eventData = {
            dataView: {},
            drillContext: {},
        };
        const eventHandler = vi.fn();
        const target = {
            dispatchEvent: eventHandler,
        };
        const drillEventFunction = vi.fn(() => true);

        fireDrillEvent(drillEventFunction, eventData as IDrillEvent, target as any as EventTarget);

        expect(drillEventFunction).toHaveBeenCalledTimes(1);
        expect(eventHandler).toHaveBeenCalledTimes(1);
        expect(eventHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                detail: {
                    dataView: {},
                    drillContext: {},
                },
                bubbles: true,
                type: "drill",
            }),
        );
    });

    it("should dispatch expected drill event, but prevent drill post message", () => {
        const eventData = {
            dataView: {},
            drillContext: {},
        };
        const eventHandler = vi.fn();
        const target = {
            dispatchEvent: eventHandler,
        };

        const drillEventFunction = vi.fn(() => false);

        fireDrillEvent(drillEventFunction, eventData as IDrillEvent, target as any as EventTarget);

        expect(eventHandler).toHaveBeenCalledTimes(0);
        expect(drillEventFunction).toHaveBeenCalledTimes(1);
    });
});
