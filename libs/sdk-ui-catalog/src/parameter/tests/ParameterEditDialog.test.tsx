// (C) 2026 GoodData Corporation

import type { PropsWithChildren } from "react";

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IParameterMetadataObject, IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { CatalogFeedProvider } from "../../catalogItem/CatalogFeedContext.js";
import type { ICatalogItemParameter } from "../../catalogItem/types.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { TestPermissionsProvider } from "../../permission/TestPermissionsProvider.js";
import { ParameterEditDialog } from "../ParameterEditDialog.js";

vi.mock("../../catalogItem/useCatalogItemFeed.js");

// Mock SyntaxHighlightingInput (CodeMirror doesn't work in happy-dom)
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

const updatedParameter: IParameterMetadataObject = {
    id: "param.id",
    uri: "/gdc/md/param.id",
    ref: { identifier: "param.id", type: "parameter" },
    type: "parameter",
    title: "My Param",
    description: "Description",
    tags: [],
    production: true,
    deprecated: false,
    unlisted: false,
    created: "2024-01-01",
    updated: "2024-02-01",
    definition: { type: "NUMBER", defaultValue: 10 },
    createdBy: {
        ref: { identifier: "user1" },
        login: "user1",
        firstName: "Jane",
        lastName: "Doe",
    },
    updatedBy: {
        ref: { identifier: "user3" },
        login: "user3",
        fullName: "Updated User",
    },
};

const updateParameterMock = vi.fn();

const backend = {
    workspace: () => ({
        parameters: () => ({
            updateParameter: updateParameterMock,
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

describe("ParameterEditDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        updateParameterMock.mockResolvedValue(updatedParameter);
    });

    it("passes the current parameter to onDuplicate", async () => {
        const onDuplicate = vi.fn();

        render(
            <ParameterEditDialog
                backend={backend}
                workspace="test-workspace"
                item={parameterItem}
                onClose={vi.fn()}
                onSaved={vi.fn()}
                onDuplicate={onDuplicate}
            />,
            { wrapper: Wrapper },
        );

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
        fireEvent.click(await screen.findByText("Save as new"));

        expect(onDuplicate).toHaveBeenCalledWith({
            id: "custom.id",
            type: "parameter",
            title: "Edited Param",
            description: "Description",
            tags: [],
            definition: { type: "NUMBER", defaultValue: 15 },
        } satisfies IParameterMetadataObjectDefinition);
        expect(updateParameterMock).not.toHaveBeenCalled();
    });

    it("updates an existing parameter with definition", async () => {
        const onSaved = vi.fn();

        render(
            <ParameterEditDialog
                backend={backend}
                workspace="test-workspace"
                item={parameterItem}
                onClose={vi.fn()}
                onSaved={onSaved}
                onDuplicate={vi.fn()}
            />,
            { wrapper: Wrapper },
        );

        const validYaml = `id: param.id
title: My Param
description: Updated
tags: []
definition:
  type: NUMBER
  defaultValue: 10`;

        fireEvent.change(await screen.findByTestId("yaml-editor"), {
            target: { value: validYaml },
        });

        const saveButton = screen.getByText("Save", { selector: "button span, button" });
        await act(async () => {
            saveButton.click();
        });

        await waitFor(() => {
            expect(updateParameterMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: "param.id",
                    identifier: "param.id",
                    uri: "param.id",
                    description: "Updated",
                    tags: [],
                    title: "My Param",
                    definition: { type: "NUMBER", defaultValue: 10 },
                }),
            );
        });

        expect(onSaved).toHaveBeenCalledWith(
            expect.objectContaining({
                identifier: "param.id",
                type: "parameter",
                updatedBy: "Updated User",
                definition: { type: "NUMBER", defaultValue: 10 },
            }),
        );
    });
});
