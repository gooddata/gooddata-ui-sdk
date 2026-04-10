// (C) 2026 GoodData Corporation

import type { PropsWithChildren } from "react";

import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IParameterMetadataObject } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { CatalogFeedProvider } from "../../catalogItem/CatalogFeedContext.js";
import type { ICatalogItemParameter } from "../../catalogItem/types.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { ParameterEditDialog } from "../ParameterEditDialog.js";

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

const createdParameter: IParameterMetadataObject = {
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
    updated: "2024-01-03",
    definition: { type: "NUMBER", defaultValue: 10 },
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

const updatedParameter: IParameterMetadataObject = {
    ...createdParameter,
    updated: "2024-02-01",
    updatedBy: {
        ref: { identifier: "user3" },
        login: "user3",
        fullName: "Updated User",
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

describe("ParameterEditDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        createParameterMock.mockResolvedValue(createdParameter);
        updateParameterMock.mockResolvedValue(updatedParameter);
    });

    it("creates a new parameter and converts it for onSaved", async () => {
        const onSaved = vi.fn();

        render(
            <ParameterEditDialog
                backend={backend}
                workspace="test-workspace"
                item={parameterItem}
                onClose={vi.fn()}
                onSaved={onSaved}
            />,
            { wrapper: Wrapper },
        );

        const saveAsNewButton = await screen.findByText("Save as new");
        await act(async () => {
            saveAsNewButton.click();
        });

        await waitFor(() => {
            expect(createParameterMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: "param.id",
                    type: "parameter",
                    title: "My Param",
                    description: "Description",
                    tags: [],
                    definition: { type: "NUMBER", defaultValue: 10 },
                }),
            );
        });

        expect(updateParameterMock).not.toHaveBeenCalled();
        expect(onSaved).toHaveBeenCalledWith(
            expect.objectContaining({
                identifier: "param.id",
                type: "parameter",
                createdBy: "Jane Doe",
                updatedBy: "John Smith",
                definition: { type: "NUMBER", defaultValue: 10 },
            }),
        );
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
            />,
            { wrapper: Wrapper },
        );

        const saveButton = await screen.findByText("Save", { selector: "button span, button" });
        await act(async () => {
            saveButton.click();
        });

        await waitFor(() => {
            expect(updateParameterMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: "param.id",
                    identifier: "param.id",
                    uri: "param.id",
                    description: "Description",
                    tags: [],
                    title: "My Param",
                    definition: { type: "NUMBER", defaultValue: 10 },
                }),
            );
        });

        expect(createParameterMock).not.toHaveBeenCalled();
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
