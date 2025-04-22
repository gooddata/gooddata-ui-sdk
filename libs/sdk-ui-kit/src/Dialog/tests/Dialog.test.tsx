// (C) 2007-2025 GoodData Corporation
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Dialog } from "../Dialog.js";
import { IDialogBaseProps } from "../typings.js";
import { describe, it, expect, vi } from "vitest";

function renderDialog(options: Partial<IDialogBaseProps>) {
    return render(
        <Dialog {...options} accessibilityConfig={{ titleElementId: "title" }}>
            <h2 id={"title"}>Accessible title</h2>
            DialogTest content
        </Dialog>,
    );
}

describe("Dialog", () => {
    it("should render content with provided classnames", () => {
        renderDialog({ className: "dialogTest", containerClassName: "containerTestClass" });

        expect(screen.getByText("DialogTest content")).toBeInTheDocument();
        expect(document.getElementsByClassName("gd-overlay-content")).toHaveLength(1);
        expect(document.getElementsByClassName("dialogTest")).toHaveLength(1);
        expect(document.getElementsByClassName("containerTestClass")).toHaveLength(1);
    });

    describe("should call optional callbacks", () => {
        it("onClick", () => {
            const onClick = vi.fn();
            renderDialog({ onClick });

            fireEvent.click(screen.getByText("DialogTest content"));

            expect(onClick).toHaveBeenCalled();
        });

        it("onMouseUp", () => {
            const onMouseUp = vi.fn();
            renderDialog({ onMouseUp });

            fireEvent.mouseUp(screen.getByText("DialogTest content"));

            expect(onMouseUp).toHaveBeenCalled();
        });

        it("onMouseOver", () => {
            const onMouseOver = vi.fn();
            renderDialog({ onMouseOver });

            fireEvent.mouseOver(screen.getByText("DialogTest content"));

            expect(onMouseOver).toHaveBeenCalled();
        });
    });
});
