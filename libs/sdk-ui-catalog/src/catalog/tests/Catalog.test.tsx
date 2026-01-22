// (C) 2025-2026 GoodData Corporation

import type { PropsWithChildren } from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import type { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import type { IWorkspacePermissions } from "@gooddata/sdk-model";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { catalog } from "../../automation/testIds.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { TestPermissionsProvider } from "../../permission/TestPermissionsProvider.js";
import type { PermissionsState } from "../../permission/types.js";
import { Catalog } from "../Catalog.js";

function wrapper({
    children,
    permissions,
}: PropsWithChildren<{ permissions?: Partial<PermissionsState["result"]> }>) {
    return (
        <TestIntlProvider>
            <ToastsCenterContextProvider>
                <TestPermissionsProvider result={permissions}>{children}</TestPermissionsProvider>
            </ToastsCenterContextProvider>
        </TestIntlProvider>
    );
}

const props = {
    backend: dummyBackend(),
    workspace: "test-workspace",
};

describe("Catalog", () => {
    it("renders with proper data-testid", () => {
        render(<Catalog {...props} />, { wrapper });

        expect(screen.getByTestId(catalog)).toBeVisible();
    });

    it("renders with header title", () => {
        render(<Catalog {...props} />, { wrapper });

        expect(screen.getByText("Analytics catalog")).toBeVisible();
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

    it("does not render quality scorecard without AI Assistant permission", () => {
        render(
            <TestPermissionsProvider
                status="success"
                result={{
                    settings: {
                        enableGenAICatalogQualityChecker: true,
                    } as IUserWorkspaceSettings,
                    permissions: {
                        canCreateVisualization: true,
                        canUseAiAssistant: false,
                    } as IWorkspacePermissions,
                }}
            >
                <Catalog {...props} />
            </TestPermissionsProvider>,
            { wrapper },
        );

        expect(screen.queryByText("Semantic quality")).not.toBeInTheDocument();
    });

    it("renders quality scorecard when feature flag enabled and AI Assistant permission granted", () => {
        render(
            <TestPermissionsProvider
                status="success"
                result={{
                    settings: {
                        enableGenAICatalogQualityChecker: true,
                    } as IUserWorkspaceSettings,
                    permissions: {
                        canCreateVisualization: true,
                        canUseAiAssistant: true,
                    } as IWorkspacePermissions,
                }}
            >
                <Catalog {...props} />
            </TestPermissionsProvider>,
            { wrapper },
        );

        expect(screen.getByText("Semantic quality")).toBeVisible();
    });
});
