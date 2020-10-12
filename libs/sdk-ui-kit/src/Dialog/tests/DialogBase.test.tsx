// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { DialogBase } from "../DialogBase";
import { Input } from "../../Form/Input";

function renderDialog(options: any, children?: any) {
    return mount(<DialogBase {...options}>{children}</DialogBase>);
}

describe("Dialog", () => {
    describe("close button", () => {
        it("should not be rendered by default", () => {
            const wrapper = renderDialog({});
            expect(wrapper.find(".gd-dialog-close")).toHaveLength(0);
        });

        it("should be rendered when receiving `displayCloseButton` flag", () => {
            const wrapper = renderDialog({
                displayCloseButton: true,
            });

            expect(wrapper.find(".gd-dialog-close")).toHaveLength(1);
        });
    });

    describe("submit", () => {
        it("should call `onSubmit` when enter is pressed", () => {
            const onSubmit = jest.fn();

            const wrapper = renderDialog({
                onSubmit,
            });

            wrapper.simulate("keyDown", {
                key: "Enter",
                keyCode: 13,
                target: {
                    tagName: "div",
                },
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

                const wrapper = renderDialog(
                    {
                        submitOnEnterKey,
                        onSubmit,
                    },
                    [<Input key="A123" />],
                );

                wrapper.find(".gd-input-field").simulate("keyDown", {
                    key: "Enter",
                    keyCode: 13,
                    target: {
                        tagName: "input",
                        type: "text",
                    },
                });

                expect(onSubmit).toHaveBeenCalledTimes(expectedCalledTimes);
            },
        );
    });

    describe("cancel", () => {
        it("should call `onCancel` when escape is pressed", () => {
            const onCancel = jest.fn();

            const wrapper = renderDialog({
                onCancel,
            });

            wrapper.simulate("keyDown", {
                key: "Escape",
                keyCode: 27,
                target: {
                    tagName: "div",
                },
            });

            expect(onCancel).toHaveBeenCalledTimes(1);
        });
    });
});
