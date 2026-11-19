// (C) 2026 GoodData Corporation

import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { GdcAdCommandType, GdcProductName } from "@gooddata/sdk-embedding";

const { postEvent, setApiToken, setJwt } = vi.hoisted(() => ({
    postEvent: vi.fn(),
    setApiToken: vi.fn(),
    setJwt: vi.fn(),
}));

type WaitForInjectedApiTokenModule = typeof import("./waitForInjectedApiToken.js");
type WaitForInjectedApiToken = WaitForInjectedApiTokenModule["waitForInjectedApiToken"];

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
    let shouldWaitForInjectedApiToken: WaitForInjectedApiTokenModule["shouldWaitForInjectedApiToken"];
    let resetHostBasePath: () => void;

    // The package shares one module registry between test files (isolate: false), so this file loads
    // its own copy with the mocks and drops it afterwards.
    beforeAll(async () => {
        vi.resetModules();
        vi.doMock("@gooddata/sdk-embedding/internal", () => ({ messagingUtils: { postEvent } }));
        vi.doMock("./backend.js", () => ({ setApiToken, setJwt }));
        ({ waitForInjectedApiToken, shouldWaitForInjectedApiToken } =
            await import("./waitForInjectedApiToken.js"));
        // This file's module copy keeps its own detected base path.
        ({ resetHostBasePath } = await import("../loader/hostBasePath.js"));
    });

    afterAll(() => {
        vi.doUnmock("@gooddata/sdk-embedding/internal");
        vi.doUnmock("./backend.js");
        vi.resetModules();
    });

    afterEach(() => {
        vi.clearAllMocks();
        window.history.replaceState(null, "", "/");
        resetHostBasePath();
    });

    it.each([
        ["an embedded URL", "/embedded/workspace/ws1/dashboards/?apiTokenAuthentication=true", true],
        [
            "a prefixed embedded URL",
            "/ext/gdcn/embedded/workspace/ws1/dashboards/?apiTokenAuthentication=true",
            true,
        ],
        [
            "a prefixed embedded URL with the flag in the hash",
            "/ext/gdcn/embedded/workspace/ws1/dashboards/#/dashboard/d1?apiTokenAuthentication=true",
            true,
        ],
        [
            "a prefixed URL that is not embedded",
            "/ext/gdcn/workspace/ws1/dashboards/?apiTokenAuthentication=true",
            false,
        ],
        ["a prefixed embedded URL without the flag", "/ext/gdcn/embedded/workspace/ws1/dashboards/", false],
    ])("decides whether to wait for the token on %s", (_case, url, expected) => {
        window.history.replaceState(null, "", url);

        expect(shouldWaitForInjectedApiToken()).toBe(expected);
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
