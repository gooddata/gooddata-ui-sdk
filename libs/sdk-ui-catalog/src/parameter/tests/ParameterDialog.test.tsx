// (C) 2026 GoodData Corporation

import { act, fireEvent, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it, vi } from "vitest";

import type { IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import {
    TestPermissionsProvider,
    defaultPermissionsResult,
} from "../../permission/TestPermissionsProvider.js";
import type { ParameterDraft } from "../parameterSerialization.js";

// Mock YamlEditor since CodeMirror doesn't work in happy-dom
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

const { ParameterDialog } = await import("../ParameterDialog.js");

const validParameter: IParameterMetadataObjectDefinition = {
    type: "parameter",
    id: "test",
    title: "Test parameter",
    description: "",
    tags: [],
    definition: {
        type: "NUMBER",
        defaultValue: 1,
    },
};

const createParameter: ParameterDraft = {
    title: "My Parameter",
    description: "",
    definition: {
        type: "NUMBER",
        defaultValue: 0,
    },
};

const validInitialParameter: ParameterDraft = {
    id: "test",
    title: "Test parameter",
    description: "",
    tags: [],
    definition: {
        type: "NUMBER",
        defaultValue: 1,
    },
};

const canonicalCreateYaml = `title: My Parameter
description: ""
definition:
  type: NUMBER
  defaultValue: 0`;

const validYaml = `id: test
title: Test parameter
description: ""
tags: []
definition:
  type: NUMBER
  defaultValue: 1`;

function wrapper({ children }: PropsWithChildren) {
    return (
        <TestIntlProvider>
            <ToastsCenterContextProvider>
                <TestPermissionsProvider>{children}</TestPermissionsProvider>
            </ToastsCenterContextProvider>
        </TestIntlProvider>
    );
}

describe("ParameterDialog", () => {
    it("renders with 'Create parameter' title in create mode", () => {
        render(
            <ParameterDialog
                mode="create"
                initialParameter={createParameter}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
            />,
            {
                wrapper,
            },
        );

        expect(screen.getByText("Create parameter")).toBeInTheDocument();
    });

    it("renders with 'Edit parameter' title in edit mode", () => {
        render(
            <ParameterDialog
                mode="edit"
                initialParameter={validInitialParameter}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
            />,
            { wrapper },
        );

        expect(screen.getByText("Edit parameter")).toBeInTheDocument();
    });

    it("renders Cancel and Create buttons in create mode", () => {
        render(
            <ParameterDialog
                mode="create"
                initialParameter={createParameter}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
            />,
            {
                wrapper,
            },
        );

        expect(screen.getByText("Cancel")).toBeInTheDocument();
        expect(screen.getByText("Create", { selector: "button span, button" })).toBeInTheDocument();
    });

    it("renders Save button in edit mode", () => {
        render(
            <ParameterDialog
                mode="edit"
                initialParameter={validInitialParameter}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
            />,
            { wrapper },
        );

        expect(screen.getByText("Save")).toBeInTheDocument();
    });

    it("renders 'Save as new' button in edit mode when onDuplicate is provided", () => {
        render(
            <ParameterDialog
                mode="edit"
                initialParameter={validInitialParameter}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
                onDuplicate={vi.fn()}
            />,
            { wrapper },
        );

        expect(screen.getByText("Save as new")).toBeInTheDocument();
    });

    it("does not render 'Save as new' button in edit mode without onDuplicate", () => {
        render(
            <ParameterDialog
                mode="edit"
                initialParameter={validInitialParameter}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
            />,
            { wrapper },
        );

        expect(screen.queryByText("Save as new")).not.toBeInTheDocument();
    });

    it("does not render 'Save as new' button in create mode", () => {
        render(
            <ParameterDialog
                mode="create"
                initialParameter={createParameter}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
            />,
            {
                wrapper,
            },
        );

        expect(screen.queryByText("Save as new")).not.toBeInTheDocument();
    });

    it("passes the current parameter to onDuplicate in edit mode", () => {
        const onSubmit = vi.fn();
        const onDuplicate = vi.fn();
        render(
            <ParameterDialog
                mode="edit"
                initialParameter={validInitialParameter}
                onClose={vi.fn()}
                onSubmit={onSubmit}
                onDuplicate={onDuplicate}
            />,
            { wrapper },
        );

        fireEvent.click(screen.getByText("Save as new"));

        expect(onSubmit).not.toHaveBeenCalled();
        expect(onDuplicate).toHaveBeenCalledWith(validParameter);
    });

    it("calls onClose when Cancel is clicked", () => {
        const onClose = vi.fn();
        render(
            <ParameterDialog
                mode="create"
                initialParameter={createParameter}
                onClose={onClose}
                onSubmit={vi.fn()}
            />,
            {
                wrapper,
            },
        );

        fireEvent.click(screen.getByText("Cancel"));

        expect(onClose).toHaveBeenCalled();
    });

    it("renders the help link", () => {
        render(
            <ParameterDialog
                mode="create"
                initialParameter={createParameter}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
            />,
            {
                wrapper,
            },
        );

        const link = screen.getByText("How to create a parameter?").closest("a");
        expect(link).toHaveAttribute(
            "href",
            "https://www.gooddata.ai/docs/cloud/experimental-features/numeric-parameters/",
        );
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("hides the help link on white-labeled deployments", () => {
        function whiteLabeledWrapper({ children }: PropsWithChildren) {
            return (
                <TestIntlProvider>
                    <ToastsCenterContextProvider>
                        <TestPermissionsProvider
                            result={{
                                ...defaultPermissionsResult,
                                settings: {
                                    whiteLabeling: { enabled: true },
                                } as IUserWorkspaceSettings,
                            }}
                        >
                            {children}
                        </TestPermissionsProvider>
                    </ToastsCenterContextProvider>
                </TestIntlProvider>
            );
        }

        render(
            <ParameterDialog
                mode="create"
                initialParameter={createParameter}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
            />,
            { wrapper: whiteLabeledWrapper },
        );

        expect(screen.queryByText("How to create a parameter?")).not.toBeInTheDocument();
    });

    it("shows error on submit when content is empty", () => {
        const onSubmit = vi.fn();
        render(
            <ParameterDialog
                mode="create"
                initialParameter={createParameter}
                onClose={vi.fn()}
                onSubmit={onSubmit}
            />,
            { wrapper },
        );

        fireEvent.change(screen.getByTestId("yaml-editor"), { target: { value: "" } });
        fireEvent.click(screen.getByTestId("create"));

        expect(onSubmit).not.toHaveBeenCalled();
        expect(screen.getByText("Parameter definition cannot be empty.")).toBeInTheDocument();
    });

    it("shows error on submit for invalid YAML", () => {
        const onSubmit = vi.fn();
        render(
            <ParameterDialog
                mode="create"
                initialParameter={createParameter}
                onClose={vi.fn()}
                onSubmit={onSubmit}
            />,
            { wrapper },
        );

        fireEvent.change(screen.getByTestId("yaml-editor"), { target: { value: "id: [foo" } });
        fireEvent.click(screen.getByTestId("create"));

        expect(onSubmit).not.toHaveBeenCalled();
        expect(screen.getByText("YAML syntax error")).toBeInTheDocument();
    });

    it("shows error on submit for unsupported parameter types", () => {
        const onSubmit = vi.fn();
        render(
            <ParameterDialog
                mode="create"
                initialParameter={createParameter}
                onClose={vi.fn()}
                onSubmit={onSubmit}
            />,
            { wrapper },
        );

        fireEvent.change(screen.getByTestId("yaml-editor"), {
            target: {
                value: `definition:
  type: STRING
  defaultValue: 1
`,
            },
        });
        fireEvent.click(screen.getByTestId("create"));

        expect(onSubmit).not.toHaveBeenCalled();
        expect(screen.getByText("Only NUMBER parameters are supported.")).toBeInTheDocument();
    });

    describe("string parameters enabled", () => {
        function stringEnabledWrapper({ children }: PropsWithChildren) {
            return (
                <TestIntlProvider>
                    <ToastsCenterContextProvider>
                        <TestPermissionsProvider
                            result={{
                                ...defaultPermissionsResult,
                                settings: {
                                    enableStringParameters: true,
                                } as IUserWorkspaceSettings,
                            }}
                        >
                            {children}
                        </TestPermissionsProvider>
                    </ToastsCenterContextProvider>
                </TestIntlProvider>
            );
        }

        it("lists every supported type in the unsupported type error", () => {
            render(
                <ParameterDialog
                    mode="create"
                    initialParameter={createParameter}
                    onClose={vi.fn()}
                    onSubmit={vi.fn()}
                />,
                { wrapper: stringEnabledWrapper },
            );

            fireEvent.change(screen.getByTestId("yaml-editor"), {
                target: {
                    value: `definition:
  type: DATE
  defaultValue: 1
`,
                },
            });
            fireEvent.click(screen.getByTestId("create"));

            expect(screen.getByText("Only NUMBER and STRING parameters are supported.")).toBeInTheDocument();
        });

        it("phrases the default value error for the declared STRING type", () => {
            render(
                <ParameterDialog
                    mode="create"
                    initialParameter={createParameter}
                    onClose={vi.fn()}
                    onSubmit={vi.fn()}
                />,
                { wrapper: stringEnabledWrapper },
            );

            fireEvent.change(screen.getByTestId("yaml-editor"), {
                target: {
                    value: `definition:
  type: STRING
  defaultValue: 5
`,
                },
            });
            fireEvent.click(screen.getByTestId("create"));

            expect(screen.getByText("Default value must be a string.")).toBeInTheDocument();
        });

        it("phrases the constraints error for the declared STRING type only", () => {
            render(
                <ParameterDialog
                    mode="create"
                    initialParameter={createParameter}
                    onClose={vi.fn()}
                    onSubmit={vi.fn()}
                />,
                { wrapper: stringEnabledWrapper },
            );

            fireEvent.change(screen.getByTestId("yaml-editor"), {
                target: {
                    value: `definition:
  type: STRING
  defaultValue: Actual
  constraints:
    minLength: -1
`,
                },
            });
            fireEvent.click(screen.getByTestId("create"));

            expect(
                screen.getByText(
                    "Invalid constraints: STRING parameters allow non-negative integer minLength and maxLength.",
                ),
            ).toBeInTheDocument();
        });
    });

    it("submits parsed parameter definition in create mode", () => {
        const onSubmit = vi.fn();
        render(
            <ParameterDialog
                mode="create"
                initialParameter={createParameter}
                onClose={vi.fn()}
                onSubmit={onSubmit}
            />,
            {
                wrapper,
            },
        );

        fireEvent.change(screen.getByTestId("yaml-editor"), {
            target: {
                value: validYaml,
            },
        });
        fireEvent.click(screen.getByTestId("create"));

        expect(onSubmit).toHaveBeenCalledWith(validParameter);
    });

    it("renders the YAML editor", () => {
        render(
            <ParameterDialog
                mode="create"
                initialParameter={createParameter}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
            />,
            {
                wrapper,
            },
        );

        expect(screen.getByTestId("yaml-editor")).toBeInTheDocument();
    });

    it("serializes the provided create parameter in stable property order", () => {
        render(
            <ParameterDialog
                mode="create"
                initialParameter={createParameter}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
            />,
            { wrapper },
        );

        expect((screen.getByTestId("yaml-editor") as HTMLTextAreaElement).value).toBe(canonicalCreateYaml);
    });

    it("prefills the YAML editor in edit mode", () => {
        render(
            <ParameterDialog
                mode="edit"
                initialParameter={validInitialParameter}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
            />,
            { wrapper },
        );

        expect((screen.getByTestId("yaml-editor") as HTMLTextAreaElement).value).toBe(validYaml);
    });

    it("locks the dialog while submitting", async () => {
        let resolveSubmit!: () => void;
        const onSubmit = vi.fn(() => new Promise<void>((resolve) => (resolveSubmit = resolve)));
        const onClose = vi.fn();

        render(
            <ParameterDialog
                mode="edit"
                initialParameter={validInitialParameter}
                onClose={onClose}
                onSubmit={onSubmit}
            />,
            { wrapper },
        );

        // Make a change to enable the Save button
        fireEvent.change(screen.getByTestId("yaml-editor"), {
            target: { value: validYaml.replace("Test parameter", "Edited parameter") },
        });

        // Trigger submit to enter submitting state
        await act(async () => {
            fireEvent.click(screen.getByText("Save", { selector: "button span, button" }));
        });

        expect(screen.getByTestId("yaml-editor")).toBeDisabled();
        expect(screen.getByText("Cancel").closest("button")).toHaveAttribute("aria-disabled", "true");
        expect(screen.queryByLabelText("Close dialog")).not.toBeInTheDocument();
        expect(
            screen.getByText("Save", { selector: "button span, button" }).closest("button"),
        ).toHaveAttribute("aria-disabled", "true");

        fireEvent.click(screen.getByText("Cancel"));
        expect(onClose).not.toHaveBeenCalled();

        // Resolve the submit to clean up
        await act(async () => resolveSubmit());
    });

    it("rejects id changes on Save in edit mode", () => {
        const onSubmit = vi.fn();
        render(
            <ParameterDialog
                mode="edit"
                initialParameter={validInitialParameter}
                onClose={vi.fn()}
                onSubmit={onSubmit}
            />,
            { wrapper },
        );

        fireEvent.change(screen.getByTestId("yaml-editor"), {
            target: {
                value: validYaml.replace(`id: test`, `id: another`),
            },
        });
        fireEvent.click(screen.getByText("Save", { selector: "button span, button" }));

        expect(onSubmit).not.toHaveBeenCalled();
        expect(
            screen.getByText(
                "Parameter id cannot be changed when saving an existing parameter. Use Save as new instead.",
            ),
        ).toBeInTheDocument();
    });

    it("uses unsaved YAML edits as the source when duplicating", () => {
        const onDuplicate = vi.fn();
        render(
            <ParameterDialog
                mode="edit"
                initialParameter={validInitialParameter}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
                onDuplicate={onDuplicate}
            />,
            { wrapper },
        );

        fireEvent.change(screen.getByTestId("yaml-editor"), {
            target: {
                value: validYaml.replace("Test parameter", "Edited parameter"),
            },
        });
        fireEvent.click(screen.getByText("Save as new"));

        expect(onDuplicate).toHaveBeenCalledWith({
            ...validParameter,
            title: "Edited parameter",
        });
    });
});
