// (C) 2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type IRemotePluggableApplicationModule } from "@gooddata/sdk-model";

const loadRemoteMock = vi.fn();
const registerRemotesMock = vi.fn();
const preloadRemoteMock = vi.fn();

vi.mock("@module-federation/runtime", () => ({
    createInstance: () => ({
        loadRemote: loadRemoteMock,
        registerRemotes: registerRemotesMock,
        preloadRemote: preloadRemoteMock,
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
        preloadRemoteMock.mockReset();
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

    describe("preloadRemotePluggableApplication", () => {
        it('warms only the expose\'s "sync" assets', async () => {
            // "all" additionally pulls the expose's whole async chunk graph — hundreds of files
            // per application — which on a slow connection starves the page the user is on and
            // makes the preload links time out. See LX-2791.
            preloadRemoteMock.mockResolvedValueOnce(undefined);

            const { preloadRemotePluggableApplication } = await import("../remoteLoader.js");
            await preloadRemotePluggableApplication(remote);

            expect(preloadRemoteMock).toHaveBeenCalledWith([
                {
                    nameOrAlias: "gdc_home_ui",
                    exposes: ["pluggableApp"],
                    resourceCategory: "sync",
                },
            ]);
        });

        it("reports a failed warm-up as a warning, not an error", async () => {
            // A preload that times out on a slow link is not a failure the user can act on —
            // the application still loads on demand. Logging it as an error made it look like
            // a broken remote in the console.
            const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
            const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
            preloadRemoteMock.mockRejectedValueOnce(new Error("preloadRemote failed to load 1 resource(s)."));

            const { preloadRemotePluggableApplication } = await import("../remoteLoader.js");

            await expect(preloadRemotePluggableApplication(remote)).rejects.toThrow(
                /failed to load 1 resource/,
            );
            expect(warn).toHaveBeenCalledOnce();
            expect(error).not.toHaveBeenCalled();
        });
    });
});
