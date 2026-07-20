// (C) 2020-2026 GoodData Corporation

import { type AxiosAdapter } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type ITigerClient, type IUserProfile, newAxios } from "@gooddata/api-client-tiger";
import * as profile from "@gooddata/api-client-tiger/endpoints/profile";

import { ContextDeferredAuthProvider, TigerTokenAuthProvider } from "../auth.js";
import { TigerBackend } from "../backend/index.js";

vi.mock("@gooddata/api-client-tiger/endpoints/profile", () => ({
    ProfileApi_GetCurrent: vi.fn(),
}));

/**
 * A cache-enabled axios instance (as created by the tiger client factories) whose adapter serves
 * every GET with a cacheable max-age, so repeat reads are served from the response cache.
 */
function createCachedAxiosStub() {
    let hits = 0;
    const adapter: AxiosAdapter = async (config) => {
        hits += 1;
        return {
            data: { ok: true },
            status: 200,
            statusText: "OK",
            headers: { "cache-control": "max-age=60" },
            config,
        };
    };
    const instance = newAxios();
    instance.defaults.adapter = adapter;
    return { instance, hits: () => hits };
}

function userProfile(userId: string): IUserProfile {
    return {
        name: "Test User",
        userId,
        organizationName: "org",
        organizationId: "org-1",
        links: { user: "", organization: "" },
        entitlements: [],
    };
}

describe("TigerTokenAuthProvider", () => {
    describe("updateApiToken", () => {
        it("clears the cached responses of every client when the token changes", async () => {
            const stubA = createCachedAxiosStub();
            const stubB = createCachedAxiosStub();
            const provider = new TigerTokenAuthProvider("token-of-user-a");
            provider.initializeClient({ axios: stubA.instance } as ITigerClient);
            provider.initializeClient({ axios: stubB.instance } as ITigerClient);

            await stubA.instance.get("/api/v1/settings");
            await stubA.instance.get("/api/v1/settings");
            await stubB.instance.get("/api/v1/settings");
            expect(stubA.hits()).toBe(1); // repeat read served from the cache
            expect(stubB.hits()).toBe(1);

            provider.updateApiToken("token-of-user-b");

            await stubA.instance.get("/api/v1/settings");
            await stubB.instance.get("/api/v1/settings");
            expect(stubA.hits()).toBe(2); // caches dropped together with the credential
            expect(stubB.hits()).toBe(2);
            expect(stubA.instance.defaults.headers.common["Authorization"]).toBe("Bearer token-of-user-b");
        });

        it("keeps caches warm when the token value did not change", async () => {
            const stub = createCachedAxiosStub();
            const provider = new TigerTokenAuthProvider("token");
            provider.initializeClient({ axios: stub.instance } as ITigerClient);

            await stub.instance.get("/api/v1/settings");
            provider.updateApiToken("token");
            await stub.instance.get("/api/v1/settings");

            expect(stub.hits()).toBe(1);
        });

        it("drops the memoized principal so the next read reflects the new credential", async () => {
            const stub = createCachedAxiosStub();
            const provider = new TigerTokenAuthProvider("token-of-user-a");
            const client = { axios: stub.instance } as ITigerClient;
            provider.initializeClient(client);
            const context = { backend: new TigerBackend({}), client };
            vi.mocked(profile.ProfileApi_GetCurrent)
                .mockResolvedValueOnce(userProfile("user-a"))
                .mockResolvedValueOnce(userProfile("user-b"));

            await provider.authenticate(context);
            expect((await provider.getCurrentPrincipal(context))?.userId).toBe("user-a");

            provider.updateApiToken("token-of-user-b");

            expect((await provider.getCurrentPrincipal(context))?.userId).toBe("user-b");
        });
    });
});

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
