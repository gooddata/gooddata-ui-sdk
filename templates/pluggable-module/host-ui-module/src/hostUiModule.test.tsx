// (C) 2026 GoodData Corporation

import { act } from "react";

import { afterEach, describe, expect, it, vi } from "vitest";

import { type PluggableApplicationRegistryItem } from "@gooddata/sdk-model";
import {
    type IHostUiMountHandle,
    type IHostUiMountOptions,
    type IPlatformContext,
} from "@gooddata/sdk-pluggable-application-model";

import { getNavigationItems } from "./HostUi.js";
import { hostUiModule } from "./hostUiModule.js";

// React warns when act() runs outside a test environment that declares it.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const ctx = {
    user: { login: "user@example.com" },
    organization: { id: "org-1", title: "Example organization" },
    currentWorkspaceId: "ws-1",
} as IPlatformContext;

const applications: PluggableApplicationRegistryItem[] = [
    {
        apiVersion: "1.0",
        id: "workspace-app",
        applicationScope: "workspace",
        menuOrder: 2,
        title: "Workspace app",
        local: { routeBase: "/workspace-app" },
    },
    {
        apiVersion: "1.0",
        id: "organization-app",
        applicationScope: "organization",
        menuOrder: 1,
        title: "Organization app",
        local: { routeBase: "/organization-app" },
    },
];

let container: HTMLElement;
let handle: IHostUiMountHandle | undefined;

function mount(overrides: Partial<IHostUiMountOptions> = {}) {
    container = document.createElement("div");
    document.body.appendChild(container);
    act(() => {
        handle = hostUiModule.mount({
            container,
            ctx,
            resolvedApplications: applications,
            pathname: "/organization/organization-app",
            navigate: vi.fn(),
            replace: vi.fn(),
            ...overrides,
        });
    });
    return handle!;
}

describe("hostUiModule", () => {
    afterEach(() => {
        act(() => handle?.unmount());
        handle = undefined;
        container.remove();
    });

    it("returns the app container synchronously and places it in the layout", () => {
        const mounted = mount();

        expect(container.contains(mounted.getAppContainer())).toBe(true);
    });

    it("navigates through the host on a menu click", () => {
        const navigate = vi.fn();
        mount({ navigate });

        act(() => {
            container.querySelector<HTMLAnchorElement>('a[href="/workspace/ws-1/workspace-app"]')!.click();
        });

        expect(navigate).toHaveBeenCalledWith("/workspace/ws-1/workspace-app");
    });

    it("moves the active item when the host pushes a new pathname", () => {
        const mounted = mount();

        act(() => mounted.updatePathname?.("/workspace/ws-1/workspace-app/detail"));

        expect(container.querySelector('[aria-current="page"]')?.textContent).toBe("Workspace app");
    });

    it("keeps the application container when the header fails to render", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const onError = vi.fn();
        const mounted = mount({ onError });
        const brokenItem = {
            key: "broken",
            href: "https://example.com",
            get label(): string {
                throw new Error("broken label");
            },
        };

        act(() => mounted.updateHeader?.({ helpMenuItems: [brokenItem] }));

        expect(container.querySelector("header")).toBeNull();
        expect(container.querySelector('[role="alert"]')).not.toBeNull();
        expect(container.contains(mounted.getAppContainer())).toBe(true);
        expect(onError).toHaveBeenCalledWith("broken label", "gdc-host-ui-template-name");

        act(() => {
            mounted.updateHeader?.(undefined);
            mounted.updatePathname?.("/workspace/ws-1/workspace-app");
        });

        expect(container.querySelector("header")).not.toBeNull();
    });

    it("renders only the application container in the export mode", () => {
        const mounted = mount({ ctx: { ...ctx, isExportMode: true } });

        expect(document.title).toBe("Organization app");
        act(() => mounted.notify?.({ type: "newDeploymentAvailable", commitHash: "abc" }));

        expect(container.querySelector("header")).toBeNull();
        expect(container.querySelector('[role="status"]')).toBeNull();
        expect(container.contains(mounted.getAppContainer())).toBe(true);
    });
});

describe("hostUiModule theme", () => {
    it("applies the header colors of the organization theme", () => {
        const themed = document.createElement("div");
        let themedHandle: IHostUiMountHandle | undefined;
        act(() => {
            themedHandle = hostUiModule.mount({
                container: themed,
                ctx: { ...ctx, theme: { header: { backgroundColor: "#123456" } } },
                resolvedApplications: [],
                pathname: "/",
                navigate: vi.fn(),
                replace: vi.fn(),
            });
        });

        const root = themed.firstElementChild as HTMLElement;
        expect(root.style.getPropertyValue("--gdc-host-ui-template-name-header-background")).toBe("#123456");
        act(() => themedHandle?.unmount());
    });
});

describe("hostUiModule metadata", () => {
    it("carries the build metadata that the host checks for a secured remote", () => {
        expect(hostUiModule.allowedOrganizations).toEqual([]);
        expect(hostUiModule.buildTimestamp).toBe(0);
    });
});

describe("getNavigationItems", () => {
    it("sorts by menu order and hides workspace apps outside a workspace", () => {
        const items = getNavigationItems(applications, { ...ctx, currentWorkspaceId: undefined }, "/");

        expect(items.map((item) => item.id)).toEqual(["organization-app"]);
    });

    it("marks the active application on an embedded route", () => {
        const items = getNavigationItems(applications, ctx, "/embedded/workspace/ws-1/workspace-app");

        expect(items.find((item) => item.isActive)?.id).toBe("workspace-app");
    });
});
