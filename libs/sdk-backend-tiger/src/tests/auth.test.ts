// (C) 2020-2025 GoodData Corporation
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContextDeferredAuthProvider } from "../auth.js";
import { TigerBackend } from "../backend/index.js";

describe("ContextDeferredAuthProvider", () => {
    describe("deauthenticate", () => {
        const hostname = "https://domain.gooddata.com";
        let originalWindow: Window & typeof globalThis;
        beforeEach(() => {
            originalWindow = globalThis.window;
        });

        afterEach(() => {
            globalThis.window = originalWindow;
        });

        it.each([
            [undefined, `${hostname}/logout`],
            ["https://redirect.gooddata.com", `${hostname}/logout?returnTo=https://redirect.gooddata.com`],
        ])('should set deauthenticate for returnTo="%s" to be "%s"', async (returnTo, expectedLogoutUrl) => {
            const assign = vi.fn();
            globalThis.window = {
                location: {
                    assign,
                },
            } as any;
            const provider = new ContextDeferredAuthProvider();
            const backend = new TigerBackend({ hostname });
            const context = {
                backend,
                client: null,
            };
            await provider.deauthenticate(context, returnTo);
            expect(assign).toHaveBeenCalledWith(expectedLogoutUrl);
        });
    });
});
