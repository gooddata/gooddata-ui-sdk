// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";

import { BubbleHoverTrigger, SHOW_DELAY, HIDE_DELAY, IBubbleHoverTriggerProps } from "../BubbleHoverTrigger";
import { BubbleFocusTrigger, BubbleFocusTriggerProps } from "../BubbleFocusTrigger";
import { Bubble } from "../Bubble";

function renderBubble() {
    return <Bubble>lorem ipsum</Bubble>;
}

function renderBubbleHoverTrigger(options: Partial<IBubbleHoverTriggerProps>) {
    return mount(
        <BubbleHoverTrigger {...options}>
            <div />
            {renderBubble()}
        </BubbleHoverTrigger>,
    );
}

function renderBubbleFocusTrigger(options: Partial<BubbleFocusTriggerProps>) {
    return mount(
        <BubbleFocusTrigger {...options}>
            <div />
            {renderBubble()}
        </BubbleFocusTrigger>,
    );
}

describe("BubbleTrigger", () => {
    describe("render", () => {
        it("should not render the bubble when not triggered", () => {
            const wrapper = renderBubbleHoverTrigger({});
            expect(wrapper.find(Bubble).length).toEqual(0);
        });

        it("should render the bubble when triggered", () => {
            const wrapper = renderBubbleHoverTrigger({});

            wrapper.setState({ isBubbleVisible: true });

            expect(wrapper.find(Bubble).length).toEqual(1);
        });

        it("should render as span", () => {
            const wrapper = renderBubbleHoverTrigger({});

            expect(wrapper.find("span.gd-bubble-trigger")).toHaveLength(1);
        });

        it("should be possible to render as div", () => {
            const wrapper = renderBubbleHoverTrigger({
                tagName: "div",
            });

            expect(wrapper.find("div.gd-bubble-trigger")).toHaveLength(1);
        });
    });

    describe("hover events", () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.clearAllTimers();
        });

        it("should show bubble on enter", () => {
            const wrapper = renderBubbleHoverTrigger({});
            const instance: any = wrapper.instance();

            instance.scheduleBubbleVisibilityChange = jest.fn();
            instance.eventListeners().onMouseEnter();
            expect(instance.scheduleBubbleVisibilityChange).toHaveBeenCalledWith(true, SHOW_DELAY);
        });

        it("should hide bubble on leave", () => {
            const wrapper = renderBubbleHoverTrigger({});
            const instance: any = wrapper.instance();

            instance.scheduleBubbleVisibilityChange = jest.fn();
            instance.eventListeners().onMouseLeave();
            expect(instance.scheduleBubbleVisibilityChange).toHaveBeenCalledWith(false, HIDE_DELAY);
        });

        it("should hide bubble on mouse enter after set delay", () => {
            const hoverHideDelay = 1;
            const wrapper = renderBubbleHoverTrigger({ hoverHideDelay });
            const instance: any = wrapper.instance();

            jest.spyOn(instance, "scheduleBubbleVisibilityChange");
            instance.eventListeners().onMouseEnter();

            expect(instance.scheduleBubbleVisibilityChange.mock.calls[0]).toEqual([true, SHOW_DELAY]);
            jest.advanceTimersByTime(SHOW_DELAY + 10);
            expect(instance.scheduleBubbleVisibilityChange.mock.calls[1]).toEqual([false, hoverHideDelay]);
        });

        it("should not hide bubble on mouse enter after delay by default", () => {
            const wrapper = renderBubbleHoverTrigger({});
            const instance: any = wrapper.instance();

            jest.spyOn(instance, "scheduleBubbleVisibilityChange");
            instance.eventListeners().onMouseEnter();

            jest.advanceTimersByTime(5000);
            expect(instance.scheduleBubbleVisibilityChange).toHaveBeenCalledWith(true, SHOW_DELAY);
            expect(instance.scheduleBubbleVisibilityChange).toHaveBeenCalledTimes(1);
        });

        it("should schedule visibility change", () => {
            const wrapper = renderBubbleHoverTrigger({});
            const instance: any = wrapper.instance();

            instance.changeBubbleVisibility = jest.fn();
            instance.cancelBubbleVisibilityChange = jest.fn();

            instance.scheduleBubbleVisibilityChange(true);

            jest.advanceTimersByTime(1000);
            expect(instance.changeBubbleVisibility).toHaveBeenCalledWith(true);
            expect(instance.cancelBubbleVisibilityChange).toHaveBeenCalledTimes(1);
        });
    });

    describe("focus events", () => {
        it("should show bubble on focus", () => {
            const wrapper = renderBubbleFocusTrigger({});
            const instance: any = wrapper.instance();

            instance.changeBubbleVisibility = jest.fn();
            instance.eventListeners().onFocus();
            expect(instance.changeBubbleVisibility).toHaveBeenCalledWith(true);
        });

        it("should hide bubble on leave", () => {
            const wrapper = renderBubbleFocusTrigger({});
            const instance: any = wrapper.instance();

            instance.changeBubbleVisibility = jest.fn();
            instance.eventListeners().onBlur();
            expect(instance.changeBubbleVisibility).toHaveBeenCalledWith(false);
        });

        it("should hide bubble onClose", () => {
            const wrapper = renderBubbleFocusTrigger({});
            const instance: any = wrapper.instance();

            instance.changeBubbleVisibility = jest.fn();
            instance.onClose();
            expect(instance.changeBubbleVisibility).toHaveBeenCalledWith(false);
        });
    });

    it("should propagate data attributes", () => {
        const wrapper = renderBubbleHoverTrigger({
            // @ts-expect-error data attributes are allowed in JSX but not directly in props type
            "data-attribute": "test",
        });

        const props = wrapper.props();
        expect(props["data-attribute"]).toBe("test");
    });
});
