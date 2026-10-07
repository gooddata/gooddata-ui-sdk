// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { dummyBackendEmptyData } from "@gooddata/sdk-backend-base";
import { BackendProvider } from "@gooddata/sdk-ui";

import { OrganizationIdProvider } from "../OrganizationIdContext.js";
import { TelemetryProvider } from "../TelemetryContext.js";
import { type IGrantedWorkspace } from "../types.js";

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

function renderAddWorkspace(onSubmit: (workspaces: IGrantedWorkspace[]) => void) {
    const backend = dummyBackendEmptyData();
    const organization = backend.organization("org");
    const permissions = organization.permissions();
    const assignPermissions = vi.spyOn(permissions, "assignPermissions");
    vi.spyOn(organization, "permissions").mockReturnValue(permissions);
    vi.spyOn(backend, "organization").mockReturnValue(organization);
    const wrapper = ({ children }: PropsWithChildren) => (
        <BackendProvider backend={backend}>
            <OrganizationIdProvider organizationId="org">
                <TelemetryProvider trackEvent={vi.fn()}>{children}</TelemetryProvider>
            </OrganizationIdProvider>
        </BackendProvider>
    );
    const hook = renderHook(() => useAddWorkspace(["user"], "user", onSubmit, vi.fn(), WORKSPACE), {
        wrapper,
    });
    return { hook, assignPermissions };
}

describe("useAddWorkspace", () => {
    it("drops redundant permissions only when saving", async () => {
        const onSubmit = vi.fn();
        const { hook, assignPermissions } = renderAddWorkspace(onSubmit);

        act(() => {
            hook.result.current.onChange({
                ...WORKSPACE,
                permissions: ["VIEW", "CREATE_VISUALIZATION", "MANAGE_VISUALIZATIONS"],
            });
        });
        expect(hook.result.current.addedWorkspaces[0].permissions).toEqual([
            "VIEW",
            "CREATE_VISUALIZATION",
            "MANAGE_VISUALIZATIONS",
        ]);

        await act(async () => {
            hook.result.current.onAdd();
        });

        expect(assignPermissions).toHaveBeenCalledWith(
            expect.objectContaining({
                workspaces: [expect.objectContaining({ permissions: ["VIEW", "MANAGE_VISUALIZATIONS"] })],
            }),
        );
        expect(onSubmit).toHaveBeenCalledWith([
            expect.objectContaining({ permissions: ["VIEW", "MANAGE_VISUALIZATIONS"] }),
        ]);
    });
});
