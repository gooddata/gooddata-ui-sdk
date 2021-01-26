// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { ShortenedText, getShortenedTitle, IShortenedTextProps } from "../ShortenedText";
import { BubbleHoverTrigger } from "../../Bubble/BubbleHoverTrigger";

describe("ShortenedText", () => {
    const renderShortenedText = (props: IShortenedTextProps) => {
        return mount(<ShortenedText {...props} />);
    };

    function createElement(
        width: number,
        scrollWidth: number,
    ): Pick<HTMLElement, "scrollWidth" | "getBoundingClientRect"> {
        return {
            scrollWidth,
            getBoundingClientRect: () => ({
                width,
                bottom: 0,
                height: 0,
                left: 0,
                right: 0,
                toJSON: () => null,
                top: 0,
                x: 0,
                y: 0,
            }),
        };
    }

    describe("ShortenedText", () => {
        const shortText = "t";
        const longText = "this is a very very long text for testing purposes";

        it("should render shortened text with default tagName SPAN", () => {
            const component = renderShortenedText({
                children: shortText,
                getElement: () => createElement(100, 100),
            });

            expect(component.getDOMNode().tagName).toEqual("SPAN");
        });

        it("should render text wrapped in custom tagName", () => {
            const component = renderShortenedText({
                children: shortText,
                tagName: "div",
                getElement: () => createElement(100, 100),
            });

            expect(component.getDOMNode().tagName).toEqual("DIV");
        });

        it("should not shorten short text", () => {
            const component = renderShortenedText({
                children: shortText,
                tagName: "div",
                getElement: () => createElement(99.4, 100),
            });

            expect(component.find(".is-shortened")).toHaveLength(0);
            expect(component.text()).toEqual(shortText);
        });

        it("should add class for shortened text and contain ellipsis", () => {
            const component = renderShortenedText({
                children: longText,
                tagName: "div",
                getElement: () => createElement(100, 200),
            });

            expect(component.find(".is-shortened")).toHaveLength(1);
            expect(component.text()).toContain("…");
        });

        it("should render shorten text first and than not render shorten text after resize", () => {
            let elementWidth = 120;
            let scrollWidth = 200;

            // first render shorten text
            let component = renderShortenedText({
                children: longText,
                tagName: "div",
                getElement: () => {
                    return createElement(elementWidth, scrollWidth);
                },
            });
            expect(component.find(".is-shortened")).toHaveLength(1);
            expect(component.text()).toContain("…");

            // change size
            elementWidth = 100;
            scrollWidth = 100;

            // update child
            component = component.setProps({ children: shortText });
            component.update();

            // than render not shorten text
            expect(component.find(".is-shortened")).toHaveLength(0);
            expect(component.text()).toEqual(shortText);
        });

        it("should not render shorten text first and than render shorten text after resize", () => {
            let elementWidth = 100;
            let scrollWidth = 100;

            // first render not shorten text
            let component = renderShortenedText({
                children: shortText,
                tagName: "div",
                getElement: () => {
                    return createElement(elementWidth, scrollWidth);
                },
            });
            expect(component.find(".is-shortened")).toHaveLength(0);
            expect(component.text()).toEqual(shortText);

            // change size
            elementWidth = 120;
            scrollWidth = 200;

            // update child
            component = component.setProps({ children: longText });
            component.update();

            // than render shorten text
            expect(component.find(".is-shortened")).toHaveLength(1);
            expect(component.text()).toContain("…");
        });

        it("should render bubble if displayTooltip is true", () => {
            const component = renderShortenedText({
                children: longText,
                tagName: "div",
                getElement: () => createElement(100, 200),
                displayTooltip: true,
            });

            expect(component.find(BubbleHoverTrigger).exists()).toBe(true);
        });

        it("should not render bubble if displayTooltip is false", () => {
            const component = renderShortenedText({
                children: longText,
                tagName: "div",
                getElement: () => createElement(100, 200),
                displayTooltip: false,
            });

            expect(component.find(BubbleHoverTrigger).exists()).toBe(false);
        });
    });

    describe("getShortenedTitle", () => {
        it("should shorten original title when the text is overflowing the wrapper", () => {
            // big scroll
            expect(
                getShortenedTitle(
                    "abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba",
                    createElement(200, 600),
                ),
            ).toEqual("abcdefg…gfedcba");

            // medium scroll
            expect(
                getShortenedTitle(
                    "abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba",
                    createElement(200, 300),
                ),
            ).toEqual("abcdefghijklmn…nmlkjihgfedcba");

            // small scroll
            expect(
                getShortenedTitle(
                    "abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba",
                    createElement(200, 210),
                ),
            ).toEqual("abcdefghijklmnopqrstu…utsrqponmlkjihgfedcba");
        });

        it("should return original title when the text is not overflowing the wrapper", () => {
            // no scroll
            expect(
                getShortenedTitle(
                    "abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba",
                    createElement(200, 200),
                ),
            ).toEqual("abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba");
            expect(
                getShortenedTitle(
                    "abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba",
                    createElement(200, 10),
                ),
            ).toEqual("abcdefghijklmnopqrstuvwxyz zyxwvutsrqponmlkjihgfedcba");
        });
    });

    describe("renderTextWithBubble", () => {
        const renderShortenedTextWithBubbleHoverTrigger = (props = {}) => {
            const root = renderShortenedText({
                children: "foo",
                tagName: "div",
                getElement: () => createElement(100, 200),
                ...props,
            });

            return root.find(BubbleHoverTrigger);
        };

        it("should render BubbleHoverTrigger with eventsOnBubble set to false by default", () => {
            const bubbleHoverTrigger = renderShortenedTextWithBubbleHoverTrigger();
            expect(bubbleHoverTrigger.prop("eventsOnBubble")).toBe(false);
        });

        it("should render BubbleHoverTrigger with eventsOnBubble set to true", () => {
            const bubbleHoverTrigger = renderShortenedTextWithBubbleHoverTrigger({
                tooltipVisibleOnMouseOver: true,
            });
            expect(bubbleHoverTrigger.prop("eventsOnBubble")).toBe(true);
        });

        it("should render BubbleHoverTrigger with eventsOnBubble set to false", () => {
            const bubbleHoverTrigger = renderShortenedTextWithBubbleHoverTrigger({
                tooltipVisibleOnMouseOver: false,
            });
            expect(bubbleHoverTrigger.prop("eventsOnBubble")).toBe(false);
        });
    });
});
