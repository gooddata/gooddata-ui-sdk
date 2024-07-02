// (C) 2020-2024 GoodData Corporation
import { ContextDeferredAuthProvider } from "../auth.js";
import { TigerBackend } from "../backend/index.js";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("ContextDeferredAuthProvider", () => {
    describe("deauthenticate", () => {
        const hostname = "https://domain.gooddata.com";
        let originalWindow;
        beforeEach(() => {
            originalWindow = global.window;
        });

        afterEach(() => {
            global.window = originalWindow;
        });

        it.each([
            [undefined, `${hostname}/logout`],
            ["https://redirect.gooddata.com", `${hostname}/logout?returnTo=https://redirect.gooddata.com`],
        ])('should set deauthenticate for returnTo="%s" to be "%s"', async (returnTo, expectedLogoutUrl) => {
            const assign = vi.fn();
            global.window = {
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
