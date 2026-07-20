// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type Mock, describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend, UnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { AsCodeMutationProvider } from "../../asCode/AsCodeMutationContext.js";
import { asCodeDescriptors } from "../../asCodeRegistry.js";
import { CatalogFeedProvider } from "../../catalogItem/CatalogFeedContext.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import type { CatalogCreateObjectType } from "../../objectType/types.js";
import { TestPermissionsProvider } from "../../permission/TestPermissionsProvider.js";
import { CreateObjectButton } from "../CreateObjectButton.js";

vi.mock("../../catalogItem/useCatalogItemFeed.js");

function createBackend(createParameter: Mock = vi.fn().mockResolvedValue({})) {
    return {
        workspace: () => ({
            parameters: () => ({
                createParameter,
            }),
        }),
    } as unknown as IAnalyticalBackend;
}

function wrapper({ children, createParameter }: PropsWithChildren<{ createParameter?: Mock }>) {
    const backend = createBackend(createParameter);

    return (
        <TestIntlProvider>
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace="test-workspace">
                    <CatalogFeedProvider backend={backend} workspace="test-workspace">
                        <TestPermissionsProvider>
                            <AsCodeMutationProvider descriptors={asCodeDescriptors}>
                                <ToastsCenterContextProvider>{children}</ToastsCenterContextProvider>
                            </AsCodeMutationProvider>
                        </TestPermissionsProvider>
                    </CatalogFeedProvider>
                </WorkspaceProvider>
            </BackendProvider>
        </TestIntlProvider>
    );
}

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

    it("does not show Parameter item when showParameter is off", () => {
        const onCreateObject = vi.fn();
        render(<CreateObjectButton onCreateObject={onCreateObject} />, { wrapper });

        fireEvent.click(screen.getByText("Create"));

        expect(screen.queryByText("Parameter")).not.toBeInTheDocument();
    });

    it("shows Parameter item when showParameter is on", () => {
        const onCreateObject = vi.fn();
        render(<CreateObjectButton onCreateObject={onCreateObject} showParameter />, { wrapper });

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

        render(<CreateObjectButton onCreateObject={onCreateObject} showParameter />, { wrapper });

        fireEvent.click(screen.getByText("Create"));
        fireEvent.click(screen.getByText("Parameter"));

        expect(onCreateObject).not.toHaveBeenCalled();
    });

    it("creates a parameter via backend and shows success", async () => {
        const createParameter = vi.fn().mockResolvedValue({});

        render(<CreateObjectButton onCreateObject={vi.fn()} showParameter />, {
            wrapper: ({ children }) => wrapper({ children, createParameter }),
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

        render(<CreateObjectButton onCreateObject={vi.fn()} showParameter />, {
            wrapper: ({ children }) => wrapper({ children, createParameter }),
        });

        fireEvent.click(screen.getByText("Create"));
        fireEvent.click(screen.getByText("Parameter"));
        await screen.findByText("Create parameter");
        fireEvent.click((await screen.findAllByTestId("create"))[1]);

        expect(await screen.findByText("Identifier already exists")).toBeInTheDocument();
        expect(screen.getByText("Create parameter")).toBeInTheDocument();
    });
});
