// (C) 2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type PluggableApplicationRegistryItem } from "@gooddata/sdk-model";

const loadLocalMock = vi.fn();
const preloadRemoteMock = vi.fn();

vi.mock("./localLoader.js", () => ({
    loadLocalPluggableApplication: loadLocalMock,
}));

vi.mock("./remoteLoader.js", () => ({
    loadRemotePluggableApplication: vi.fn(),
    preloadRemotePluggableApplication: preloadRemoteMock,
}));

const localApp = {
    id: "gdc-dashboards",
    local: { module: "dashboards" },
} as unknown as PluggableApplicationRegistryItem;

function setConnection(connection: unknown): void {
    Object.defineProperty(navigator, "connection", {
        configurable: true,
        value: connection,
    });
}

describe("pluggableApplicationsLoader", () => {
    beforeEach(() => {
        // The module under test is imported by the host components, so with isolation off another
        // test file may already have it cached — bound to the real `localLoader`/`remoteLoader`
        // instead of the mocks above. Rebuild the graph so every import below is this file's.
        vi.resetModules();
    });

    afterEach(() => {
        Reflect.deleteProperty(navigator, "connection");
        vi.clearAllMocks();
    });

    describe("shouldSkipPreload", () => {
        it("preloads when the browser exposes no connection information", async () => {
            setConnection(undefined);

            const { shouldSkipPreload } = await import("./pluggableApplicationsLoader.js");

            expect(shouldSkipPreload()).toBe(false);
        });

        it("preloads on a connection fast enough to spare the bandwidth", async () => {
            setConnection({ effectiveType: "4g", saveData: false });

            const { shouldSkipPreload } = await import("./pluggableApplicationsLoader.js");

            expect(shouldSkipPreload()).toBe(false);
        });

        it.each(["2g", "slow-2g"])(
            "skips preloading on %s, where bandwidth is the bottleneck",
            async (effectiveType) => {
                setConnection({ effectiveType });

                const { shouldSkipPreload } = await import("./pluggableApplicationsLoader.js");

                expect(shouldSkipPreload()).toBe(true);
            },
        );

        it("skips preloading when the user asked to save data", async () => {
            setConnection({ effectiveType: "4g", saveData: true });

            const { shouldSkipPreload } = await import("./pluggableApplicationsLoader.js");

            expect(shouldSkipPreload()).toBe(true);
        });
    });

    describe("preloadPluggableApplication", () => {
        it("does not touch the network when preloading is skipped", async () => {
            setConnection({ saveData: true });

            const { preloadPluggableApplication } = await import("./pluggableApplicationsLoader.js");
            preloadPluggableApplication(localApp);

            expect(loadLocalMock).not.toHaveBeenCalled();
        });

        it("preloads when the connection allows it", async () => {
            setConnection({ effectiveType: "4g" });
            loadLocalMock.mockResolvedValueOnce({ mount: vi.fn() });

            const { preloadPluggableApplication } = await import("./pluggableApplicationsLoader.js");
            preloadPluggableApplication(localApp);

            expect(loadLocalMock).toHaveBeenCalledWith("gdc-dashboards");
        });
    });
});
