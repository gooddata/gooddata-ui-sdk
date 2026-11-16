// (C) 2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { postEvent, setHost } from "./messagingUtils.js";
import { getEventGateState, holdEvents, resetEventGate } from "./originGate.js";
import { createParentOriginResolver, resolveVisibleParentOrigin } from "./parentOriginResolver.js";

const OWN = "https://analytics.example.com";
const PARENT = "https://parent.example.com";

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

interface IFakeWindowOptions {
    ancestorOrigins?: string[];
    referrer?: string;
    parentOrigin?: string;
}

function fakeWindow({ ancestorOrigins, referrer = "", parentOrigin }: IFakeWindowOptions): Window {
    const win = {
        location: { origin: OWN, ancestorOrigins },
        document: { referrer },
        parent: undefined as unknown,
    };
    win.parent = {
        get location() {
            if (parentOrigin === undefined) {
                throw new DOMException("Blocked a frame", "SecurityError");
            }
            return { origin: parentOrigin };
        },
    };
    return win as unknown as Window;
}

describe("resolveVisibleParentOrigin", () => {
    it("takes the first ancestor origin", () => {
        expect(resolveVisibleParentOrigin(fakeWindow({ ancestorOrigins: [PARENT], referrer: OWN }))).toBe(
            PARENT,
        );
    });

    it("takes the origin of the referrer when there are no ancestor origins (Firefox)", () => {
        expect(resolveVisibleParentOrigin(fakeWindow({ referrer: `${PARENT}/page?x=1` }))).toBe(PARENT);
    });

    it("ignores a null ancestor origin", () => {
        expect(resolveVisibleParentOrigin(fakeWindow({ ancestorOrigins: ["null"] }))).toBeUndefined();
    });

    it("returns undefined when the parent hides its origin", () => {
        expect(resolveVisibleParentOrigin(fakeWindow({}))).toBeUndefined();
    });

    it("ignores a referrer with the own origin after a redirect inside the frame", () => {
        expect(resolveVisibleParentOrigin(fakeWindow({ referrer: `${OWN}/login` }))).toBeUndefined();
    });

    it("keeps a referrer with the own origin when the parent is same-origin", () => {
        expect(resolveVisibleParentOrigin(fakeWindow({ referrer: `${OWN}/app`, parentOrigin: OWN }))).toBe(
            OWN,
        );
    });

    it("ignores a referrer that is not a URL", () => {
        expect(resolveVisibleParentOrigin(fakeWindow({ referrer: "not a url" }))).toBeUndefined();
    });
});

describe("createParentOriginResolver", () => {
    const host = { postMessage: vi.fn() };

    beforeEach(() => {
        setHost(host);
        holdEvents();
        vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
        resetEventGate();
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    it("opens to the handshake origin with no validation", () => {
        const validate = vi.fn();

        createParentOriginResolver({ validate, handshakeOrigin: PARENT, visibleOrigin: OWN });

        expect(validate).not.toHaveBeenCalled();
        expect(getEventGateState()).toEqual({ type: "open", targetOrigin: PARENT });
    });

    it("opens to a valid visible origin", async () => {
        const validate = vi.fn().mockResolvedValue(true);

        createParentOriginResolver({ validate, visibleOrigin: PARENT });
        await flushPromises();

        expect(validate).toHaveBeenCalledWith(PARENT);
        expect(getEventGateState()).toEqual({ type: "open", targetOrigin: PARENT });
    });

    it("denies when the visible origin is not valid", async () => {
        const validate = vi.fn().mockResolvedValue(false);

        const resolver = createParentOriginResolver({ validate, visibleOrigin: PARENT });
        await flushPromises();
        resolver.onValidatedCommandOrigin(PARENT);

        expect(getEventGateState()).toEqual({ type: "denied" });
    });

    it("opens to * when the parent hides its origin and * is valid", async () => {
        const validate = vi.fn().mockResolvedValue(true);

        createParentOriginResolver({ validate });
        await flushPromises();

        expect(validate).toHaveBeenCalledWith("*");
        expect(getEventGateState()).toEqual({ type: "open", targetOrigin: "*" });
    });

    it("waits for the first validated command when * is not valid, and keeps that origin", async () => {
        const validate = vi.fn().mockResolvedValue(false);

        const resolver = createParentOriginResolver({ validate });
        await flushPromises();

        expect(getEventGateState()).toEqual({ type: "holding" });

        resolver.onValidatedCommandOrigin(PARENT);
        resolver.onValidatedCommandOrigin("https://other.example.com");

        expect(getEventGateState()).toEqual({ type: "open", targetOrigin: PARENT });
    });

    it("keeps the origin of a validated command that comes before * is not valid", async () => {
        let answerWildcard: (isValid: boolean) => void = () => {};
        const validate = vi.fn(() => new Promise<boolean>((resolve) => (answerWildcard = resolve)));

        const resolver = createParentOriginResolver({ validate });
        resolver.onValidatedCommandOrigin(PARENT);
        answerWildcard(false);
        await flushPromises();

        expect(getEventGateState()).toEqual({ type: "open", targetOrigin: PARENT });
    });

    it("keeps holding after an error and tries again when an event is held, at most once per interval", async () => {
        let time = 0;
        const validate = vi.fn().mockRejectedValueOnce(new Error("network")).mockResolvedValue(true);

        createParentOriginResolver({ validate, visibleOrigin: PARENT, now: () => time });
        await flushPromises();

        expect(getEventGateState()).toEqual({ type: "holding" });

        time = 1000;
        postEvent("product", "early", {});
        expect(validate).toHaveBeenCalledTimes(1);

        time = 5000;
        postEvent("product", "later", {});
        await flushPromises();

        expect(validate).toHaveBeenCalledTimes(2);
        expect(getEventGateState()).toEqual({ type: "open", targetOrigin: PARENT });
        expect(host.postMessage).toHaveBeenCalledTimes(2);
    });

    it("tries again after an error when a validated command comes", async () => {
        let time = 0;
        const validate = vi.fn().mockRejectedValueOnce(new Error("network")).mockResolvedValue(true);

        const resolver = createParentOriginResolver({ validate, visibleOrigin: PARENT, now: () => time });
        await flushPromises();

        time = 6000;
        resolver.onValidatedCommandOrigin(PARENT);
        await flushPromises();

        expect(getEventGateState()).toEqual({ type: "open", targetOrigin: PARENT });
    });

    it("does not change the gate after dispose", async () => {
        const validate = vi.fn().mockResolvedValue(true);

        const resolver = createParentOriginResolver({ validate, visibleOrigin: PARENT });
        resolver.dispose();
        await flushPromises();

        expect(getEventGateState()).toEqual({ type: "holding" });
    });
});
