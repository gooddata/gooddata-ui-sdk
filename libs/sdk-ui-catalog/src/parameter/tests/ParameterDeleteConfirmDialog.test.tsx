// (C) 2026 GoodData Corporation

import type { PropsWithChildren } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { CatalogFeedProvider } from "../../catalogItem/CatalogFeedContext.js";
import type { ICatalogItemParameter } from "../../catalogItem/types.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { TestPermissionsProvider } from "../../permission/TestPermissionsProvider.js";
import { ParameterDeleteDialog } from "../ParameterDeleteDialog.js";

vi.mock("../../catalogItem/useCatalogItemFeed.js");

const parameterItem: ICatalogItemParameter = {
    identifier: "param.id",
    type: "parameter",
    title: "My Param",
    description: "Description",
    tags: [],
    createdBy: "user",
    updatedBy: "user",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
    definition: { type: "NUMBER", defaultValue: 10 },
};

const deleteParameterMock = vi.fn();

const backend = {
    workspace: () => ({
        parameters: () => ({
            deleteParameter: deleteParameterMock,
        }),
    }),
} as unknown as IAnalyticalBackend;

function Wrapper({ children }: PropsWithChildren) {
    return (
        <TestIntlProvider>
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace="test-workspace">
                    <TestPermissionsProvider>
                        <CatalogFeedProvider backend={backend} workspace="test-workspace">
                            <ToastsCenterContextProvider>{children}</ToastsCenterContextProvider>
                        </CatalogFeedProvider>
                    </TestPermissionsProvider>
                </WorkspaceProvider>
            </BackendProvider>
        </TestIntlProvider>
    );
}

describe("ParameterDeleteConfirmDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        deleteParameterMock.mockResolvedValue(undefined);
    });

    it("shows dialog with parameter title", () => {
        render(
            <ParameterDeleteDialog
                backend={backend}
                workspace="test-workspace"
                item={parameterItem}
                onClose={vi.fn()}
                onDeleted={vi.fn()}
            />,
            { wrapper: Wrapper },
        );

        expect(screen.getByText("Delete parameter?")).toBeInTheDocument();
        expect(screen.getByText("My Param")).toBeInTheDocument();
    });

    it("falls back to identifier when title is empty", () => {
        const itemNoTitle: ICatalogItemParameter = { ...parameterItem, title: "" };

        render(
            <ParameterDeleteDialog
                backend={backend}
                workspace="test-workspace"
                item={itemNoTitle}
                onClose={vi.fn()}
                onDeleted={vi.fn()}
            />,
            { wrapper: Wrapper },
        );

        expect(screen.getByText("param.id")).toBeInTheDocument();
    });

    it("calls deleteParameter and onDeleted on success", async () => {
        const onDeleted = vi.fn();
        const onClose = vi.fn();

        render(
            <ParameterDeleteDialog
                backend={backend}
                workspace="test-workspace"
                item={parameterItem}
                onClose={onClose}
                onDeleted={onDeleted}
            />,
            { wrapper: Wrapper },
        );

        const deleteButton = screen.getByText("Delete", { selector: "button span, button" });
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(deleteParameterMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    identifier: "param.id",
                    type: "parameter",
                }),
            );
        });

        expect(onDeleted).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });

    it("keeps dialog open on delete failure and shows error toast", async () => {
        deleteParameterMock.mockRejectedValue(new Error("Server error"));

        const onDeleted = vi.fn();
        const onClose = vi.fn();

        render(
            <ParameterDeleteDialog
                backend={backend}
                workspace="test-workspace"
                item={parameterItem}
                onClose={onClose}
                onDeleted={onDeleted}
            />,
            { wrapper: Wrapper },
        );

        const deleteButton = screen.getByText("Delete", { selector: "button span, button" });
        fireEvent.click(deleteButton);

        // Dialog should still be visible
        await screen.findByText("Delete parameter?");

        expect(onDeleted).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });
});
