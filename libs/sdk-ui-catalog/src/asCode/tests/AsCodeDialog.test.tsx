// (C) 2026 GoodData Corporation

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { PropsWithChildren, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { IAnalyticalBackend, IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { getAsCodeDescriptor } from "../../asCodeRegistry.js";
import type { ICatalogItemParameter } from "../../catalogItem/types.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { ObjectTypes } from "../../objectType/constants.js";
import { createTestParameterMutationPort } from "../../parameter/tests/parameterMutationPort.test.utils.js";
import {
    TestPermissionsProvider,
    defaultPermissionsResult,
} from "../../permission/TestPermissionsProvider.js";
import { AsCodeCreateDialog } from "../AsCodeCreateDialog.js";
import { AsCodeEditDialog } from "../AsCodeEditDialog.js";
import { AsCodeMutationProvider } from "../AsCodeMutationContext.js";

// The generic dialog is exercised through the parameter descriptor: parameter's context-aware
// validation (type-aware error phrasing) makes it the richest probe of the shared frame.
const parameterDescriptor = getAsCodeDescriptor(ObjectTypes.PARAMETER)!;

// The injected port means the backend is never called, so a bare stub satisfies the provider.
const stubBackend = {} as unknown as IAnalyticalBackend;

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => {
    const original = await importOriginal<Record<string, unknown>>();
    return {
        ...original,
        YamlEditor: ({
            initialValue,
            onChange,
            disabled,
        }: {
            initialValue: string;
            onChange?: (value: string) => void;
            disabled?: boolean;
        }) => (
            <textarea
                data-testid="yaml-editor"
                defaultValue={initialValue}
                disabled={disabled}
                onChange={(e) => onChange?.(e.target.value)}
            />
        ),
    };
});

const editItem: ICatalogItemParameter = {
    identifier: "test",
    type: "parameter",
    title: "Test parameter",
    description: "",
    tags: [],
    createdBy: "user",
    updatedBy: "user",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
    definition: { type: "NUMBER", defaultValue: 1 },
};

function makeWrapper(
    settings: Partial<IUserWorkspaceSettings> = {},
    port = createTestParameterMutationPort(),
) {
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <TestIntlProvider>
                <BackendProvider backend={stubBackend}>
                    <WorkspaceProvider workspace="test-workspace">
                        <ToastsCenterContextProvider>
                            <TestPermissionsProvider
                                result={{
                                    ...defaultPermissionsResult,
                                    settings: settings as IUserWorkspaceSettings,
                                }}
                            >
                                <AsCodeMutationProvider
                                    ports={{
                                        [ObjectTypes.PARAMETER]: port,
                                    }}
                                >
                                    {children}
                                </AsCodeMutationProvider>
                            </TestPermissionsProvider>
                        </ToastsCenterContextProvider>
                    </WorkspaceProvider>
                </BackendProvider>
            </TestIntlProvider>
        );
    }
    return Wrapper;
}

// The editor body is lazy-loaded behind Suspense, so wait for it before typing.
async function typeYaml(value: string) {
    const editor = await screen.findByTestId("yaml-editor");
    fireEvent.change(editor, { target: { value } });
}

function clickSubmit(label: string) {
    fireEvent.click(screen.getByText(label, { selector: "button span, button" }));
}

function renderCreate(wrapper: (props: { children: ReactNode }) => ReactNode) {
    return render(<AsCodeCreateDialog descriptor={parameterDescriptor} onClose={vi.fn()} />, { wrapper });
}

