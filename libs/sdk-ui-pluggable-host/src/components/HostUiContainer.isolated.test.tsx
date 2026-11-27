// (C) 2026 GoodData Corporation

import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IHostUiMountHandle,
    type IHostUiMountOptions,
    type IPlatformContext,
} from "@gooddata/sdk-pluggable-application-model";

import { registerAppLifecycleCallbacks } from "../loader/pluggableApplicationsLoader.js";
import { type IResolvedHostUiModule } from "../ui/resolveHostUiModule.js";

import { HostUiContainer } from "./HostUiContainer.js";

// `vi.hoisted` is what makes these usable from the `vi.mock` factories: the factories run while the
// static `HostUiContainer` import above is being evaluated, which is before this file's own top-level
// `const`s would be initialized. Hoisting them keeps the mocks this file configures and asserts on the
// very same instances the component under test resolves.
const {
    mount,
    resolveHostUiModuleMock,
    runGuardedNavigationMock,
    rejectHostUiModuleOnContextChangeMock,
    rejectHostUiModuleOnMountFailureMock,
} = vi.hoisted(() => ({
    mount: vi.fn<(options: IHostUiMountOptions) => IHostUiMountHandle>(),
    resolveHostUiModuleMock: vi.fn<typeof import("../ui/resolveHostUiModule.js").resolveHostUiModule>(),
    runGuardedNavigationMock: vi.fn<typeof import("./navigationGuard.js").runGuardedNavigation>(),
    rejectHostUiModuleOnContextChangeMock:
        vi.fn<typeof import("../ui/resolveHostUiModule.js").rejectHostUiModuleOnContextChange>(),
    rejectHostUiModuleOnMountFailureMock:
        vi.fn<typeof import("../ui/resolveHostUiModule.js").rejectHostUiModuleOnMountFailure>(),
}));

vi.mock("../ui/resolveHostUiModule.js", () => ({
    resolveHostUiModule: resolveHostUiModuleMock,
    rejectHostUiModuleOnContextChange: rejectHostUiModuleOnContextChangeMock,
    rejectHostUiModuleOnMountFailure: rejectHostUiModuleOnMountFailureMock,
}));

vi.mock("./navigationGuard.js", async () => {
    const actual = await vi.importActual<typeof import("./navigationGuard.js")>("./navigationGuard.js");
    runGuardedNavigationMock.mockImplementation(actual.runGuardedNavigation);
    return { ...actual, runGuardedNavigation: runGuardedNavigationMock };
});

const onHostUiMounted = vi.fn();

const userSettings = {} as IPlatformContext["userSettings"];
const ctx: IPlatformContext = {
    version: "1.0",
    embeddingMode: "none",
    auth: { type: "contextDeferred" },
    user: { login: "john.doe" } as IPlatformContext["user"],
    userSettings,
    settings: userSettings,
    whiteLabeling: undefined,
    organization: { id: "org1", title: "Acme Corp" },
    preferredLocale: "en-US",
    // Keeps the host-owned chat out of the tree; it would otherwise need a live backend.
    isExportMode: true,
};

const INITIAL_PATHNAME = "/workspace/ws1/analyze";
const NEXT_PATHNAME = "/workspace/ws2/analyze";
const PAGE_PATHNAME = "/workspace/ws2/analyze/edit";
const TARGET = "/organization/settings";

async function flushHostUiMount(): Promise<void> {
    await act(async () => {
        await Promise.resolve();
    });
}

