// (C) 2026 GoodData Corporation

import type { PropsWithChildren } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend, UnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import type { IParameterMetadataObject } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { CatalogFeedProvider } from "../../catalogItem/CatalogFeedContext.js";
import type { ICatalogItemParameter } from "../../catalogItem/types.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { ParameterActions } from "../ParameterActions.js";

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

const createdParameter: IParameterMetadataObject = {
    id: "edited_param__2_",
    uri: "/gdc/md/edited_param__2_",
    ref: { identifier: "edited_param__2_", type: "parameter" },
    type: "parameter",
    title: "Edited Param (2)",
    description: "Description",
    tags: [],
    production: true,
    deprecated: false,
    unlisted: false,
    created: "2024-01-01",
    updated: "2024-01-03",
    definition: { type: "NUMBER", defaultValue: 15 },
    createdBy: {
        ref: { identifier: "user1" },
        login: "user1",
        firstName: "Jane",
        lastName: "Doe",
    },
    updatedBy: {
        ref: { identifier: "user2" },
        login: "user2",
        fullName: "John Smith",
    },
};

const createParameterMock = vi.fn();
const updateParameterMock = vi.fn();

const backend = {
    workspace: () => ({
        parameters: () => ({
            createParameter: createParameterMock,
            updateParameter: updateParameterMock,
        }),
    }),
} as unknown as IAnalyticalBackend;

function Wrapper({ children }: PropsWithChildren) {
    return (
        <TestIntlProvider>
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace="test-workspace">
                    <CatalogFeedProvider>
                        <ToastsCenterContextProvider>{children}</ToastsCenterContextProvider>
                    </CatalogFeedProvider>
                </WorkspaceProvider>
            </BackendProvider>
        </TestIntlProvider>
    );
}

describe("ParameterActions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        createParameterMock.mockResolvedValue(createdParameter);
    });

    it("switches from edit dialog to create dialog using unsaved YAML edits", async () => {
        const updateItem = vi.fn();
        const setItemOpened = vi.fn();

        render(
            <ParameterActions
                backend={backend}
                workspace="test-workspace"
                updateItem={updateItem}
                removeItem={vi.fn()}
                setItemOpened={setItemOpened}
                onCloseDetail={vi.fn()}
            >
                {({ onEditClick }) => (
                    <button
                        onClick={(event) =>
                            onEditClick(event, {
                                item: parameterItem,
                                workspaceId: "test-workspace",
                                newTab: false,
                                preventDefault: vi.fn(),
                            })
                        }
                    >
                        Edit parameter
                    </button>
                )}
            </ParameterActions>,
            { wrapper: Wrapper },
        );

        fireEvent.click(screen.getByText("Edit parameter"));
        fireEvent.change(await screen.findByTestId("yaml-editor"), {
            target: {
                value: `id: param.id
title: Edited Param
description: "Description"
tags: []
definition:
  type: NUMBER
  defaultValue: 15`,
            },
        });
        fireEvent.click(screen.getByText("Save as new"));

        expect(await screen.findByText("Create parameter")).toBeInTheDocument();
        expect(screen.queryByText("Save as new")).not.toBeInTheDocument();
        expect((screen.getByTestId("yaml-editor") as HTMLTextAreaElement).value).toContain(
            "title: Edited Param (2)",
        );
        expect((screen.getByTestId("yaml-editor") as HTMLTextAreaElement).value).toContain(
            "id: edited_param__2_",
        );

        fireEvent.click(screen.getByText("Create", { selector: "button span, button" }));

        await waitFor(() => {
            expect(createParameterMock).toHaveBeenCalledWith({
                id: "edited_param__2_",
                type: "parameter",
                title: "Edited Param (2)",
                description: "Description",
                tags: [],
                definition: { type: "NUMBER", defaultValue: 15 },
            });
        });

        expect(updateParameterMock).not.toHaveBeenCalled();
        expect(updateItem).toHaveBeenCalledWith(
            expect.objectContaining({
                identifier: "edited_param__2_",
                title: "Edited Param (2)",
                definition: { type: "NUMBER", defaultValue: 15 },
            }),
        );
        expect(setItemOpened).toHaveBeenCalledWith(
            expect.objectContaining({
                identifier: "edited_param__2_",
            }),
        );
    });

    it("preserves an edited canonical UUID id when switching to create mode", async () => {
        render(
            <ParameterActions
                backend={backend}
                workspace="test-workspace"
                updateItem={vi.fn()}
                removeItem={vi.fn()}
                setItemOpened={vi.fn()}
                onCloseDetail={vi.fn()}
            >
                {({ onEditClick }) => (
                    <button
                        onClick={(event) =>
                            onEditClick(event, {
                                item: parameterItem,
                                workspaceId: "test-workspace",
                                newTab: false,
                                preventDefault: vi.fn(),
                            })
                        }
                    >
                        Edit parameter
                    </button>
                )}
            </ParameterActions>,
            { wrapper: Wrapper },
        );

        fireEvent.click(screen.getByText("Edit parameter"));
        fireEvent.change(await screen.findByTestId("yaml-editor"), {
            target: {
                value: `id: 123e4567-e89b-12d3-a456-426614174000
title: Edited Param
description: "Description"
tags: []
definition:
  type: NUMBER
  defaultValue: 15`,
            },
        });
        fireEvent.click(screen.getByText("Save as new"));

        expect(await screen.findByText("Create parameter")).toBeInTheDocument();
        expect((screen.getByTestId("yaml-editor") as HTMLTextAreaElement).value).toContain(
            "title: Edited Param (2)",
        );
        expect((screen.getByTestId("yaml-editor") as HTMLTextAreaElement).value).not.toContain("id:");
    });

    it("retries without id after switching from edit to create when the copied id collides", async () => {
        createParameterMock
            .mockRejectedValueOnce(new UnexpectedResponseError("Duplicate id", 409, {}))
            .mockResolvedValueOnce(createdParameter);

        render(
            <ParameterActions
                backend={backend}
                workspace="test-workspace"
                updateItem={vi.fn()}
                removeItem={vi.fn()}
                setItemOpened={vi.fn()}
                onCloseDetail={vi.fn()}
            >
                {({ onEditClick }) => (
                    <button
                        onClick={(event) =>
                            onEditClick(event, {
                                item: parameterItem,
                                workspaceId: "test-workspace",
                                newTab: false,
                                preventDefault: vi.fn(),
                            })
                        }
                    >
                        Edit parameter
                    </button>
                )}
            </ParameterActions>,
            { wrapper: Wrapper },
        );

        fireEvent.click(screen.getByText("Edit parameter"));
        fireEvent.change(await screen.findByTestId("yaml-editor"), {
            target: {
                value: `id: custom.id
title: Edited Param
description: "Description"
tags: []
definition:
  type: NUMBER
  defaultValue: 15`,
            },
        });
        fireEvent.click(screen.getByText("Save as new"));
        fireEvent.click(await screen.findByText("Create", { selector: "button span, button" }));

        await waitFor(() => {
            expect(createParameterMock).toHaveBeenCalledTimes(2);
        });

        expect(createParameterMock).toHaveBeenNthCalledWith(1, {
            id: "edited_param__2_",
            type: "parameter",
            title: "Edited Param (2)",
            description: "Description",
            tags: [],
            definition: { type: "NUMBER", defaultValue: 15 },
        });
        expect(createParameterMock).toHaveBeenNthCalledWith(2, {
            type: "parameter",
            title: "Edited Param (2)",
            description: "Description",
            tags: [],
            definition: { type: "NUMBER", defaultValue: 15 },
        });
    });
});