describe("AsCodeDialog chrome", () => {
    it("renders the entity's help link", () => {
        renderCreate(makeWrapper());
        const link = screen.getByText("How to create a parameter?").closest("a");
        expect(link).toHaveAttribute(
            "href",
            "https://www.gooddata.ai/docs/cloud/experimental-features/numeric-parameters/",
        );
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("hides the help link on white-labeled deployments", () => {
        renderCreate(makeWrapper({ whiteLabeling: { enabled: true } }));
        expect(screen.queryByText("How to create a parameter?")).not.toBeInTheDocument();
    });
});

describe("AsCodeDialog validation display", () => {
    it("shows the entity error when the content is empty", async () => {
        renderCreate(makeWrapper());
        await typeYaml("");
        clickSubmit("Create");
        expect(screen.getByText("Parameter definition cannot be empty.")).toBeInTheDocument();
    });

    it("shows the entity error for invalid YAML", async () => {
        renderCreate(makeWrapper());
        await typeYaml("id: [foo");
        clickSubmit("Create");
        expect(screen.getByText("YAML syntax error")).toBeInTheDocument();
    });

    it("shows the entity error for an unsupported type", async () => {
        renderCreate(makeWrapper());
        await typeYaml("definition:\n  type: STRING\n  defaultValue: 1\n");
        clickSubmit("Create");
        expect(screen.getByText("Only NUMBER parameters are supported.")).toBeInTheDocument();
    });
});

describe("AsCodeDialog validation display with the entity's own context (string parameters enabled)", () => {
    const stringEnabled = makeWrapper({ enableStringParameters: true });

    it("lists every enabled type in the unsupported-type error", async () => {
        renderCreate(stringEnabled);
        await typeYaml("definition:\n  type: DATE\n  defaultValue: 1\n");
        clickSubmit("Create");
        expect(screen.getByText("Only NUMBER and STRING parameters are supported.")).toBeInTheDocument();
    });

    it("phrases the default-value error for the declared STRING type", async () => {
        renderCreate(stringEnabled);
        await typeYaml("definition:\n  type: STRING\n  defaultValue: 5\n");
        clickSubmit("Create");
        expect(screen.getByText("Default value must be a string.")).toBeInTheDocument();
    });
});

describe("AsCodeDialog submit", () => {
    it("passes the parsed definition to the port and reports success", async () => {
        const created = { ...editItem, identifier: "test" };
        const port = createTestParameterMutationPort({ create: vi.fn().mockResolvedValue(created) });
        const onCreated = vi.fn();
        render(
            <AsCodeCreateDialog descriptor={parameterDescriptor} onClose={vi.fn()} onCreated={onCreated} />,
            { wrapper: makeWrapper({}, port) },
        );

        await typeYaml(`id: test
title: Test parameter
description: ""
tags: []
definition:
  type: NUMBER
  defaultValue: 1`);
        clickSubmit("Create");

        await waitFor(() =>
            expect(port.create).toHaveBeenCalledWith(
                expect.objectContaining({ id: "test", title: "Test parameter" }),
            ),
        );
        await waitFor(() => expect(onCreated).toHaveBeenCalledWith(created));
    });

    it("locks the dialog while a save is in flight", async () => {
        let resolveUpdate: () => void = () => {};
        const onClose = vi.fn();
        const port = createTestParameterMutationPort({
            update: vi.fn(
                () =>
                    new Promise<ICatalogItemParameter>((resolve) => {
                        resolveUpdate = () => resolve(editItem);
                    }),
            ),
        });
        render(<AsCodeEditDialog descriptor={parameterDescriptor} item={editItem} onClose={onClose} />, {
            wrapper: makeWrapper({}, port),
        });

        const editor = (await screen.findByTestId("yaml-editor")) as HTMLTextAreaElement;
        // A dirty, still-valid edit so the Save button is enabled and submission actually starts.
        fireEvent.change(editor, {
            target: { value: editor.value.replace("Test parameter", "Edited parameter") },
        });
        await act(async () => {
            clickSubmit("Save");
        });

        expect(screen.getByTestId("yaml-editor")).toBeDisabled();
        expect(
            screen.getByText("Save", { selector: "button span, button" }).closest("button"),
        ).toHaveAttribute("aria-disabled", "true");
        expect(screen.getByText("Cancel").closest("button")).toHaveAttribute("aria-disabled", "true");
        expect(screen.queryByLabelText("Close dialog")).not.toBeInTheDocument();
        // Cancelling is a no-op while the save is in flight.
        fireEvent.click(screen.getByText("Cancel"));
        expect(onClose).not.toHaveBeenCalled();

        await act(async () => resolveUpdate());
    });

    it("rejects an id change on save in edit mode", async () => {
        const port = createTestParameterMutationPort({ update: vi.fn() });
        render(<AsCodeEditDialog descriptor={parameterDescriptor} item={editItem} onClose={vi.fn()} />, {
            wrapper: makeWrapper({}, port),
        });

        const editor = (await screen.findByTestId("yaml-editor")) as HTMLTextAreaElement;
        fireEvent.change(editor, { target: { value: editor.value.replace("id: test", "id: another") } });
        clickSubmit("Save");

        expect(port.update).not.toHaveBeenCalled();
        expect(
            screen.getByText(
                "Parameter id cannot be changed when saving an existing parameter. Use Save as new instead.",
            ),
        ).toBeInTheDocument();
    });
});
