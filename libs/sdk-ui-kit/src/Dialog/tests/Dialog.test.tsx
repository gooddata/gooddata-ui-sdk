// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { Dialog } from "../Dialog";
import { Overlay } from "../../Overlay";

describe("Dialog", () => {
    it("should render content", () => {
        const wrapper = mount(
            <Dialog className="dialogTest" containerClassName="containerTestClass">
                DialogTest content
            </Dialog>,
        );

        expect(wrapper.find(Overlay)).toHaveLength(1);
        expect(wrapper.find(".dialogTest").hostNodes()).toHaveLength(1);
        expect(wrapper.find(".containerTestClass").hostNodes()).toHaveLength(1);
    });

    describe("should call optional callbacks", () => {
        it("onClick", () => {
            const handler = jest.fn();
            const wrapper = mount(
                <Dialog className="dialogTest" onClick={handler}>
                    DialogTest content
                </Dialog>,
            );

            expect(wrapper.find(".dialogTest").hostNodes()).toHaveLength(1);
            wrapper.find(".dialogTest").hostNodes().simulate("click");
            expect(handler).toHaveBeenCalled();
        });

        it("onMouseUp", () => {
            const handler = jest.fn();
            const wrapper = mount(
                <Dialog className="dialogTest" onMouseUp={handler}>
                    DialogTest content
                </Dialog>,
            );

            expect(wrapper.find(".dialogTest").hostNodes()).toHaveLength(1);
            wrapper.find(".dialogTest").hostNodes().simulate("mouseup");
            expect(handler).toHaveBeenCalled();
        });

        it("onMouseOver", () => {
            const handler = jest.fn();
            const wrapper = mount(
                <Dialog className="dialogTest" onMouseOver={handler}>
                    DialogTest content
                </Dialog>,
            );

            expect(wrapper.find(".dialogTest").hostNodes()).toHaveLength(1);
            wrapper.find(".dialogTest").hostNodes().simulate("mouseover");
            expect(handler).toHaveBeenCalled();
        });
    });
});
