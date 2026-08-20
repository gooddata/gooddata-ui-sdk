// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { act, render } from "@testing-library/react";
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    type ILocalPluggableApplicationRegistryItemV1,
    type PluggableApplicationRegistryItem,
} from "@gooddata/sdk-model";
import {
    type IHostNavigationRequest,
    type IPlatformContext,
    type IPluggableApp,
    type IPluggableApplicationMountHandle,
} from "@gooddata/sdk-pluggable-application-model";

import { type AppSecurityFailure } from "../../loader/appSecurityValidation.js";
import { type IAppLifecycleCallbacks } from "../../types/lifecycle.js";

const mocks = vi.hoisted(() => ({
    loadPluggableApplication: vi.fn<(app: PluggableApplicationRegistryItem) => Promise<IPluggableApp>>(),
    getAppLifecycleCallbacks: vi.fn<() => IAppLifecycleCallbacks | undefined>(),
    validateAppSecurity:
        vi.fn<
            (
                app: PluggableApplicationRegistryItem,
                loadedApp: IPluggableApp,
                ctx: IPlatformContext,
            ) => AppSecurityFailure | undefined
        >(),
    getSecuredRemoteAppValidUntil:
        vi.fn<(app: PluggableApplicationRegistryItem, loadedApp: IPluggableApp) => number | undefined>(),
}));

vi.mock("../../loader/pluggableApplicationsLoader.js", () => ({
    loadPluggableApplication: mocks.loadPluggableApplication,
    getAppLifecycleCallbacks: mocks.getAppLifecycleCallbacks,
}));

vi.mock("../../loader/appSecurityValidation.js", () => ({
    validateAppSecurity: mocks.validateAppSecurity,
    getSecuredRemoteAppValidUntil: mocks.getSecuredRemoteAppValidUntil,
}));

type NavigationGuard = (request: IHostNavigationRequest) => boolean;
type NavigationGuardRef = { current: NavigationGuard | undefined };

const userSettings = {} as IPlatformContext["userSettings"];

function context(): IPlatformContext {
    return {
        version: "1.0",
        embeddingMode: "none",
        auth: { type: "contextDeferred" },
        user: { login: "john.doe" } as IPlatformContext["user"],
        userSettings,
        settings: userSettings,
        whiteLabeling: undefined,
        organization: { id: "org1", title: "Acme Corp" },
        preferredLocale: "en-US",
    };
}

const app: ILocalPluggableApplicationRegistryItemV1 = {
    apiVersion: "1.0",
    id: "gdc-analytical-designer",
    title: "Analytical Designer",
    applicationScope: "workspace",
    menuOrder: 10,
    local: { routeBase: "/analyze" },
};

const WS1_PATHNAME = "/workspace/ws1/analyze";
const WS2_PATHNAME = "/workspace/ws2/analyze";

// The components are also imported by HostUiContainer, so with isolation off a test file that rendered
// the host container earlier left them cached — wired to the *real* loader and security validation
// rather than the mocks above. Dropping the cached graph re-imports them through the mocks.
//
// This runs while the file is still being imported, not from a `beforeAll`: loading this graph for the
// first time in a worker costs seconds (the intl/ui-kit/gen-ai dependencies behind the renderer), and
// on a loaded CI machine that overran the 10s `hookTimeout`. Module loading has no such budget. The
// reset itself is cheap — only this package's own modules are re-evaluated, its dependencies stay
// cached by Node — so there is nothing left to move off the import path.
vi.resetModules();
const { HostIntlProvider } = await import("../HostIntlProvider.js");
const { PluggableApplicationRenderer } = await import("../PluggableApplicationRenderer.js");

function renderer(options: {
    pathname: string;
    ctx: IPlatformContext;
    navigationRequestRef: NavigationGuardRef;
}): ReactElement {
    return (
        <HostIntlProvider locale="en-US">
            <PluggableApplicationRenderer
                app={app}
                ctx={options.ctx}
                pathname={options.pathname}
                navigationRequestRef={options.navigationRequestRef}
            />
        </HostIntlProvider>
    );
}

// The mount effect awaits the app load, so the guard is registered a microtask after render.
async function flushMount(): Promise<void> {
    await act(async () => {
        await Promise.resolve();
    });
}

describe("PluggableApplicationRenderer", () => {
    let onHostNavigationRequested: Mock<NavigationGuard>;
    let navigationRequestRef: NavigationGuardRef;

    beforeEach(() => {
        vi.clearAllMocks();

        navigationRequestRef = { current: undefined };
        mocks.validateAppSecurity.mockReturnValue(undefined);
        mocks.getSecuredRemoteAppValidUntil.mockReturnValue(undefined);
        mocks.getAppLifecycleCallbacks.mockReturnValue(undefined);
        onHostNavigationRequested = vi.fn<NavigationGuard>().mockReturnValue(true);
        mocks.loadPluggableApplication.mockResolvedValue({
            mount: (): IPluggableApplicationMountHandle => ({
                unmount: vi.fn(),
                onHostNavigationRequested,
            }),
        });
    });

    // A console spy must be undone even when the assertions after it fail.
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("asks the mounted application whether the host may navigate away", async () => {
        render(renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef }));
        await flushMount();

        const request: IHostNavigationRequest = { url: WS2_PATHNAME, proceed: vi.fn() };

        expect(navigationRequestRef.current?.(request)).toBe(true);
        expect(onHostNavigationRequested).toHaveBeenCalledWith(request);
    });

    it("registers a new guard when the application remounts", async () => {
        const { rerender } = render(
            renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef }),
        );
        await flushMount();
        const firstGuard = navigationRequestRef.current;
        expect(firstGuard).toBeDefined();

        // A workspace switch changes the base path, remounting inside the same renderer instance.
        rerender(renderer({ pathname: WS2_PATHNAME, ctx: context(), navigationRequestRef }));
        await flushMount();

        expect(navigationRequestRef.current).toBeDefined();
        expect(navigationRequestRef.current).not.toBe(firstGuard);
    });

    it("leaves no guard registered once the application is gone", async () => {
        const { unmount } = render(
            renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef }),
        );
        await flushMount();
        expect(navigationRequestRef.current).toBeDefined();

        unmount();

        expect(navigationRequestRef.current).toBeUndefined();
    });

    it("leaves no guard registered when the application fails after it was mounted", async () => {
        let guardWhenFailed: NavigationGuard | undefined;
        // Held in one object so the renderer's lifecycle dependency stays referentially stable.
        const lifecycle: IAppLifecycleCallbacks = {
            onRendered: () => {
                guardWhenFailed = navigationRequestRef.current;
                throw new Error("lifecycle callback failed");
            },
        };
        mocks.getAppLifecycleCallbacks.mockReturnValue(lifecycle);
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

        render(renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef }));
        await flushMount();

        expect(guardWhenFailed).toBeDefined();
        expect(navigationRequestRef.current).toBeUndefined();
        expect(consoleError).toHaveBeenCalledOnce();
    });

    it("leaves no guard registered when a context change unmounts the application as insecure", async () => {
        const { rerender } = render(
            renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef }),
        );
        await flushMount();
        expect(navigationRequestRef.current).toBeDefined();

        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
        mocks.validateAppSecurity.mockReturnValue({ kind: "organization-not-allowed" });
        rerender(renderer({ pathname: WS1_PATHNAME, ctx: context(), navigationRequestRef }));
        await flushMount();

        expect(navigationRequestRef.current).toBeUndefined();
        expect(consoleError).toHaveBeenCalledOnce();
    });
});
