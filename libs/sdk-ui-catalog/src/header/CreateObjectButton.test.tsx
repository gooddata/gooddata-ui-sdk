// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type Mock, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import {
    type IAnalyticalBackend,
    type IUserWorkspaceSettings,
    UnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import type { IWorkspacePermissions } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { CatalogFeedProvider } from "../catalogItem/CatalogFeedContext.js";
import { TestIntlProvider } from "../localization/TestIntlProvider.js";
import type { CatalogCreateObjectType } from "../objectType/types.js";
import { TestPermissionsProvider, defaultPermissionsResult } from "../permission/TestPermissionsProvider.js";

import { CreateObjectButton } from "./CreateObjectButton.js";

// The parameter tests below open the as-code create dialog, which `lazy()`-loads the editor body.
// Stubbed even though nothing here asserts on the editor: leaving the real CodeMirror body to
// resolve would cache it for the whole run, and the as-code tests that do drive the editor would
// then find the real one instead of their stub.
vi.mock("../asCode/AsCodeEditorBody.js", () => import("../asCode/asCodeEditorBody.test.utils.js"));

/**
 * `CatalogFeedProvider` runs the real feed hook on top of `dummyBackend`: mocking
 * `useCatalogItemFeed` module-wide is unreliable once the suite runs without isolation,
 * because the provider module keeps whatever binding the first test file that loaded it got.
 * Only the parameters service is swapped so parameter creation stays observable.
 */
function createBackend(createParameter: Mock = vi.fn().mockResolvedValue({})) {
    const backend = dummyBackend();

    return {
        ...backend,
        workspace: (id: string) => {
            const workspace = backend.workspace(id);

            return {
                ...workspace,
                // Keep the dummy service (the feed reads parameters through it) and only
                // override the one call the assertions care about.
                parameters: () => Object.assign(Object.create(workspace.parameters()), { createParameter }),
            };
        },
    } as unknown as IAnalyticalBackend;
}

function wrapper({
    children,
    createParameter,
    parameterEnabled,
    permissions = { canManageProject: true } as IWorkspacePermissions,
    settings,
}: PropsWithChildren<{
    createParameter?: Mock;
    parameterEnabled?: boolean;
    permissions?: IWorkspacePermissions;
    settings?: Partial<IUserWorkspaceSettings>;
}>) {
    const backend = createBackend(createParameter);

    return (
        <TestIntlProvider>
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace="test-workspace">
                    <TestPermissionsProvider
                        result={{
                            ...defaultPermissionsResult,
                            permissions,
                            settings: {
                                ...(parameterEnabled ? { enableParameters: true } : {}),
                                ...settings,
                            } as IUserWorkspaceSettings,
                        }}
                    >
                        <CatalogFeedProvider backend={backend} workspace="test-workspace">
                            <ToastsCenterContextProvider>{children}</ToastsCenterContextProvider>
                        </CatalogFeedProvider>
                    </TestPermissionsProvider>
                </WorkspaceProvider>
            </BackendProvider>
        </TestIntlProvider>
    );
}

const parameterWrapper = ({ children }: PropsWithChildren) => wrapper({ children, parameterEnabled: true });

