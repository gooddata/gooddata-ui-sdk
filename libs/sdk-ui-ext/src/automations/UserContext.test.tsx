// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend, type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { type AutomationsScope } from "./types.js";
import { UserProvider, useUser } from "./UserContext.js";

vi.mock("./useAutomationService.js", () => ({
    useAutomationService: () => ({
        promiseGetCurrentUser: () => Promise.resolve({ login: "user" }),
        promiseCanManageWorkspace: () => Promise.resolve(undefined),
    }),
}));

type GetSettings = () => Promise<Partial<IUserWorkspaceSettings>>;

const backendWithSettings = (getSettingsForCurrentUser: GetSettings) =>
    ({
        workspace: () => ({ settings: () => ({ getSettingsForCurrentUser }) }),
    }) as unknown as IAnalyticalBackend;

const renderUser = (scope: AutomationsScope, getSettings: GetSettings, workspace?: string) =>
    renderHook(
        () => {
            const { areSettingsLoaded, isPartialRenderingEnabled } = useUser();
            return { areSettingsLoaded, isPartialRenderingEnabled };
        },
        {
            wrapper: ({ children }: { children?: ReactNode }) => {
                const provider = <UserProvider scope={scope}>{children}</UserProvider>;
                return (
                    <BackendProvider backend={backendWithSettings(getSettings)}>
                        {workspace ? (
                            <WorkspaceProvider workspace={workspace}>{provider}</WorkspaceProvider>
                        ) : (
                            provider
                        )}
                    </BackendProvider>
                );
            },
        },
    );

describe("UserProvider settings", () => {
    it("reports the settings as loaded once they load, then follows the flag", async () => {
        const { result } = renderUser(
            "workspace",
            () => Promise.resolve({ enableDashboardPartialRendering: true }),
            "workspace",
        );

        expect(result.current).toEqual({ areSettingsLoaded: false, isPartialRenderingEnabled: false });
        await waitFor(() =>
            expect(result.current).toEqual({ areSettingsLoaded: true, isPartialRenderingEnabled: true }),
        );
    });

    it("keeps partial rendering off when the flag is off", async () => {
        const { result } = renderUser(
            "workspace",
            () => Promise.resolve({ enableDashboardPartialRendering: false }),
            "workspace",
        );

        await waitFor(() =>
            expect(result.current).toEqual({ areSettingsLoaded: true, isPartialRenderingEnabled: false }),
        );
    });

    it("counts failed settings as loaded, with partial rendering off", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const { result } = renderUser("workspace", () => Promise.reject(new Error("failed")), "workspace");

        await waitFor(() =>
            expect(result.current).toEqual({ areSettingsLoaded: true, isPartialRenderingEnabled: false }),
        );
    });

    it("keeps partial rendering off for the organization list", async () => {
        const { result } = renderUser(
            "organization",
            () => Promise.resolve({ enableDashboardPartialRendering: true }),
            "workspace",
        );

        await waitFor(() => expect(result.current.areSettingsLoaded).toBe(true));
        expect(result.current.isPartialRenderingEnabled).toBe(false);
    });

    it("does not wait for settings without a workspace", () => {
        const getSettings = vi.fn<GetSettings>();
        const { result } = renderUser("organization", getSettings);

        expect(result.current).toEqual({ areSettingsLoaded: true, isPartialRenderingEnabled: false });
        expect(getSettings).not.toHaveBeenCalled();
    });
});