describe("HostUiContainer", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mount.mockImplementation(() => ({
            getAppContainer: () => document.createElement("div"),
            unmount: vi.fn(),
        }));
        resolveHostUiModuleMock.mockResolvedValue({ hostUiModule: { mount } });
        rejectHostUiModuleOnContextChangeMock.mockReturnValue(false);
        rejectHostUiModuleOnMountFailureMock.mockImplementation(
            (resolved) => resolved.moduleId !== undefined,
        );
        registerAppLifecycleCallbacks({ onHostUiMounted });
    });

    afterEach(() => {
        registerAppLifecycleCallbacks({});
    });

    it("checks a loaded remote UI module against the context that changed during its load", async () => {
        const remoteMount = vi.fn<(options: IHostUiMountOptions) => IHostUiMountHandle>();
        const remote: IResolvedHostUiModule = {
            hostUiModule: { mount: remoteMount },
            moduleId: "remote_ui",
            remote: { url: "https://example.com/remoteEntry.js", scope: "remote_ui" },
        };
        let finishLoad: (resolved: IResolvedHostUiModule) => void = () => {};
        resolveHostUiModuleMock.mockImplementation((_ctx, useDefault) =>
            useDefault
                ? Promise.resolve({ hostUiModule: { mount } })
                : new Promise((resolve) => {
                      finishLoad = resolve;
                  }),
        );
        rejectHostUiModuleOnContextChangeMock.mockImplementation(
            (resolved, nextCtx) => resolved.remote !== undefined && nextCtx.organization?.id === "org2",
        );
        const nextCtx = { ...ctx, organization: { id: "org2", title: "Other" } };

        const { rerender, unmount } = render(
            <HostUiContainer ctx={ctx} apps={[]} pathname={INITIAL_PATHNAME} routerNavigate={vi.fn()} />,
        );
        rerender(
            <HostUiContainer ctx={nextCtx} apps={[]} pathname={INITIAL_PATHNAME} routerNavigate={vi.fn()} />,
        );
        await act(async () => {
            finishLoad(remote);
            await Promise.resolve();
        });
        await flushHostUiMount();

        expect(rejectHostUiModuleOnContextChangeMock).toHaveBeenCalledWith(remote, nextCtx, "rejected");
        expect(remoteMount).not.toHaveBeenCalled();
        expect(mount).toHaveBeenCalledTimes(1);

        unmount();
        await flushHostUiMount();
    });

    it("replaces a host UI module whose mount throws with the default one", async () => {
        const remote: IResolvedHostUiModule = {
            hostUiModule: {
                mount: () => {
                    throw new Error("broken chrome");
                },
            },
            moduleId: "remote_ui",
            remote: { url: "https://example.com/remoteEntry.js", scope: "remote_ui" },
        };
        resolveHostUiModuleMock.mockImplementation((_ctx, useDefault) =>
            Promise.resolve(useDefault ? { hostUiModule: { mount } } : remote),
        );

        const { unmount } = render(
            <HostUiContainer ctx={ctx} apps={[]} pathname={INITIAL_PATHNAME} routerNavigate={vi.fn()} />,
        );
        await flushHostUiMount();
        await flushHostUiMount();

        expect(rejectHostUiModuleOnMountFailureMock).toHaveBeenCalledWith(remote, expect.any(Error));
        expect(mount).toHaveBeenCalledTimes(1);
        expect(onHostUiMounted).toHaveBeenCalledTimes(1);

        unmount();
        await flushHostUiMount();
    });

    it("replaces a remote UI module with the default one when a context change fails its security check", async () => {
        let organizationAllowed = true;
        rejectHostUiModuleOnContextChangeMock.mockImplementation(
            (resolved) => !organizationAllowed && resolved.remote !== undefined,
        );
        const remoteUnmount = vi.fn();
        const remoteMount = vi.fn<(options: IHostUiMountOptions) => IHostUiMountHandle>(() => ({
            getAppContainer: () => document.createElement("div"),
            unmount: remoteUnmount,
        }));
        resolveHostUiModuleMock.mockImplementation((_ctx, useDefault) =>
            Promise.resolve(
                useDefault
                    ? { hostUiModule: { mount } }
                    : {
                          hostUiModule: { mount: remoteMount },
                          moduleId: "remote_ui",
                          remote: { url: "https://example.com/remoteEntry.js", scope: "remote_ui" },
                      },
            ),
        );
        const { rerender, unmount } = render(
            <HostUiContainer ctx={ctx} apps={[]} pathname={INITIAL_PATHNAME} routerNavigate={vi.fn()} />,
        );
        await flushHostUiMount();
        expect(remoteMount).toHaveBeenCalledTimes(1);

        organizationAllowed = false;
        rerender(
            <HostUiContainer
                ctx={{ ...ctx, organization: { id: "org2", title: "Other" } }}
                apps={[]}
                pathname={INITIAL_PATHNAME}
                routerNavigate={vi.fn()}
            />,
        );
        await flushHostUiMount();
        await flushHostUiMount();

        expect(remoteUnmount).toHaveBeenCalledTimes(1);
        expect(rejectHostUiModuleOnContextChangeMock).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.anything(),
            "unmounted",
        );
        expect(resolveHostUiModuleMock).toHaveBeenLastCalledWith(expect.anything(), true);
        expect(mount).toHaveBeenCalledTimes(1);
        expect(onHostUiMounted).toHaveBeenCalledTimes(1);

        unmount();
        await flushHostUiMount();
    });

    it("keeps the navigate callback given to the host UI module bound to the latest router and page path", async () => {
        const firstRouterNavigate = vi.fn();
        const { rerender, unmount } = render(
            <HostUiContainer
                ctx={ctx}
                apps={[]}
                pathname={INITIAL_PATHNAME}
                routerNavigate={firstRouterNavigate}
            />,
        );
        await flushHostUiMount();

        expect(mount).toHaveBeenCalledTimes(1);
        const { navigate } = mount.mock.calls[0]![0];

        const secondRouterNavigate = vi.fn();
        rerender(
            <HostUiContainer
                ctx={ctx}
                apps={[]}
                pathname={NEXT_PATHNAME}
                routerNavigate={secondRouterNavigate}
            />,
        );
        await flushHostUiMount();

        // A second mount would mean the callback identity changed and the module kept a stale closure.
        expect(mount).toHaveBeenCalledTimes(1);

        // An application's own router moves the page URL past the host router's pathname.
        window.history.replaceState(null, "", PAGE_PATHNAME);
        navigate(TARGET);

        expect(firstRouterNavigate).not.toHaveBeenCalled();
        expect(secondRouterNavigate).toHaveBeenCalledTimes(1);
        expect(secondRouterNavigate).toHaveBeenCalledWith(TARGET);
        expect(runGuardedNavigationMock.mock.calls[0]![0]).toMatchObject({
            url: TARGET,
            currentPathname: PAGE_PATHNAME,
        });

        // The container tears the app root down in a microtask, so draining it has to stay inside act.
        unmount();
        await flushHostUiMount();
    });
});
