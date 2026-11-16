// (C) 2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { postEvent, setHost } from "./messagingUtils.js";
import {
    MAX_HELD_EVENTS,
    denyEvents,
    getEventGateState,
    holdEvents,
    openEvents,
    resetEventGate,
} from "./originGate.js";

const PARENT = "https://parent.example.com";

function eventName(call: unknown[]): string {
    return (call[0] as { gdc: { event: { name: string } } }).gdc.event.name;
}

describe("origin gate", () => {
    const host = { postMessage: vi.fn() };

    beforeEach(() => {
        setHost(host);
    });

    afterEach(() => {
        resetEventGate();
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    it("posts to * at once by default", () => {
        postEvent("product", "first", {});

        expect(getEventGateState()).toEqual({ type: "passthrough" });
        expect(host.postMessage).toHaveBeenCalledWith(expect.anything(), "*");
    });

    it("holds the events and posts them in order to the target origin when it opens", () => {
        holdEvents();
        postEvent("product", "first", {});
        postEvent("product", "second", {});

        expect(host.postMessage).not.toHaveBeenCalled();

        openEvents(PARENT);
        postEvent("product", "third", {});

        expect(host.postMessage.mock.calls.map(eventName)).toEqual(["first", "second", "third"]);
        expect(host.postMessage.mock.calls.map((call) => call[1])).toEqual([PARENT, PARENT, PARENT]);
    });

    it("drops the oldest events over the bound and warns once", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        holdEvents();
        for (let i = 0; i < MAX_HELD_EVENTS + 2; i++) {
            postEvent("product", `event-${i}`, {});
        }

        openEvents(PARENT);

        expect(host.postMessage).toHaveBeenCalledTimes(MAX_HELD_EVENTS);
        expect(eventName(host.postMessage.mock.calls[0])).toBe("event-2");
        expect(warn).toHaveBeenCalledTimes(1);
    });

    it("discards the held events and drops later events when denied", () => {
        vi.spyOn(console, "warn").mockImplementation(() => {});
        holdEvents();
        postEvent("product", "first", {});

        denyEvents();
        postEvent("product", "second", {});
        openEvents(PARENT);

        expect(getEventGateState()).toEqual({ type: "denied" });
        expect(host.postMessage).not.toHaveBeenCalled();
    });

    it("keeps the first target origin", () => {
        holdEvents();
        openEvents(PARENT);
        openEvents("https://other.example.com");
        postEvent("product", "first", {});

        expect(host.postMessage).toHaveBeenCalledWith(expect.anything(), PARENT);
    });

    it("posts an exempt event to * while it holds", () => {
        holdEvents();
        postEvent("product", "listeningForApiToken", {}, undefined, { exempt: true });

        expect(host.postMessage).toHaveBeenCalledWith(expect.anything(), "*");
    });
});
