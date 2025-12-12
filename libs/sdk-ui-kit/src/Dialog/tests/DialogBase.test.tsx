// (C) 2007-2025 GoodData Corporation

import { type ReactNode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Input } from "../../Form/Input.js";
import { DialogBase } from "../DialogBase.js";
import { CONFIRM_DIALOG_BASE_ID } from "../elementId.js";
import { type IDialogBaseProps } from "../typings.js";

function renderDialog(options: Partial<IDialogBaseProps>, children?: ReactNode) {
    return render(
        <DialogBase {...options} accessibilityConfig={{ titleElementId: "title" }}>
            <h2 id={"title"}>Accessible title</h2>
            {children ?? "Dialog content"}
        </DialogBase>,
    );
}

describe("Dialog", () => {
    describe("close button", () => {
        it("should not be rendered by default", () => {
            renderDialog({});
            expect(screen.queryByRole("button")).not.toBeInTheDocument();
        });

        it("should be rendered when receiving `displayCloseButton` flag", () => {
            renderDialog({
                displayCloseButton: true,
            });

            expect(screen.getByRole("button")).toBeInTheDocument();
        });
    });

    describe("submit", () => {
        it("should call `onSubmit` when enter is pressed", () => {
            const onSubmit = vi.fn();
            renderDialog(
                {
                    onSubmit,
                },
                <button id={CONFIRM_DIALOG_BASE_ID} data-testid={CONFIRM_DIALOG_BASE_ID} />,
            );

            fireEvent.keyDown(screen.getByTestId(CONFIRM_DIALOG_BASE_ID), {
                key: "Enter",
                keyCode: 13,
                which: 13,
            });

            expect(onSubmit).toHaveBeenCalledTimes(1);
        });

        it.each([
            ["call", true, 1],
            ["not call", false, 0],
        ])(
            'should %s "onSubmit" when submitOnEnterKey is %s',
            (_actionText, submitOnEnterKey, expectedCalledTimes) => {
                const onSubmit = vi.fn();
                renderDialog(
                    {
                        submitOnEnterKey,
                        onSubmit,
                    },
                    <Input key="A123" placeholder="input text" />,
                );

                fireEvent.keyDown(screen.getByPlaceholderText("input text"), {
                    key: "Enter",
                    keyCode: 13,
                    which: 13,
                });

                expect(onSubmit).toHaveBeenCalledTimes(expectedCalledTimes);
            },
        );
    });

    describe("cancel", () => {
        it("should call `onCancel` when escape is pressed", () => {
            const onCancel = vi.fn();
            renderDialog({
                onCancel,
            });

            fireEvent.keyDown(screen.getByText("Dialog content"), {
                key: "Escape",
                keyCode: 27,
                which: 27,
            });

            expect(onCancel).toHaveBeenCalledTimes(1);
        });
    });
});
