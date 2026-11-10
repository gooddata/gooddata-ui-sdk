// (C) 2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type IHostUiModule, type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

import { registerAppLifecycleCallbacks } from "../loader/pluggableApplicationsLoader.js";

import { registerLocalHostUiModuleLoader } from "./localHostUiLoader.js";
import {
    rejectHostUiModuleOnContextChange,
    rejectHostUiModuleOnMountFailure,
    resolveHostUiModule,
} from "./resolveHostUiModule.js";

const { defaultModule, loadRemoteHostUiModuleMock, onLoadFailed, retireHostStylesheetScope } = vi.hoisted(
    () => ({
        defaultModule: { mount: () => ({ unmount: () => {}, getAppContainer: () => document.body }) },
        loadRemoteHostUiModuleMock: vi.fn(),
        onLoadFailed: vi.fn(),
        retireHostStylesheetScope: vi.fn(),
    }),
);

vi.mock("./DefaultHostUi.js", () => ({ defaultHostUiModule: defaultModule }));
vi.mock("../loader/remoteLoader.js", async (importOriginal) => ({
    ...(await importOriginal<typeof import("../loader/remoteLoader.js")>()),
    loadRemoteHostUiModule: loadRemoteHostUiModuleMock,
}));
vi.mock("../lib/stylesheetRegistry.js", () => ({
    reserveHostStylesheetScope: vi.fn(),
    retireHostStylesheetScope,
}));

function createModule(): IHostUiModule {
    return { mount: vi.fn() };
}

const REMOTE_URL = "https://example.com/remoteEntry.js";
const REMOTE_SCOPE = "remote_ui";
const SECURED_URL = "https://demo-dashboard-plugins.gooddata.com/prefix/remoteEntry.js";

function createCtx(withRemoteUiModule: boolean, url = REMOTE_URL): IPlatformContext {
    return {
        organization: { id: "org-1", title: "Org" },
        userSettings: {
            registeredPluggableApplications: withRemoteUiModule
                ? {
                      apiVersion: "1.0",
                      applications: [],
                      uiModule: {
                          url,
                          scope: REMOTE_SCOPE,
                          module: "./hostUiModule",
                          routeBase: "/",
                      },
                  }
                : undefined,
        },
    } as unknown as IPlatformContext;
}

beforeEach(() => {
    registerAppLifecycleCallbacks({ onLoadFailed });
});

afterEach(() => {
    registerAppLifecycleCallbacks({});
});

