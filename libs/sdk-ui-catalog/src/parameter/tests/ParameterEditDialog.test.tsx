// (C) 2026 GoodData Corporation

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";
import { ToastsCenterContextProvider } from "@gooddata/sdk-ui-kit";

import type { ICatalogItemParameter } from "../../catalogItem/types.js";
import { TestIntlProvider } from "../../localization/TestIntlProvider.js";
import { TestPermissionsProvider } from "../../permission/TestPermissionsProvider.js";
import { ParameterEditDialog } from "../ParameterEditDialog.js";
import { ParameterMutationProvider } from "../ParameterMutationContext.js";
import type { IParameterMutationPort } from "../parameterMutationPort.js";

import { createTestParameterMutationPort } from "./parameterMutationPort.test.utils.js";

// Mock YamlEditor (CodeMirror doesn't work in happy-dom)
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

const updatedItem: ICatalogItemParameter = {
    ...parameterItem,
    description: "Updated",
};

function createWrapper(port: IParameterMutationPort) {
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <TestIntlProvider>
                <ToastsCenterContextProvider>
                    <TestPermissionsProvider>
                        <ParameterMutationProvider port={port}>{children}</ParameterMutationProvider>
                    </TestPermissionsProvider>
                </ToastsCenterContextProvider>
            </TestIntlProvider>
        );
    }
    return Wrapper;
}

describe("ParameterEditDialog", () => {
    let port: IParameterMutationPort;

    beforeEach(() => {
        port = createTestParameterMutationPort({
            update: vi.fn().mockResolvedValue(updatedItem),
        });
    });

    it("passes the current parameter to onDuplicate without calling port.update", async () => {
        const onDuplicate = vi.fn();

        render(
            <ParameterEditDialog
                item={parameterItem}
                onClose={vi.fn()}
                onSaved={vi.fn()}
                onDuplicate={onDuplicate}
            />,
            { wrapper: createWrapper(port) },
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
        expect(port.update).not.toHaveBeenCalled();
    });

    it("calls port.update with the edited definition and invokes onSaved with the result", async () => {
        const onSaved = vi.fn();
        const onClose = vi.fn();

        render(<ParameterEditDialog item={parameterItem} onClose={onClose} onSaved={onSaved} />, {
            wrapper: createWrapper(port),
        });

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
            expect(port.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    identifier: "param.id",
                    description: "Updated",
                    tags: [],
                    title: "My Param",
                    definition: { type: "NUMBER", defaultValue: 10 },
                }),
            );
        });

        expect(onSaved).toHaveBeenCalledWith(updatedItem);
        expect(onClose).toHaveBeenCalled();
    });
});
