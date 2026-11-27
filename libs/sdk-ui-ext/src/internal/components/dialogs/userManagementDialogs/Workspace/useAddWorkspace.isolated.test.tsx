// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { dummyBackendEmptyData } from "@gooddata/sdk-backend-base";
import { BackendProvider } from "@gooddata/sdk-ui";

import { OrganizationIdProvider } from "../OrganizationIdContext.js";
import { TelemetryProvider } from "../TelemetryContext.js";
import { type IGrantedWorkspace, type WorkspacePermissions } from "../types.js";

import { useAddWorkspace } from "./useAddWorkspace.js";

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    useToastMessage: () => ({ addSuccess: vi.fn(), addError: vi.fn() }),
}));

const WORKSPACE: IGrantedWorkspace = {
    id: "ws",
    title: "Workspace",
    permissions: ["VIEW"],
    isHierarchical: false,
};

function renderAddWorkspace(
    onSubmit: (workspaces: IGrantedWorkspace[]) => void,
    {
        areVisualizationPermissionsEnabled = false,
        grantManageVisualizationsWithAnalyze = false,
        isSettingsLoadFailing = false,
    } = {},
) {
    const backend = dummyBackendEmptyData();
    const organization = backend.organization("org");
    const permissions = organization.permissions();
    const assignPermissions = vi.spyOn(permissions, "assignPermissions");
    vi.spyOn(organization, "permissions").mockReturnValue(permissions);
    vi.spyOn(backend, "organization").mockReturnValue(organization);
    const workspace = backend.workspace("ws");
    const settings = workspace.settings();
    const getSettings = vi.spyOn(settings, "getSettings");
    if (isSettingsLoadFailing) {
        getSettings.mockRejectedValue(new Error("settings"));
    } else {
        getSettings.mockResolvedValue({ workspace: "ws", grantManageVisualizationsWithAnalyze });
    }
    vi.spyOn(workspace, "settings").mockReturnValue(settings);
    const workspaceOf = vi.spyOn(backend, "workspace").mockReturnValue(workspace);
    const wrapper = ({ children }: PropsWithChildren) => (
        <BackendProvider backend={backend}>
            <OrganizationIdProvider organizationId="org">
                <TelemetryProvider trackEvent={vi.fn()}>{children}</TelemetryProvider>
            </OrganizationIdProvider>
        </BackendProvider>
    );
    const hook = renderHook(
        () =>
            useAddWorkspace(
                ["user"],
                "user",
                onSubmit,
                vi.fn(),
                WORKSPACE,
                areVisualizationPermissionsEnabled,
            ),
        { wrapper },
    );
    return { hook, assignPermissions, getSettings, workspaceOf };
}

describe("useAddWorkspace", () => {
    it("drops redundant permissions only when saving", async () => {
        const onSubmit = vi.fn();
        const { hook, assignPermissions } = renderAddWorkspace(onSubmit);

        act(() => {
            hook.result.current.onChange({
                ...WORKSPACE,
                permissions: ["VIEW", "EXPORT", "EXPORT_PDF", "EXPORT_TABULAR"],
            });
        });
        expect(hook.result.current.addedWorkspaces[0].permissions).toEqual([
            "VIEW",
            "EXPORT",
            "EXPORT_PDF",
            "EXPORT_TABULAR",
        ]);

        await act(async () => {
            hook.result.current.onAdd();
        });

        expect(assignPermissions).toHaveBeenCalledWith(
            expect.objectContaining({
                workspaces: [expect.objectContaining({ permissions: ["VIEW", "EXPORT"] })],
            }),
        );
        expect(onSubmit).toHaveBeenCalledWith([expect.objectContaining({ permissions: ["VIEW", "EXPORT"] })]);
    });

    it("saves Visualizations chosen next to Manage all visualizations", async () => {
        const { hook, assignPermissions } = renderAddWorkspace(vi.fn());
        const permissions: WorkspacePermissions = ["VIEW", "CREATE_VISUALIZATION", "MANAGE_VISUALIZATIONS"];

        act(() => {
            hook.result.current.onChange({ ...WORKSPACE, permissions });
        });
        await act(async () => {
            hook.result.current.onAdd();
        });

        expect(assignPermissions).toHaveBeenCalledWith(
            expect.objectContaining({ workspaces: [expect.objectContaining({ permissions })] }),
        );
    });

    it("leaves Manage all visualizations out of an Analyze save where the workspace grants it with Analyze", async () => {
        const onSubmit = vi.fn();
        const { hook, assignPermissions, workspaceOf } = renderAddWorkspace(onSubmit, {
            areVisualizationPermissionsEnabled: true,
            grantManageVisualizationsWithAnalyze: true,
        });
        await waitFor(() => expect(hook.result.current.analyzeIncludesManageVisualizations).toBe(true));
        expect(workspaceOf).toHaveBeenCalledWith("ws");

        act(() => {
            hook.result.current.onChange({ ...WORKSPACE, permissions: ["ANALYZE", "MANAGE_VISUALIZATIONS"] });
        });
        await act(async () => {
            hook.result.current.onAdd();
        });

        expect(assignPermissions).toHaveBeenCalledWith(
            expect.objectContaining({
                workspaces: [expect.objectContaining({ permissions: ["ANALYZE"] })],
            }),
        );
        expect(onSubmit).toHaveBeenCalledWith([expect.objectContaining({ permissions: ["ANALYZE"] })]);
    });

    it("keeps Manage all visualizations a choice under Analyze when the settings fail to load", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        const { hook, getSettings } = renderAddWorkspace(vi.fn(), {
            areVisualizationPermissionsEnabled: true,
            isSettingsLoadFailing: true,
        });

        await waitFor(() =>
            expect(consoleError).toHaveBeenCalledWith(
                "Loading of workspace settings failed",
                expect.any(Error),
            ),
        );
        expect(getSettings).toHaveBeenCalled();
        expect(hook.result.current.analyzeIncludesManageVisualizations).toBe(false);
        consoleError.mockRestore();
    });

    it("does not read workspace settings while visualization permissions are off", () => {
        const { hook, getSettings } = renderAddWorkspace(vi.fn(), {
            grantManageVisualizationsWithAnalyze: true,
        });

        expect(getSettings).not.toHaveBeenCalled();
        expect(hook.result.current.analyzeIncludesManageVisualizations).toBe(false);
    });
});
