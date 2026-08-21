// (C) 2020-2026 GoodData Corporation

import { type EditorView } from "@codemirror/view";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type ISyntaxHighlightingInputProps, SyntaxHighlightingInput } from "../SyntaxHighlightingInput.js";

const multiLineValue = "01234\n01234\n01234";

/** The text on screen, rebuilt from CodeMirror's rendered lines. */
function displayedText() {
    return Array.from(document.querySelectorAll(".cm-line"))
        .map((line) => line.textContent)
        .join("\n");
}

/**
 * Renders the real editor and hands back its CodeMirror view, which is how edits and cursor moves are
 * driven here: there is no typing into a contenteditable in this environment, and what these tests
 * are about is the component's own reporting of a change once CodeMirror has made one. Stubbing the
 * editor out instead — as this file used to — left the assertions describing the stub, and replaced a
 * module the other suites in this worker render for real.
 */
function renderComponent(props?: Partial<ISyntaxHighlightingInputProps>) {
    const captured: { view: EditorView | null } = { view: null };
    const onChange = vi.fn();
    const result = render(
        <SyntaxHighlightingInput
            value=""
            onChange={onChange}
            onApi={(view) => {
                captured.view = view;
            }}
            {...props}
        />,
    );

    return { ...result, onChange, view: captured.view! };
}

describe("SyntaxHighlightingInput", () => {
    it("should render a CodeMirror editor, named for screen readers", () => {
        renderComponent({ label: "Definition" });

        expect(document.querySelector(".cm-editor")).toBeInTheDocument();
        expect(screen.getByRole("textbox", { name: "Definition" })).toBeInTheDocument();
    });

    it("should render correct value and classname", () => {
        renderComponent({ value: "this is a text content", className: "this-is-a-classname" });

        expect(displayedText()).toBe("this is a text content");
        expect(
            document.querySelector("div.this-is-a-classname.gd-input-syntax-highlighting-input"),
        ).toBeInTheDocument();
    });

    it("should call onChangeHandler function on value change", () => {
        const { onChange, view } = renderComponent({ value: "01234" });

        view.dispatch({ changes: { from: 0, to: 0, insert: "new text content" } });

        expect(onChange).toHaveBeenCalledWith("new text content01234");
    });

    it("should not report the controlled value being replaced from outside as a change", () => {
        // The value sync is annotated `Transaction.remote` precisely so it does not come back out as
        // an edit — without that, a consumer would be handed its own value again on every render.
        const onChange = vi.fn();
        const { rerender } = render(<SyntaxHighlightingInput value="01234" onChange={onChange} />);

        rerender(<SyntaxHighlightingInput value="56789" onChange={onChange} />);

        expect(displayedText()).toBe("56789");
        expect(onChange).not.toHaveBeenCalled();
    });

    describe("onCursor", () => {
        it("should call onCursor function with expected parameters on cursor position change", () => {
            const onCursor = vi.fn();
            const { view } = renderComponent({ value: multiLineValue, onCursor });

            view.dispatch({ selection: { anchor: 8 } });

            expect(onCursor).toHaveBeenCalledWith(8, 8);
        });

        it("should report both ends of a selected range", () => {
            const onCursor = vi.fn();
            const { view } = renderComponent({ value: multiLineValue, onCursor });

            view.dispatch({ selection: { anchor: 6, head: 11 } });

            expect(onCursor).toHaveBeenCalledWith(6, 11);
        });
    });
});