describe("CreateObjectButton", () => {
    it("renders the Create button", () => {
        const onCreateObject = vi.fn();
        render(<CreateObjectButton onCreateObject={onCreateObject} />, { wrapper });

        expect(screen.getByText("Create")).toBeInTheDocument();
    });

    it("shows all base items in the dropdown", () => {
        const onCreateObject = vi.fn();
        render(<CreateObjectButton onCreateObject={onCreateObject} />, { wrapper });

        fireEvent.click(screen.getByText("Create"));

        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Visualization")).toBeInTheDocument();
        expect(screen.getByText("Metric")).toBeInTheDocument();
    });

    it("does not show the Parameter item when the parameter flag is off", () => {
        const onCreateObject = vi.fn();
        render(<CreateObjectButton onCreateObject={onCreateObject} />, { wrapper });

        fireEvent.click(screen.getByText("Create"));

        expect(screen.queryByText("Parameter")).not.toBeInTheDocument();
    });

    it("shows the Parameter item when the parameter flag is on", () => {
        const onCreateObject = vi.fn();
        render(<CreateObjectButton onCreateObject={onCreateObject} />, { wrapper: parameterWrapper });

        fireEvent.click(screen.getByText("Create"));

        expect(screen.getByText("Parameter")).toBeInTheDocument();
    });

    it.each<[string, CatalogCreateObjectType]>([
        ["Dashboard", "analyticalDashboard"],
        ["Visualization", "insight"],
        ["Metric", "measure"],
    ])("calls onCreateObject with '%s' type when clicking %s item", (label, expectedType) => {
        const onCreateObject = vi.fn();

        render(<CreateObjectButton onCreateObject={onCreateObject} />, { wrapper });

        fireEvent.click(screen.getByText("Create"));
        fireEvent.click(screen.getByText(label));

        expect(onCreateObject).toHaveBeenCalledWith(expectedType);
    });

    it("does not call onCreateObject when clicking Parameter item", () => {
        const onCreateObject = vi.fn();

        render(<CreateObjectButton onCreateObject={onCreateObject} />, { wrapper: parameterWrapper });

        fireEvent.click(screen.getByText("Create"));
        fireEvent.click(screen.getByText("Parameter"));

        expect(onCreateObject).not.toHaveBeenCalled();
    });

    it("creates a parameter via backend and shows success", async () => {
        const createParameter = vi.fn().mockResolvedValue({});

        render(<CreateObjectButton onCreateObject={vi.fn()} />, {
            wrapper: ({ children }) => wrapper({ children, createParameter, parameterEnabled: true }),
        });

        fireEvent.click(screen.getByText("Create"));
        fireEvent.click(screen.getByText("Parameter"));
        await screen.findByText("Create parameter");
        fireEvent.click((await screen.findAllByTestId("create"))[1]);

        await waitFor(() => {
            expect(createParameter).toHaveBeenCalledWith({
                type: "parameter",
                title: "My Parameter",
                description: "",
                definition: {
                    type: "NUMBER",
                    defaultValue: 0,
                },
            });
        });

        expect(screen.queryByText("Create parameter")).not.toBeInTheDocument();
        expect(await screen.findByRole("status")).toHaveTextContent(/Parameter created\./);
    });

    it("keeps dialog open and shows backend error when parameter creation fails", async () => {
        const createParameter = vi.fn().mockRejectedValue(
            new UnexpectedResponseError("Request failed with status code 409", 409, {
                detail: "Identifier already exists",
            }),
        );

        render(<CreateObjectButton onCreateObject={vi.fn()} />, {
            wrapper: ({ children }) => wrapper({ children, createParameter, parameterEnabled: true }),
        });

        fireEvent.click(screen.getByText("Create"));
        fireEvent.click(screen.getByText("Parameter"));
        await screen.findByText("Create parameter");
        fireEvent.click((await screen.findAllByTestId("create"))[1]);

        expect(await screen.findByText("Identifier already exists")).toBeInTheDocument();
        expect(screen.getByText("Create parameter")).toBeInTheDocument();
    });

    describe("create metric permission", () => {
        // The flag-and-permission rule is tested in sdk-model's canCreateMetric; these two cover
        // the wiring of both menu paths.
        const metricWrapper =
            (permissions: Partial<IWorkspacePermissions>, settings: Partial<IUserWorkspaceSettings>) =>
            ({ children }: PropsWithChildren) =>
                wrapper({ children, permissions: permissions as IWorkspacePermissions, settings });

        it("hides the Metric item when the user may not create metrics", () => {
            render(<CreateObjectButton onCreateObject={vi.fn()} />, {
                wrapper: metricWrapper(
                    { canCreateMetric: false, canManageProject: true },
                    { enableMetricPermissions: true },
                ),
            });

            fireEvent.click(screen.getByText("Create"));

            expect(screen.queryByText("Metric")).not.toBeInTheDocument();
        });

        it("hides the Metric redirect for a non-admin when the flag is off", () => {
            render(<CreateObjectButton onCreateObject={vi.fn()} />, {
                wrapper: metricWrapper({ canCreateMetric: true, canManageProject: false }, {}),
            });

            fireEvent.click(screen.getByText("Create"));

            expect(screen.queryByText("Metric")).not.toBeInTheDocument();
        });

        it("opens the as-code dialog for a non-admin who may create metrics", async () => {
            const onCreateObject = vi.fn();

            render(<CreateObjectButton onCreateObject={onCreateObject} />, {
                wrapper: metricWrapper(
                    { canCreateMetric: true, canManageProject: false },
                    { enableMetricPermissions: true, enableAnalyticalCatalogMetricEditor: true },
                ),
            });

            fireEvent.click(screen.getByText("Create"));
            fireEvent.click(screen.getByText("Metric"));

            expect(await screen.findByText("Create metric")).toBeInTheDocument();
            expect(onCreateObject).not.toHaveBeenCalled();
        });
    });
});
