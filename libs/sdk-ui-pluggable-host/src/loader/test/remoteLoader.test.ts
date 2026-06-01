// (C) 2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type IRemotePluggableApplicationModule } from "@gooddata/sdk-model";

const loadRemoteMock = vi.fn();
const registerRemotesMock = vi.fn();

vi.mock("@module-federation/runtime", () => ({
    createInstance: () => ({
        loadRemote: loadRemoteMock,
        registerRemotes: registerRemotesMock,
        preloadRemote: vi.fn(),
    }),
}));

const remote: IRemotePluggableApplicationModule = {
    url: "/organization/remotes/gdc-home-ui/remoteEntry.js",
    scope: "gdc_home_ui",
    module: "./pluggableApp",
    routeBase: "/settings",
};

describe("remoteLoader.loadRemotePluggableApplication", () => {
    beforeEach(() => {
        loadRemoteMock.mockReset();
        registerRemotesMock.mockReset();
        // Replace window.location to satisfy isAllowedRemoteHostname for relative remote URLs.
        Object.defineProperty(window, "location", {
            configurable: true,
            value: { hostname: "localhost", origin: "https://localhost" },
        });
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("throws a clear error when federation resolves to an empty module — the symptom of a swallowed vite:preloadError", async () => {
        // Why this is here: when chunkReloadGuard previously called preventDefault on
        // vite:preloadError, the preload helper returned undefined, MF's expose factory ran
        // `Object.assign({}, undefined)` and produced an empty namespace, and asPluggableApp
        // had to throw — leaving Pingdom looking at "does not export a valid pluggable app"
        // instead of a stale-chunk reload. Lock the assertion in so a future regression to
        // the silent-empty path is caught.
        loadRemoteMock.mockResolvedValueOnce({});

        const { loadRemotePluggableApplication } = await import("../remoteLoader.js");

        await expect(loadRemotePluggableApplication(remote)).rejects.toThrow(
            /does not export a valid pluggable app/,
        );
    });

    it("rejects when the loaded module's mount is not a function", async () => {
        loadRemoteMock.mockResolvedValueOnce({ pluggableApp: { mount: "not a function" } });

        const { loadRemotePluggableApplication } = await import("../remoteLoader.js");

        await expect(loadRemotePluggableApplication(remote)).rejects.toThrow(
            /does not export a valid pluggable app/,
        );
    });

    it("returns the pluggable app when the loaded module exposes a valid mount", async () => {
        const app = { mount: vi.fn() };
        loadRemoteMock.mockResolvedValueOnce({ pluggableApp: app });

        const { loadRemotePluggableApplication } = await import("../remoteLoader.js");

        await expect(loadRemotePluggableApplication(remote)).resolves.toBe(app);
    });

    it("falls back to the default export when pluggableApp is absent", async () => {
        const app = { mount: vi.fn() };
        loadRemoteMock.mockResolvedValueOnce({ default: app });

        const { loadRemotePluggableApplication } = await import("../remoteLoader.js");

        await expect(loadRemotePluggableApplication(remote)).resolves.toBe(app);
    });
});
