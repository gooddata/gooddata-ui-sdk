// (C) 2026 GoodData Corporation

import { afterEach, describe, expect, it } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-base";

import { createBackendFactory, wrapWithCustomWorkspaceSettings } from "./backend.js";

const customWindow = window as { customWorkspaceSettings?: Record<string, unknown> };

describe("createBackendFactory", () => {
    it("keeps the backend instance when the API token is renewed in place", () => {
        const factory = createBackendFactory({ auth: { type: "apiToken", token: "token-1" } });
        const backend = factory.getBackend();

        factory.setApiToken("token-2");

        expect(factory.getBackend()).toBe(backend);
        expect(factory.getAuthCredentials()).toEqual({ type: "apiToken", token: "token-2" });
    });

    it("rebuilds the backend when the auth type changes", () => {
        const factory = createBackendFactory({ auth: { type: "contextDeferred" } });
        const backend = factory.getBackend();

        factory.setApiToken("token");

        expect(factory.getBackend()).not.toBe(backend);
        expect(factory.getAuthCredentials()).toEqual({ type: "apiToken", token: "token" });
    });

    it("exposes the cache controls of the caching decorator", () => {
        const factory = createBackendFactory({ auth: { type: "contextDeferred" } });

        expect(() => {
            factory.resetAllCaches();
            factory.resetCatalogs();
        }).not.toThrow();
    });

    // The provider decodes the payload; no reminder, so the test leaves no timer behind.
    const fakeJwt = (sub: string) =>
        `header.${btoa(JSON.stringify({ sub, exp: Math.floor(Date.now() / 1000) + 3600 }))}.signature`;
    const NO_REMINDER = 0;

    it("keeps the backend instance when the JWT is renewed in place", () => {
        const factory = createBackendFactory({
            auth: {
                type: "jwt",
                token: fakeJwt("user"),
                secondsBeforeTokenExpirationToCallReminder: NO_REMINDER,
            },
        });
        const backend = factory.getBackend();

        factory.setJwt(fakeJwt("user"), NO_REMINDER);

        expect(factory.getBackend()).toBe(backend);
    });

    it("rebuilds the backend when the auth type changes back, not the provider it dropped", () => {
        const factory = createBackendFactory({ auth: { type: "apiToken", token: "token-1" } });
        const apiTokenBackend = factory.getBackend();

        factory.setJwt(fakeJwt("user"), NO_REMINDER);
        const jwtBackend = factory.getBackend();
        expect(jwtBackend).not.toBe(apiTokenBackend);

        factory.setApiToken("token-2");

        expect(factory.getBackend()).not.toBe(jwtBackend);
        expect(factory.getBackend()).not.toBe(apiTokenBackend);
        expect(factory.getAuthCredentials()).toEqual({ type: "apiToken", token: "token-2" });
    });

    it("rebuilds the backend on the reverse round trip as well", () => {
        const factory = createBackendFactory({
            auth: {
                type: "jwt",
                token: fakeJwt("user"),
                secondsBeforeTokenExpirationToCallReminder: NO_REMINDER,
            },
        });

        factory.setApiToken("token");
        const apiTokenBackend = factory.getBackend();
        const renewedJwt = fakeJwt("other-user");
        factory.setJwt(renewedJwt, NO_REMINDER);

        expect(factory.getBackend()).not.toBe(apiTokenBackend);
        expect(factory.getAuthCredentials()).toEqual({
            type: "jwt",
            token: renewedJwt,
            secondsBeforeTokenExpirationToCallReminder: NO_REMINDER,
        });
    });
});

describe("wrapWithCustomWorkspaceSettings", () => {
    afterEach(() => {
        delete customWindow.customWorkspaceSettings;
    });

    it("returns the backend unchanged when window.customWorkspaceSettings is not set", () => {
        const backend = dummyBackend();

        expect(wrapWithCustomWorkspaceSettings(backend)).toBe(backend);
    });

    it("lets window.customWorkspaceSettings win over the workspace settings", async () => {
        customWindow.customWorkspaceSettings = { enableGenAiAgentSwitching: true, locale: "de-DE" };

        const settings = await wrapWithCustomWorkspaceSettings(dummyBackend())
            .workspace("ws")
            .settings()
            .getSettingsForCurrentUser();

        expect(settings).toMatchObject({ enableGenAiAgentSwitching: true, locale: "de-DE" });
    });
});
