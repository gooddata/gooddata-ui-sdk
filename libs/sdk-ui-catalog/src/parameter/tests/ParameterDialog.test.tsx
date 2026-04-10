// (C) 2026 GoodData Corporation

import type { PropsWithChildren } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import type { ParameterDialogInitialParameter } from "../ParameterDialog.js";

// Mock SyntaxHighlightingInput since CodeMirror doesn't work in happy-dom
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

const createParameter: ParameterDialogInitialParameter = {
    title: "My Parameter",
    description: "",
    definition: {
        type: "NUMBER",
        defaultValue: 0,
    },
};

const validInitialParameter: ParameterDialogInitialParameter = {
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
            <ToastsCenterContextProvider>{children}</ToastsCenterContextProvider>
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

    it("renders 'Save as new' button in edit mode", () => {
        render(
            <ParameterDialog
                mode="edit"
                initialParameter={validInitialParameter}
                onClose={vi.fn()}
                onSubmit={vi.fn()}
            />,
            { wrapper },
        );

        expect(screen.getByText("Save as new")).toBeInTheDocument();
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

    it("calls submit with save as new flag in edit mode", () => {
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

        fireEvent.click(screen.getByText("Save as new"));

        expect(onSubmit).toHaveBeenCalledWith(validParameter, true);
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

        expect(screen.getByText("How to create a parameter?")).toBeInTheDocument();
    });

    it("shows error when content is empty", () => {
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

        fireEvent.change(screen.getByTestId("yaml-editor"), { target: { value: "" } });

        expect(screen.getByTestId("create")).toHaveAttribute("aria-disabled", "true");
        expect(screen.getByText("Parameter definition cannot be empty.")).toBeInTheDocument();
    });

    it("disables submit and shows an error for invalid YAML immediately", () => {
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

        fireEvent.change(screen.getByTestId("yaml-editor"), { target: { value: "id: [foo" } });

        expect(screen.getByTestId("create")).toHaveAttribute("aria-disabled", "true");
        expect(screen.getByText("YAML syntax error")).toBeInTheDocument();
    });

    it("disables submit and shows an error for unsupported parameter types", () => {
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

        fireEvent.change(screen.getByTestId("yaml-editor"), {
            target: {
                value: `definition:
  type: STRING
  defaultValue: 1
`,
            },
        });

        expect(screen.getByTestId("create")).toHaveAttribute("aria-disabled", "true");
        expect(screen.getByText("Only NUMBER parameters are supported.")).toBeInTheDocument();
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

        expect(onSubmit).toHaveBeenCalledWith(validParameter, false);
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

    it("allows id changes on Save as new in edit mode", () => {
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
        fireEvent.click(screen.getByText("Save as new"));

        expect(onSubmit).toHaveBeenCalledWith(
            {
                ...validParameter,
                id: "another",
            },
            true,
        );
    });
});
