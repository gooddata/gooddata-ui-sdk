// (C) 2007-2025 GoodData Corporation
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextAreaWithSubmit } from "../TextAreaWithSubmit.js";
import { ITextAreaWithSubmitProps } from "../typings.js";
import { describe, it, expect, vi, Mock } from "vitest";

function renderTextAreaWithSubmit(options: ITextAreaWithSubmitProps) {
    return render(<TextAreaWithSubmit {...options} />);
}

const clickToEnableEditing = async () => {
    await userEvent.click(screen.getByRole("editable-label"));
};

describe("TextAreaWithSubmit", () => {
    describe("lifecycle", () => {
        it("should not let user enter characters above the limit", async () => {
            renderTextAreaWithSubmit({
                defaultValue: "",
                maxLength: 10,
                onSubmit: vi.fn(),
            });

            await clickToEnableEditing();
            await waitFor(() => {
                expect(screen.getByRole("textbox")).toHaveAttribute("maxLength", "10");
            });
        });

        it("should change defaultValue when received", async () => {
            renderTextAreaWithSubmit({
                defaultValue: "aaa",
                onSubmit: vi.fn(),
            });

            await clickToEnableEditing();
            await waitFor(() => {
                expect(screen.getByRole("textbox")).toHaveTextContent("aaa");
            });
        });
    });

    describe("saving and canceling and change defaultValue", () => {
        const renderTextAreaWithSubmitAndClickIn = async ({
            onCancel = vi.fn(),
            onSubmit = vi.fn(),
            onChange = vi.fn(),
        }: {
            onCancel?: Mock;
            onSubmit?: Mock;
            onChange?: Mock;
        }) => {
            renderTextAreaWithSubmit({
                defaultValue: "aaa",
                onCancel,
                onSubmit,
                onChange,
            });

            await clickToEnableEditing();
        };

        it("should not call onSubmit callback after user leaves the input without changes", async () => {
            const onSubmit = vi.fn();
            await renderTextAreaWithSubmitAndClickIn({ onSubmit });

            fireEvent.blur(screen.getByRole("textbox"));

            expect(onSubmit).not.toHaveBeenCalled();
        });

        it("should call onSubmit when user press the enter key", async () => {
            const onSubmit = vi.fn();
            const defaultValue = "This is new text";
            await renderTextAreaWithSubmitAndClickIn({ onSubmit });

            await userEvent.clear(screen.getByRole("textbox"));
            await userEvent.paste(defaultValue);
            await userEvent.click(document.body);
            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledTimes(1); // clear and paste
                expect(onSubmit).toHaveBeenCalledWith(defaultValue);
            });
        });

        it("should call onCancel callback and discard temporary defaultValue when user press the escape key", async () => {
            const onCancel = vi.fn();
            await renderTextAreaWithSubmitAndClickIn({ onCancel });

            fireEvent.keyDown(screen.getByRole("textbox"), {
                key: "Escape",
                keyCode: 27,
                which: 27,
            });

            await waitFor(() => {
                expect(onCancel).toHaveBeenCalledTimes(1);
                expect(onCancel).toHaveBeenCalledWith("aaa");
            });
        });

        it("should trim defaultValue when user enters only spaces", async () => {
            const onSubmit = vi.fn();
            await renderTextAreaWithSubmitAndClickIn({ onSubmit });

            await userEvent.clear(screen.getByRole("textbox"));
            await userEvent.paste("    ");
            fireEvent.keyDown(screen.getByRole("textbox"), {
                key: "Enter",
                keyCode: 13,
                which: 13,
            });

            expect(onSubmit).toHaveBeenCalledTimes(1);
            expect(onSubmit).toHaveBeenCalledWith("");
        });

        it("should call onChange when user change defaultValue", async () => {
            const onChange = vi.fn();
            const defaultValue = "This is new text";
            await renderTextAreaWithSubmitAndClickIn({ onChange });

            await userEvent.clear(screen.getByRole("textbox"));
            await userEvent.paste(defaultValue);
            expect(onChange).toHaveBeenCalledTimes(2); //clear & paste
            expect(onChange).toHaveBeenCalledWith(expect.stringContaining(defaultValue));
        });
    });
});
