// (C) 2026 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

import { UnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import { WorkspaceProvider } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import type { ICatalogItemDashboard, ICatalogItemParameter } from "../../catalogItem/types.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { ParameterMutationProvider } from "../../parameter/ParameterMutationContext.js";
import type { IParameterMutationPort } from "../../parameter/parameterMutationPort.js";
import { createTestParameterMutationPort } from "../../parameter/tests/parameterMutationPort.test.utils.js";
import { TestPermissionsProvider } from "../../permission/TestPermissionsProvider.js";
import { CatalogDetailActions } from "../CatalogDetailActions.js";

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => {
    const original = await importOriginal<Record<string, unknown>>();
    return {
        ...original,
        SyntaxHighlightingInput: ({
            value,
            onChange,
            disabled,
        }: {
            value: string;
            onChange: (value: string) => void;
            disabled?: boolean;
        }) => (
            <textarea
                data-testid="yaml-editor"
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
            />
        ),
    };
});

const dashboardItem: ICatalogItemDashboard = {
    identifier: "dash.id",
    type: "analyticalDashboard",
    title: "My Dashboard",
    description: "",
    tags: [],
    createdBy: "user",
    updatedBy: "user",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
};

const parameterItem: ICatalogItemParameter = {
    identifier: "param.id",
    type: "parameter",
    title: "My Param",
    description: "",
    tags: [],
    createdBy: "user",
    updatedBy: "user",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
    definition: { type: "NUMBER", defaultValue: 0 },
};

function createWrapper(port: IParameterMutationPort = createTestParameterMutationPort()) {
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <TestIntlProvider>
                <WorkspaceProvider workspace="test-workspace">
                    <ToastsCenterContextProvider>
                        <TestPermissionsProvider>
                            <ParameterMutationProvider port={port}>{children}</ParameterMutationProvider>
                        </TestPermissionsProvider>
                    </ToastsCenterContextProvider>
                </WorkspaceProvider>
            </TestIntlProvider>
        );
    }
    return Wrapper;
}

