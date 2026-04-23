// (C) 2026 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import type { ICatalogItemParameter } from "../../catalogItem/types.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { ParameterDeleteDialog } from "../ParameterDeleteDialog.js";
import { ParameterMutationProvider } from "../ParameterMutationContext.js";
import type { IParameterMutationPort } from "../parameterMutationPort.js";
import { createTestParameterMutationPort } from "./parameterMutationPort.test.utils.js";

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

function createWrapper(port: IParameterMutationPort) {
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <TestIntlProvider>
                <ToastsCenterContextProvider>
                    <ParameterMutationProvider port={port}>{children}</ParameterMutationProvider>
                </ToastsCenterContextProvider>
            </TestIntlProvider>
        );
    }
    return Wrapper;
}

describe("ParameterDeleteConfirmDialog", () => {
    let port: IParameterMutationPort;

    beforeEach(() => {
        port = createTestParameterMutationPort();
    });

    it("shows dialog with parameter title", () => {
        render(<ParameterDeleteDialog item={parameterItem} onClose={vi.fn()} onDeleted={vi.fn()} />, {
            wrapper: createWrapper(port),
        });

        expect(screen.getByText("Delete parameter?")).toBeInTheDocument();
        expect(screen.getByText("My Param")).toBeInTheDocument();
    });

    it("falls back to identifier when title is empty", () => {
        const itemNoTitle: ICatalogItemParameter = { ...parameterItem, title: "" };

        render(<ParameterDeleteDialog item={itemNoTitle} onClose={vi.fn()} onDeleted={vi.fn()} />, {
            wrapper: createWrapper(port),
        });

        expect(screen.getByText("param.id")).toBeInTheDocument();
    });

    it("calls port.delete and onDeleted on success", async () => {
        const onDeleted = vi.fn();
        const onClose = vi.fn();

        render(<ParameterDeleteDialog item={parameterItem} onClose={onClose} onDeleted={onDeleted} />, {
            wrapper: createWrapper(port),
        });

        const deleteButton = screen.getByText("Delete", { selector: "button span, button" });
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(port.delete).toHaveBeenCalledWith(
                expect.objectContaining({
                    identifier: "param.id",
                    type: "parameter",
                }),
            );
        });

        expect(onDeleted).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });

    it("keeps dialog open on delete failure", async () => {
        port = createTestParameterMutationPort({
            delete: vi.fn().mockRejectedValue(new Error("Server error")),
        });

        const onDeleted = vi.fn();
        const onClose = vi.fn();

        render(<ParameterDeleteDialog item={parameterItem} onClose={onClose} onDeleted={onDeleted} />, {
            wrapper: createWrapper(port),
        });

        const deleteButton = screen.getByText("Delete", { selector: "button span, button" });
        fireEvent.click(deleteButton);

        // Dialog should still be visible
        await screen.findByText("Delete parameter?");

        expect(onDeleted).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });
});
