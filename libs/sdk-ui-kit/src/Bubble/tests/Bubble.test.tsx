// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { Bubble, X_SHIFT, Y_SHIFT, IBubbleProps } from "../Bubble";

function renderBubble(options: Partial<IBubbleProps>) {
    return mount<IBubbleProps>(<Bubble {...options}>lorem ipsum</Bubble>);
}

describe("Bubble", () => {
    describe("render", () => {
        it("should have correct default align points", () => {
            const wrapper = renderBubble({});
            expect(wrapper.state().alignPoints[0].align).toEqual("bl tl");
        });

        it("should add offset to align points", () => {
            const wrapper = renderBubble({});

            const { offset } = wrapper.state().alignPoints[0];

            // Responds to default "bl tl"
            expect(offset.x).toBe(-Y_SHIFT);
            expect(offset.y).toBe(X_SHIFT);
        });
    });

    describe("css classes", () => {
        it("should have given className", () => {
            const customClass = "bubble-primary";
            const wrapper = renderBubble({
                className: customClass,
            });

            const cssClasses = wrapper.props().className.split(" ");
            expect(cssClasses).toContain(customClass);
        });

        it("should have correct arrow classes for align points", () => {
            const wrapper = renderBubble({});
            const instance: any = wrapper.instance();
            const cssClassesTl = instance.getArrowsClassname("bl tl").split(" ");
            expect(cssClassesTl).toContain("arrow-top-direction");
            expect(cssClassesTl).toContain("arrow-tl");

            const cssClassesCc = instance.getArrowsClassname("cc cc").split(" ");
            expect(cssClassesCc).toContain("arrow-none-direction");
            expect(cssClassesCc).toContain("arrow-cc");

            const cssClassesBc = instance.getArrowsClassname("tc bc").split(" ");
            expect(cssClassesBc).toContain("arrow-bottom-direction");
            expect(cssClassesBc).toContain("arrow-bc");
        });
    });
});