describe("CatalogDetailActions", () => {
    describe("parameter edit flow", () => {
        it("opens the edit dialog on Edit click, calls port.update on save, and fires onCatalogItemUpdate", async () => {
            const updated: ICatalogItemParameter = {
                ...parameterItem,
                title: "Renamed Param",
            };
            const port = createTestParameterMutationPort({
                update: vi.fn().mockResolvedValue(updated),
            });
            const onCatalogItemUpdate = vi.fn();

            render(
                <CatalogDetailActions
                    item={parameterItem}
                    canEdit
                    onOpen={vi.fn()}
                    onCatalogItemCreate={vi.fn()}
                    onCatalogItemUpdate={onCatalogItemUpdate}
                    onCatalogItemDelete={vi.fn()}
                />,
                { wrapper: createWrapper(port) },
            );

            fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));

            const editor = await screen.findByTestId("yaml-editor");
            fireEvent.change(editor, {
                target: {
                    value: `id: param.id
title: Renamed Param
description: ""
tags: []
definition:
  type: NUMBER
  defaultValue: 10`,
                },
            });
            fireEvent.click(screen.getByText("Save", { selector: "button span, button" }));

            await waitFor(() => {
                expect(port.update).toHaveBeenCalledWith(
                    expect.objectContaining({
                        identifier: "param.id",
                        title: "Renamed Param",
                    }),
                );
            });
            await waitFor(() => {
                expect(onCatalogItemUpdate).toHaveBeenCalledWith(updated);
            });
        });
    });

    describe("parameter delete flow", () => {
        it("opens delete confirmation; confirming calls port.delete and fires onCatalogItemDelete with the item ref", async () => {
            const port = createTestParameterMutationPort({
                delete: vi.fn().mockResolvedValue(undefined),
            });
            const onCatalogItemDelete = vi.fn();

            render(
                <CatalogDetailActions
                    item={parameterItem}
                    canEdit
                    onOpen={vi.fn()}
                    onCatalogItemCreate={vi.fn()}
                    onCatalogItemUpdate={vi.fn()}
                    onCatalogItemDelete={onCatalogItemDelete}
                />,
                { wrapper: createWrapper(port) },
            );

            fireEvent.click(screen.getByRole("button", { name: /actions for/i }));
            fireEvent.click(screen.getByText("Delete"));

            const confirmButton = await screen.findByText("Delete", {
                selector: "button span, button",
            });
            fireEvent.click(confirmButton);

            await waitFor(() => {
                expect(port.delete).toHaveBeenCalledWith(
                    expect.objectContaining({
                        identifier: "param.id",
                        type: "parameter",
                    }),
                );
            });
            await waitFor(() => {
                expect(onCatalogItemDelete).toHaveBeenCalledWith(
                    expect.objectContaining({
                        identifier: "param.id",
                        type: "parameter",
                    }),
                );
            });
        });
    });

    describe("parameter duplicate flow", () => {
        it("opens a create dialog seeded from the source item; Create triggers port.create and fires onCatalogItemCreate", async () => {
            const created: ICatalogItemParameter = {
                ...parameterItem,
                identifier: "my_param__2_",
                title: "My Param (2)",
            };
            const port = createTestParameterMutationPort({
                create: vi.fn().mockResolvedValue(created),
            });
            const onCatalogItemCreate = vi.fn();

            render(
                <CatalogDetailActions
                    item={parameterItem}
                    canEdit
                    onOpen={vi.fn()}
                    onCatalogItemCreate={onCatalogItemCreate}
                    onCatalogItemUpdate={vi.fn()}
                    onCatalogItemDelete={vi.fn()}
                />,
                { wrapper: createWrapper(port) },
            );

            fireEvent.click(screen.getByRole("button", { name: /actions for/i }));
            fireEvent.click(screen.getByText("Save as new"));

            const editor = (await screen.findByTestId("yaml-editor")) as HTMLTextAreaElement;
            expect(editor.value).toContain("title: My Param (2)");
            expect(editor.value).toContain("id: my_param__2_");

            fireEvent.click(screen.getByText("Create", { selector: "button span, button" }));

            await waitFor(() => {
                expect(port.create).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: "my_param__2_",
                        title: "My Param (2)",
                    }),
                );
            });
            await waitFor(() => {
                expect(onCatalogItemCreate).toHaveBeenCalledWith(created);
            });
        });
    });

    describe("parameter duplicate collision handling", () => {
        it("retries create without id when the auto-generated copy id collides", async () => {
            const created: ICatalogItemParameter = {
                ...parameterItem,
                identifier: "my_param__2_",
                title: "My Param (2)",
            };
            const createMock = vi
                .fn()
                .mockRejectedValueOnce(new UnexpectedResponseError("Duplicate id", 409, {}))
                .mockResolvedValueOnce(created);
            const port = createTestParameterMutationPort({ create: createMock });

            render(
                <CatalogDetailActions
                    item={parameterItem}
                    canEdit
                    onOpen={vi.fn()}
                    onCatalogItemCreate={vi.fn()}
                    onCatalogItemUpdate={vi.fn()}
                    onCatalogItemDelete={vi.fn()}
                />,
                { wrapper: createWrapper(port) },
            );

            fireEvent.click(screen.getByRole("button", { name: /actions for/i }));
            fireEvent.click(screen.getByText("Save as new"));

            await screen.findByTestId("yaml-editor");
            fireEvent.click(screen.getByText("Create", { selector: "button span, button" }));

            await waitFor(() => {
                expect(createMock).toHaveBeenCalledTimes(2);
            });
            expect(createMock).toHaveBeenNthCalledWith(1, expect.objectContaining({ id: "my_param__2_" }));
            const secondCallArg = createMock.mock.calls[1][0] as { id?: unknown };
            expect(secondCallArg.id).toBeUndefined();
        });

        it("does not retry when a user-edited id collides", async () => {
            const createMock = vi
                .fn()
                .mockRejectedValue(new UnexpectedResponseError("Duplicate id", 409, {}));
            const port = createTestParameterMutationPort({ create: createMock });

            render(
                <CatalogDetailActions
                    item={parameterItem}
                    canEdit
                    onOpen={vi.fn()}
                    onCatalogItemCreate={vi.fn()}
                    onCatalogItemUpdate={vi.fn()}
                    onCatalogItemDelete={vi.fn()}
                />,
                { wrapper: createWrapper(port) },
            );

            fireEvent.click(screen.getByRole("button", { name: /actions for/i }));
            fireEvent.click(screen.getByText("Save as new"));

            const editor = (await screen.findByTestId("yaml-editor")) as HTMLTextAreaElement;
            fireEvent.change(editor, {
                target: { value: editor.value.replace("id: my_param__2_", "id: custom_id") },
            });
            fireEvent.click(screen.getByText("Create", { selector: "button span, button" }));

            await waitFor(() => {
                expect(createMock).toHaveBeenCalledTimes(1);
            });
            expect(screen.getByText("Create parameter")).toBeInTheDocument();
        });
    });

    describe("parameter edit-to-duplicate handoff", () => {
        it("passes unsaved YAML edits from the edit dialog into the duplicate dialog", async () => {
            render(
                <CatalogDetailActions
                    item={parameterItem}
                    canEdit
                    onOpen={vi.fn()}
                    onCatalogItemCreate={vi.fn()}
                    onCatalogItemUpdate={vi.fn()}
                    onCatalogItemDelete={vi.fn()}
                />,
                { wrapper: createWrapper() },
            );

            fireEvent.click(screen.getByRole("button", { name: /^edit$/i }));

            const editor = (await screen.findByTestId("yaml-editor")) as HTMLTextAreaElement;
            fireEvent.change(editor, {
                target: {
                    value: `id: param.id
title: Edited Title
description: ""
tags: []
definition:
  type: NUMBER
  defaultValue: 15`,
                },
            });
            fireEvent.click(screen.getByText("Save as new"));

            await screen.findByText("Create parameter");
            const duplicateEditor = screen.getByTestId("yaml-editor") as HTMLTextAreaElement;
            expect(duplicateEditor.value).toContain("title: Edited Title (2)");
        });
    });

    describe("parameter items with edit permission", () => {
        it("renders an Edit button and an overflow menu with Duplicate and Delete", () => {
            render(
                <CatalogDetailActions
                    item={parameterItem}
                    canEdit
                    onOpen={vi.fn()}
                    onCatalogItemCreate={vi.fn()}
                    onCatalogItemUpdate={vi.fn()}
                    onCatalogItemDelete={vi.fn()}
                />,
                { wrapper: createWrapper() },
            );

            expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();

            fireEvent.click(screen.getByRole("button", { name: /actions for/i }));

            expect(screen.getByText("Save as new")).toBeInTheDocument();
            expect(screen.getByText("Delete")).toBeInTheDocument();
        });
    });

    describe("parameter items without edit permission", () => {
        it("renders no action buttons", () => {
            render(
                <CatalogDetailActions
                    item={parameterItem}
                    canEdit={false}
                    onOpen={vi.fn()}
                    onCatalogItemCreate={vi.fn()}
                    onCatalogItemUpdate={vi.fn()}
                    onCatalogItemDelete={vi.fn()}
                />,
                { wrapper: createWrapper() },
            );

            expect(screen.queryByRole("button")).not.toBeInTheDocument();
            expect(screen.queryByRole("link")).not.toBeInTheDocument();
        });
    });

    describe("non-parameter items", () => {
        it("renders an Open button that invokes onOpen with the item", () => {
            const onOpen = vi.fn();
            render(
                <CatalogDetailActions
                    item={dashboardItem}
                    canEdit
                    onOpen={onOpen}
                    onCatalogItemCreate={vi.fn()}
                    onCatalogItemUpdate={vi.fn()}
                    onCatalogItemDelete={vi.fn()}
                />,
                { wrapper: createWrapper() },
            );

            const openButton = screen.getByRole("link", { name: /open/i });
            fireEvent.click(openButton);

            expect(onOpen).toHaveBeenCalledTimes(1);
            expect(onOpen).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    item: dashboardItem,
                    workspaceId: "test-workspace",
                }),
            );
        });
    });
});
