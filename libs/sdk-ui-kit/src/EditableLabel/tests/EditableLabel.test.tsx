// (C) 2007-2025 GoodData Corporation
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { EditableLabel } from "../EditableLabel.js";
import userEvent from "@testing-library/user-event";
import { IEditableLabelProps } from "../typings.js";
import { describe, it, expect, vi, Mock } from "vitest";

function renderEditableLabel(options: IEditableLabelProps) {
    return render(<EditableLabel {...options} />);
}

const clickToEnableEditing = async () => {
    await userEvent.click(screen.getByTestId("editable-label"));
};

describe("EditableLabel", () => {
    describe("lifecycle", () => {
        it("should render in overlay", async () => {
            renderEditableLabel({
                value: "",
                textareaInOverlay: true,
                onSubmit: vi.fn(),
            });

            expect(screen.queryByTestId("textarea-wrapper")).not.toBeInTheDocument();
            await clickToEnableEditing();
            expect(await screen.findByTestId("textarea-wrapper")).toBeInTheDocument();
        });

        it("should have editing class", async () => {
            const { unmount } = renderEditableLabel({
                value: "",
                onSubmit: vi.fn(),
            });

            await clickToEnableEditing();
            await waitFor(() => {
                expect(screen.getByTestId("editable-label")).toHaveClass("is-editing");
            });
            unmount();
        });

        it("should be one row high", async () => {
            renderEditableLabel({
                value: "",
                onSubmit: vi.fn(),
            });

            await clickToEnableEditing();
            await waitFor(() => {
                expect(screen.getByRole("textbox")).toHaveAttribute("rows", "1");
            });
        });

        it("should not let user enter characters above the limit", async () => {
            renderEditableLabel({
                value: "",
                maxLength: 10,
                onSubmit: vi.fn(),
            });

            await clickToEnableEditing();
            await waitFor(() => {
                expect(screen.getByRole("textbox")).toHaveAttribute("maxLength", "10");
            });
        });

        it("should change value when received", async () => {
            renderEditableLabel({
                value: "aaa",
                onSubmit: vi.fn(),
            });

            await clickToEnableEditing();
            await waitFor(() => {
                expect(screen.getByRole("textbox")).toHaveTextContent("aaa");
            });
        });
    });

    describe("saving and canceling and change value", () => {
        const renderEditableLabelAndClickIn = async ({
            onCancel = vi.fn(),
            onSubmit = vi.fn(),
            onChange = vi.fn(),
        }: {
            onCancel?: Mock;
            onSubmit?: Mock;
            onChange?: Mock;
        }) => {
            renderEditableLabel({
                value: "aaa",
                onCancel,
                onSubmit,
                onChange,
            });

            await clickToEnableEditing();
        };

        it("should not call onSubmit callback after user leaves the input without changes", async () => {
            const onSubmit = vi.fn();
            await renderEditableLabelAndClickIn({ onSubmit });

            fireEvent.blur(screen.getByRole("textbox"));

            expect(onSubmit).not.toHaveBeenCalled();
            expect(screen.queryByTestId("editable-label")).not.toHaveClass("is-editing");
        });

        it("should call onSubmit when user press the enter key", async () => {
            const onSubmit = vi.fn();
            const value = "This is new text";
            await renderEditableLabelAndClickIn({ onSubmit });

            const textbox = screen.getByRole("textbox");
            await userEvent.clear(textbox);
            textbox.focus();

            await userEvent.paste(value);
            await userEvent.click(document.body);
            await waitFor(() => {
                // screen.debug();
                expect(onSubmit).toHaveBeenCalledTimes(1); // clear and paste
                expect(onSubmit).toHaveBeenCalledWith(value);
                expect(screen.queryByTestId("editable-label")).not.toHaveClass("is-editing");
            });
        });

        it("should call onCancel callback and discard temporary value when user press the escape key", async () => {
            const onCancel = vi.fn();
            await renderEditableLabelAndClickIn({ onCancel });

            fireEvent.keyDown(screen.getByRole("textbox"), {
                key: "Escape",
                keyCode: 27,
                which: 27,
            });

            await waitFor(() => {
                expect(onCancel).toHaveBeenCalledTimes(1);
                expect(onCancel).toHaveBeenCalledWith("aaa");
                expect(screen.queryByTestId("editable-label")).not.toHaveClass("is-editing");
            });
        });

        it("should trim value when user enters only spaces", async () => {
            const onSubmit = vi.fn();
            await renderEditableLabelAndClickIn({ onSubmit });

            await userEvent.clear(screen.getByRole("textbox"));
            await userEvent.paste("    ");
            fireEvent.keyDown(screen.getByRole("textbox"), {
                key: "Enter",
                keyCode: 13,
                which: 13,
            });

            expect(onSubmit).toHaveBeenCalledTimes(1);
            expect(onSubmit).toHaveBeenCalledWith("");
            expect(screen.queryByTestId("editable-label")).not.toHaveClass("is-editing");
        });

        it("should call onChange when user change value", async () => {
            const onChange = vi.fn();
            const value = "This is new text";
            await renderEditableLabelAndClickIn({ onChange });

            await userEvent.clear(screen.getByRole("textbox"));
            await userEvent.paste(value);
            expect(onChange).toHaveBeenCalledTimes(2); //clear & paste
            expect(onChange).toHaveBeenCalledWith(expect.stringContaining(value));
        });
    });
});
