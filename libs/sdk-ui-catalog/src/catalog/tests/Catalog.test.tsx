// (C) 2025 GoodData Corporation

import React from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";

import { testIds } from "../../automation/index.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { TestPermissionsProvider } from "../../permission/TestPermissionsProvider.js";
import { SearchProvider } from "../../search/index.js";
import { Catalog } from "../Catalog.js";

function wrapper({ children }: React.PropsWithChildren) {
    return (
        <TestIntlProvider>
            <TestPermissionsProvider>
                <SearchProvider>{children}</SearchProvider>
            </TestPermissionsProvider>
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

        expect(screen.getByTestId(testIds.catalog)).toBeVisible();
    });

    it("renders with header title", () => {
        render(<Catalog {...props} />, { wrapper });

        expect(screen.getByText("Analytics Catalog")).toBeVisible();
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
            <TestPermissionsProvider status="success" result={{ canCreateVisualization: false }}>
                <Catalog {...props} />
            </TestPermissionsProvider>,
            { wrapper },
        );

        expect(screen.getByText("Unauthorized")).toBeVisible();
    });
});
