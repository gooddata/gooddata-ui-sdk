// (C) 2026 GoodData Corporation

import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IHostUiMountHandle,
    type IHostUiMountOptions,
    type IPlatformContext,
} from "@gooddata/sdk-pluggable-application-model";

import { resolveHostUiModule } from "../../ui/resolveHostUiModule.js";
import { HostUiContainer } from "../HostUiContainer.js";
import { runGuardedNavigation } from "../navigationGuard.js";

vi.mock("../../ui/resolveHostUiModule.js", () => ({
    resolveHostUiModule: vi.fn(),
}));

vi.mock("../navigationGuard.js", async () => {
    const actual = await vi.importActual<typeof import("../navigationGuard.js")>("../navigationGuard.js");
    return { ...actual, runGuardedNavigation: vi.fn(actual.runGuardedNavigation) };
});

const mount = vi.fn<(options: IHostUiMountOptions) => IHostUiMountHandle>();

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
        vi.mocked(resolveHostUiModule).mockResolvedValue({ mount });
    });

    it("keeps the navigate callback given to the host UI module bound to the latest router and pathname", async () => {
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

        navigate(TARGET);

        expect(firstRouterNavigate).not.toHaveBeenCalled();
        expect(secondRouterNavigate).toHaveBeenCalledTimes(1);
        expect(secondRouterNavigate).toHaveBeenCalledWith(TARGET);
        expect(vi.mocked(runGuardedNavigation).mock.calls[0]![0]).toMatchObject({
            url: TARGET,
            currentPathname: NEXT_PATHNAME,
        });

        // The container tears the app root down in a microtask, so draining it has to stay inside act.
        unmount();
        await flushHostUiMount();
    });
});