describe("resolveHostUiModule", () => {
    afterEach(() => {
        registerLocalHostUiModuleLoader(undefined);
        loadRemoteHostUiModuleMock.mockReset();
        onLoadFailed.mockReset();
        retireHostStylesheetScope.mockReset();
    });

    it("uses the default host UI when nothing is registered", async () => {
        expect((await resolveHostUiModule(createCtx(false))).hostUiModule).toBe(defaultModule);
    });

    it("uses the remote UI module from the registry", async () => {
        const remoteModule = createModule();
        loadRemoteHostUiModuleMock.mockResolvedValue(remoteModule);

        expect(await resolveHostUiModule(createCtx(true))).toEqual({
            hostUiModule: remoteModule,
            moduleId: REMOTE_SCOPE,
            remote: { url: REMOTE_URL, scope: REMOTE_SCOPE },
        });
    });

    it("uses the default host UI when asked to, without loading the others", async () => {
        registerLocalHostUiModuleLoader(() => Promise.resolve({ hostUiModule: createModule() }));

        expect((await resolveHostUiModule(createCtx(true), true)).hostUiModule).toBe(defaultModule);
        expect(loadRemoteHostUiModuleMock).not.toHaveBeenCalled();
    });

    it("accepts a secured remote UI module built for the organization", async () => {
        const remoteModule = {
            ...createModule(),
            allowedOrganizations: ["org-1"],
            buildTimestamp: Date.now(),
        };
        loadRemoteHostUiModuleMock.mockResolvedValue(remoteModule);

        expect((await resolveHostUiModule(createCtx(true, SECURED_URL))).hostUiModule).toBe(remoteModule);
    });

    it.each([
        ["another organization", { allowedOrganizations: ["org-2"], buildTimestamp: Date.now() }],
        ["an expired build", { allowedOrganizations: ["org-1"], buildTimestamp: 0 }],
        ["no security metadata", {}],
    ])("rejects a secured remote UI module with %s", async (_name, metadata) => {
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        loadRemoteHostUiModuleMock.mockResolvedValue({ ...createModule(), ...metadata });

        expect((await resolveHostUiModule(createCtx(true, SECURED_URL))).hostUiModule).toBe(defaultModule);
        expect(error).toHaveBeenCalled();
        expect(retireHostStylesheetScope).toHaveBeenCalledWith(SECURED_URL);
        expect(onLoadFailed).toHaveBeenCalledWith(REMOTE_SCOPE, expect.stringMatching(/^rejected: /), {
            kind: "host-ui",
            phase: "security",
        });
    });

    it("reports a remote UI module that fails to load", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        loadRemoteHostUiModuleMock.mockRejectedValue(new Error("network down"));

        expect((await resolveHostUiModule(createCtx(true))).hostUiModule).toBe(defaultModule);
        expect(onLoadFailed).toHaveBeenCalledWith(REMOTE_SCOPE, "load failed: network down", {
            kind: "host-ui",
            phase: "load",
        });
    });

    it("prefers a local UI module over the remote one", async () => {
        const localModule = createModule();
        registerLocalHostUiModuleLoader(() => Promise.resolve({ hostUiModule: localModule }));

        expect(await resolveHostUiModule(createCtx(true))).toEqual({
            hostUiModule: localModule,
            moduleId: "local-host-ui",
        });
        expect(loadRemoteHostUiModuleMock).not.toHaveBeenCalled();
    });

    it("accepts a local UI module exported as default", async () => {
        const localModule = createModule();
        registerLocalHostUiModuleLoader(() => Promise.resolve({ default: localModule }));

        expect((await resolveHostUiModule(createCtx(false))).hostUiModule).toBe(localModule);
    });

    it("falls back to the default host UI when the local module is not valid", async () => {
        const error = vi.spyOn(console, "error").mockImplementation(() => {});
        registerLocalHostUiModuleLoader(() => Promise.resolve({ default: {} }));

        expect((await resolveHostUiModule(createCtx(true))).hostUiModule).toBe(defaultModule);
        expect(error).toHaveBeenCalled();
        expect(loadRemoteHostUiModuleMock).not.toHaveBeenCalled();
        expect(onLoadFailed).toHaveBeenCalledWith("local-host-ui", expect.stringMatching(/^load failed: /), {
            kind: "host-ui",
            phase: "load",
        });
    });
});

describe("rejectHostUiModuleOnContextChange", () => {
    afterEach(() => {
        onLoadFailed.mockReset();
        retireHostStylesheetScope.mockReset();
    });

    const securedModule = {
        hostUiModule: { mount: vi.fn(), allowedOrganizations: ["org-1"], buildTimestamp: Date.now() },
        remote: { url: SECURED_URL, scope: REMOTE_SCOPE },
    };

    it("keeps a module that the new context still allows", () => {
        expect(rejectHostUiModuleOnContextChange(securedModule, createCtx(false), "unmounted")).toBe(false);
        expect(onLoadFailed).not.toHaveBeenCalled();
        expect(retireHostStylesheetScope).not.toHaveBeenCalled();
    });

    it("rejects and reports a module that the new organization does not allow", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const otherOrganization = { ...createCtx(false), organization: { id: "org-2", title: "Other" } };

        expect(rejectHostUiModuleOnContextChange(securedModule, otherOrganization, "rejected")).toBe(true);
        expect(retireHostStylesheetScope).toHaveBeenCalledWith(SECURED_URL);
        expect(onLoadFailed).toHaveBeenCalledWith(REMOTE_SCOPE, expect.stringMatching(/^rejected: /), {
            kind: "host-ui",
            phase: "security",
        });
    });
});

describe("rejectHostUiModuleOnMountFailure", () => {
    afterEach(() => {
        onLoadFailed.mockReset();
        retireHostStylesheetScope.mockReset();
    });

    it("reports a remote module whose mount threw and disables its stylesheets", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const remoteModule = {
            hostUiModule: createModule(),
            moduleId: REMOTE_SCOPE,
            remote: { url: REMOTE_URL, scope: REMOTE_SCOPE },
        };

        expect(rejectHostUiModuleOnMountFailure(remoteModule, new Error("broken"))).toBe(true);
        expect(retireHostStylesheetScope).toHaveBeenCalledWith(REMOTE_URL);
        expect(onLoadFailed).toHaveBeenCalledWith(REMOTE_SCOPE, "mount threw: broken", {
            kind: "host-ui",
            phase: "mount",
        });
    });

    it("leaves a failing default module to the caller", () => {
        expect(rejectHostUiModuleOnMountFailure({ hostUiModule: createModule() }, new Error("broken"))).toBe(
            false,
        );
        expect(onLoadFailed).not.toHaveBeenCalled();
    });
});
