// (C) 2007-2023 GoodData Corporation
import React, { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DialogBase } from "../DialogBase";
import { Input } from "../../Form/Input";
import { IDialogBaseProps } from "../typings";

function renderDialog(options: Partial<IDialogBaseProps>, children?: ReactNode) {
    return render(<DialogBase {...options}>{children ?? "Dialog content"}</DialogBase>);
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
            const onSubmit = jest.fn();
            renderDialog({
                onSubmit,
            });

            fireEvent.keyDown(screen.getByText("Dialog content"), {
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
                const onSubmit = jest.fn();
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
            const onCancel = jest.fn();
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
