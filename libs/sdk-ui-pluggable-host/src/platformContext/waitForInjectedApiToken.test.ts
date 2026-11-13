// (C) 2026 GoodData Corporation

import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { GdcAdCommandType, GdcProductName } from "@gooddata/sdk-embedding";

const { postEvent, setApiToken, setJwt } = vi.hoisted(() => ({
    postEvent: vi.fn(),
    setApiToken: vi.fn(),
    setJwt: vi.fn(),
}));

type WaitForInjectedApiToken = typeof import("./waitForInjectedApiToken.js").waitForInjectedApiToken;

const PARENT = "https://parent.example.com";

function setApiTokenMessage(token: string): MessageEvent {
    return new MessageEvent("message", {
        origin: PARENT,
        source: window.parent,
        data: {
            gdc: {
                product: GdcProductName.ANALYTICAL_DESIGNER,
                event: { name: GdcAdCommandType.SetApiToken, data: { token } },
            },
        },
    });
}

describe("waitForInjectedApiToken", () => {
    let waitForInjectedApiToken: WaitForInjectedApiToken;

    // The package shares one module registry between test files (isolate: false), so this file loads
    // its own copy with the mocks and drops it afterwards.
    beforeAll(async () => {
        vi.resetModules();
        vi.doMock("@gooddata/sdk-embedding/internal", () => ({ messagingUtils: { postEvent } }));
        vi.doMock("./backend.js", () => ({ setApiToken, setJwt }));
        ({ waitForInjectedApiToken } = await import("./waitForInjectedApiToken.js"));
    });

    afterAll(() => {
        vi.doUnmock("@gooddata/sdk-embedding/internal");
        vi.doUnmock("./backend.js");
        vi.resetModules();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("posts listeningForApiToken around the origin gate", () => {
        const controller = new AbortController();
        void waitForInjectedApiToken(controller.signal).catch(() => {});

        expect(postEvent).toHaveBeenCalledTimes(2);
        for (const call of postEvent.mock.calls) {
            expect(call[4]).toEqual({ exempt: true });
        }
        controller.abort();
    });

    it("resolves with the token and the origin of its message", async () => {
        const waiting = waitForInjectedApiToken();

        window.dispatchEvent(setApiTokenMessage("secret"));

        await expect(waiting).resolves.toEqual({
            token: "secret",
            type: "gooddata",
            origin: PARENT,
            isFromParent: true,
        });
        expect(setApiToken).toHaveBeenCalledWith("secret");
    });
});
