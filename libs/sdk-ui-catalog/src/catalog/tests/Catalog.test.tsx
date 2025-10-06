// (C) 2025 GoodData Corporation

import type { PropsWithChildren } from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import type { IWorkspacePermissions } from "@gooddata/sdk-model";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { testIds } from "../../automation/index.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import {
    TestPermissionsProvider,
    defaultPermissionsResult,
} from "../../permission/TestPermissionsProvider.js";
import { PermissionsState } from "../../permission/types.js";
import { SearchProvider } from "../../search/index.js";
import { Catalog } from "../Catalog.js";

function wrapper({
    children,
    permissions,
}: PropsWithChildren<{ permissions?: Partial<PermissionsState["result"]> }>) {
    return (
        <TestIntlProvider>
            <ToastsCenterContextProvider>
                <TestPermissionsProvider result={permissions}>
                    <SearchProvider>{children}</SearchProvider>
                </TestPermissionsProvider>
            </ToastsCenterContextProvider>
        </TestIntlProvider>
    );
}

const mockMemoryService = {
    list: vi.fn().mockResolvedValue([]),
    create: vi
        .fn()
        .mockResolvedValue({ id: "test-id", instruction: "test", type: "INSTRUCTION", keywords: [] }),
    update: vi
        .fn()
        .mockResolvedValue({ id: "test-id", instruction: "test", type: "INSTRUCTION", keywords: [] }),
    remove: vi.fn().mockResolvedValue(undefined),
};

const createMockedBackend = () => {
    const backend = dummyBackend();
    // Mock the genAI functionality
    vi.spyOn(backend, "workspace").mockReturnValue({
        ...backend.workspace("test-workspace"),
        genAI: () => ({
            getMemory: () => mockMemoryService,
            getAnalyticsCatalog: () => ({
                getTags: vi.fn().mockResolvedValue({ tags: [] }),
            }),
        }),
    } as unknown as ReturnType<typeof backend.workspace>);
    return backend;
};

const props = {
    backend: createMockedBackend(),
    workspace: "test-workspace",
};

describe("Catalog", () => {
    it("renders with proper data-testid", () => {
        const testProps = { ...props, backend: createMockedBackend() };
        render(<Catalog {...testProps} />, { wrapper });

        expect(screen.getByTestId(testIds.catalog)).toBeVisible();
    });

    it("renders with header title", () => {
        const testProps = { ...props, backend: createMockedBackend() };
        render(<Catalog {...testProps} />, { wrapper });

        expect(screen.getByText("Analytics catalog")).toBeVisible();
    });

    it("do not shows tabs when enableGenAIMemory is false", async () => {
        const testProps = { ...props, backend: createMockedBackend() };
        render(<Catalog {...testProps} />, { wrapper });

        expect(screen.queryByText("Catalog")).not.toBeInTheDocument();
        expect(screen.queryByText("Memory")).not.toBeInTheDocument();
    });

    it("shows tabs and can switch to memory tab when enableGenAIMemory is true", async () => {
        const testProps = { ...props, backend: createMockedBackend() };
        render(<Catalog {...testProps} />, {
            wrapper: ({ children }) =>
                wrapper({
                    children,
                    permissions: {
                        ...defaultPermissionsResult,
                        settings: { enableGenAIMemory: true } as IUserWorkspaceSettings,
                    },
                }),
        });

        expect(screen.getByText("Catalog")).toBeVisible();
        expect(screen.getByText("Memory")).toBeVisible();

        // Click memory tab
        screen.getByText("Memory").click();
        // Memory toolbar should show
        await waitFor(() => {
            expect(screen.getByText("Refresh")).toBeVisible();
        });
    });

    it("renders with loading mask when permissions are not loaded", () => {
        render(
            <TestPermissionsProvider status="pending">
                <Catalog {...props} />
            </TestPermissionsProvider>,
            { wrapper },
        );

        expect(screen.getByLabelText("loading")).toBeVisible();
    });

    it("renders with error when permissions are not loaded", () => {
        render(
            <TestPermissionsProvider status="error">
                <Catalog {...props} />
            </TestPermissionsProvider>,
            { wrapper },
        );

        expect(screen.getByText("Unknown error")).toBeVisible();
    });

    it("render with error when unauthorized", () => {
        render(
            <TestPermissionsProvider
                status="success"
                result={{ permissions: { canCreateVisualization: false } as IWorkspacePermissions }}
            >
                <Catalog {...props} />
            </TestPermissionsProvider>,
            { wrapper },
        );

        expect(screen.getByText("Unauthorized")).toBeVisible();
    });
});
