// (C) 2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    getEventGateState,
    resetEventGate,
    stopParentOriginResolution,
} from "@gooddata/sdk-embedding/internal";

import { adoptHostBackend, resetBackend } from "../../backend.js";

import { startParentOriginValidation } from "./parent_origin_validation.js";

const isUrlValid = vi.fn();

// The tests run with `isolate: false`: another test file can load backend.js before this one, so a
// `vi.mock` of it does not apply. Adopt a fake backend instead.
function adoptFakeBackend() {
    adoptHostBackend({
        instance: {
            organization: () => ({ securitySettings: () => ({ isUrlValid }) }),
        } as unknown as IAnalyticalBackend,
    });
}

const PARENT = "https://parent.example.com";
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("startParentOriginValidation", () => {
    const options = {
        isOriginValidationEnabled: true,
        isIframeEmbedded: true,
        organizationId: "org",
    };

    function setParent(hasParent: boolean) {
        Object.defineProperty(window, "parent", {
            configurable: true,
            get: () => (hasParent ? { postMessage: vi.fn() } : window),
        });
    }

    beforeEach(() => {
        adoptFakeBackend();
        setParent(true);
    });

    afterEach(() => {
        stopParentOriginResolution();
        resetEventGate();
        setParent(false);
        resetBackend();
        vi.clearAllMocks();
    });

    it("holds the events and validates the parent origin when validation is on in a frame", async () => {
        isUrlValid.mockReturnValue(new Promise(() => {}));

        startParentOriginValidation(options);
        await flushPromises();

        expect(getEventGateState()).toEqual({ type: "holding" });
        expect(isUrlValid).toHaveBeenCalledWith("*", "UI_EVENT");
    });

    it("opens to the handshake origin with no call", () => {
        startParentOriginValidation({ ...options, handshakeOrigin: PARENT });

        expect(getEventGateState()).toEqual({ type: "open", targetOrigin: PARENT });
        expect(isUrlValid).not.toHaveBeenCalled();
    });

    it.each([
        ["validation is off", { isOriginValidationEnabled: false }, true],
        ["the URL is not an embed URL", { isIframeEmbedded: false }, true],
        ["the frame has no parent", {}, false],
    ])("keeps the events going to * when %s", (_name, overrides, hasParent) => {
        setParent(hasParent);

        startParentOriginValidation({ ...options, ...overrides });

        expect(getEventGateState()).toEqual({ type: "passthrough" });
        expect(isUrlValid).not.toHaveBeenCalled();
    });
});
