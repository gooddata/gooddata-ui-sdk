// (C) 2026 GoodData Corporation

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend, UnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import type { IParameterMetadataObject } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { CatalogFeedProvider } from "../../catalogItem/CatalogFeedContext.js";
import type { ICatalogItemParameter } from "../../catalogItem/types.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { TestPermissionsProvider } from "../../permission/TestPermissionsProvider.js";
import { ParameterDuplicateDialog } from "../ParameterDuplicateDialog.js";

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
    identifier: "my_param",
    type: "parameter",
    title: "My Param",
    description: "A description",
    tags: ["tag1"],
    createdBy: "user",
    updatedBy: "user",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
    definition: { type: "NUMBER", defaultValue: 10, constraints: { min: 0, max: 100 } },
};

const createdParameter: IParameterMetadataObject = {
    id: "my_param__2_",
    uri: "/gdc/md/my_param__2_",
    ref: { identifier: "my_param__2_", type: "parameter" },
    type: "parameter",
    title: "My Param (2)",
    description: "A description",
    tags: ["tag1"],
    production: true,
    deprecated: false,
    unlisted: false,
    definition: { type: "NUMBER", defaultValue: 10, constraints: { min: 0, max: 100 } },
};

const createParameterMock = vi.fn();

const backend = {
    workspace: () => ({
        parameters: () => ({
            createParameter: createParameterMock,
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

describe("ParameterDuplicateDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        createParameterMock.mockResolvedValue(createdParameter);
    });

    it("opens in create mode with copied title and id", async () => {
        render(
            <ParameterDuplicateDialog
                backend={backend}
                workspace="test-workspace"
                item={parameterItem}
                onClose={vi.fn()}
                onSaved={vi.fn()}
            />,
            { wrapper: Wrapper },
        );

        expect(await screen.findByText("Create parameter")).toBeInTheDocument();

        const editor = screen.getByTestId("yaml-editor") as HTMLTextAreaElement;
        expect(editor.value).toContain("My Param (2)");
        expect(editor.value).toContain("id: my_param__2_");
    });

    it("prefills description, tags, and definition from source", async () => {
        render(
            <ParameterDuplicateDialog
                backend={backend}
                workspace="test-workspace"
                item={parameterItem}
                onClose={vi.fn()}
                onSaved={vi.fn()}
            />,
            { wrapper: Wrapper },
        );

        const editor = (await screen.findByTestId("yaml-editor")) as HTMLTextAreaElement;

        expect(editor.value).toContain("A description");
        expect(editor.value).toContain("tag1");
        expect(editor.value).toContain("10");
    });

    it("keeps blank titles blank and omits id", async () => {
        const itemWithEmptyTitle: ICatalogItemParameter = {
            ...parameterItem,
            title: "",
            identifier: "original_id",
        };

        render(
            <ParameterDuplicateDialog
                backend={backend}
                workspace="test-workspace"
                item={itemWithEmptyTitle}
                onClose={vi.fn()}
                onSaved={vi.fn()}
            />,
            { wrapper: Wrapper },
        );

        const editor = (await screen.findByTestId("yaml-editor")) as HTMLTextAreaElement;

        expect(editor.value).toContain(`title: ""`);
        expect(editor.value).not.toContain("id:");
    });

    it("omits id in YAML when the source identifier is a canonical UUID", async () => {
        const itemWithUuidId: ICatalogItemParameter = {
            ...parameterItem,
            identifier: "123e4567-e89b-12d3-a456-426614174000",
        };

        render(
            <ParameterDuplicateDialog
                backend={backend}
                workspace="test-workspace"
                item={itemWithUuidId}
                onClose={vi.fn()}
                onSaved={vi.fn()}
            />,
            { wrapper: Wrapper },
        );

        const editor = (await screen.findByTestId("yaml-editor")) as HTMLTextAreaElement;
        expect(editor.value).not.toContain("id:");
    });

    it("submits the transformed create payload", async () => {
        const onSaved = vi.fn();
        const onClose = vi.fn();

        render(
            <ParameterDuplicateDialog
                backend={backend}
                workspace="test-workspace"
                item={parameterItem}
                onClose={onClose}
                onSaved={onSaved}
            />,
            { wrapper: Wrapper },
        );

        const createButton = await screen.findByText("Create");
        await act(async () => {
            createButton.click();
        });

        await waitFor(() => {
            expect(createParameterMock).toHaveBeenCalledWith({
                id: "my_param__2_",
                type: "parameter",
                title: "My Param (2)",
                description: "A description",
                tags: ["tag1"],
                definition: { type: "NUMBER", defaultValue: 10, constraints: { min: 0, max: 100 } },
            });
        });

        expect(onSaved).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });

    it("retries once without id when auto-generated copy id collides", async () => {
        createParameterMock
            .mockRejectedValueOnce(new UnexpectedResponseError("Duplicate id", 409, {}))
            .mockResolvedValueOnce(createdParameter);
        const onSaved = vi.fn();

        render(
            <ParameterDuplicateDialog
                backend={backend}
                workspace="test-workspace"
                item={parameterItem}
                onClose={vi.fn()}
                onSaved={onSaved}
            />,
            { wrapper: Wrapper },
        );

        fireEvent.click(await screen.findByText("Create"));

        await waitFor(() => {
            expect(createParameterMock).toHaveBeenCalledTimes(2);
        });

        expect(createParameterMock).toHaveBeenNthCalledWith(1, {
            id: "my_param__2_",
            type: "parameter",
            title: "My Param (2)",
            description: "A description",
            tags: ["tag1"],
            definition: { type: "NUMBER", defaultValue: 10, constraints: { min: 0, max: 100 } },
        });
        expect(createParameterMock).toHaveBeenNthCalledWith(2, {
            type: "parameter",
            title: "My Param (2)",
            description: "A description",
            tags: ["tag1"],
            definition: { type: "NUMBER", defaultValue: 10, constraints: { min: 0, max: 100 } },
        });
        expect(onSaved).toHaveBeenCalled();
    });

    it("keeps dialog open when a user-edited id collides", async () => {
        createParameterMock.mockRejectedValue(new UnexpectedResponseError("Duplicate id", 409, {}));

        render(
            <ParameterDuplicateDialog
                backend={backend}
                workspace="test-workspace"
                item={parameterItem}
                onClose={vi.fn()}
                onSaved={vi.fn()}
            />,
            { wrapper: Wrapper },
        );

        fireEvent.change(await screen.findByTestId("yaml-editor"), {
            target: {
                value: (screen.getByTestId("yaml-editor") as HTMLTextAreaElement).value.replace(
                    "id: my_param__2_",
                    "id: custom_id",
                ),
            },
        });
        fireEvent.click(screen.getByText("Create"));

        await waitFor(() => {
            expect(screen.getByText(/Duplicate id/)).toBeInTheDocument();
        });

        expect(createParameterMock).toHaveBeenCalledTimes(1);
        expect(screen.getByText("Create parameter")).toBeInTheDocument();
    });
});
