// (C) 2019-2022 GoodData Corporation
import React from "react";
import { mount } from "enzyme";

import { ResizeOverlayProps, ResizeOverlay } from "../ResizeOverlay";
import { IntlWrapper } from "../../../localization";

const defaultProps: ResizeOverlayProps = {
    isResizingColumnOrRow: false,
    isActive: false,
    reachedWidthLimit: "none",
    reachedHeightLimit: "none",
};

function createComponent(customProps: Partial<ResizeOverlayProps> = {}) {
    const props = { ...defaultProps, ...customProps };
    return mount(
        <IntlWrapper>
            <ResizeOverlay {...props} />
        </IntlWrapper>,
    );
}

describe("ResizeOverlay", () => {
    it("should render nothing when not isResizingColumnOrRow", () => {
        const wrapper = createComponent();
        const overlay = wrapper.find(".gd-resize-overlay");
        expect(overlay).not.toExist();
    });

    it("should render overlay when isResizingColumn ", () => {
        const wrapper = createComponent({ isResizingColumnOrRow: true });
        const overlay = wrapper.find(".gd-resize-overlay");
        expect(overlay).toExist();
    });

    it("should render overlay with active style when isResizingColumnOrRow and isActive", () => {
        const wrapper = createComponent({ isResizingColumnOrRow: true, isActive: true });
        const overlay = wrapper.find(".gd-resize-overlay.active");
        expect(overlay).toExist();
    });

    it("should render overlay in error style when isResizingColumnOrRow and isActive and isUnderMinLimit", () => {
        const wrapper = createComponent({
            isResizingColumnOrRow: true,
            isActive: true,
            reachedWidthLimit: "min",
        });
        const overlay = wrapper.find(".gd-resize-overlay.error");
        expect(overlay).toExist();
    });

    it("should render overlay with width min error description when in error state", () => {
        const wrapper = createComponent({
            isResizingColumnOrRow: true,
            isActive: true,
            reachedWidthLimit: "min",
        });
        const message = wrapper.find(".gd-resize-overlay-text");
        expect(message).toExist();
        expect(message.text()).toBe("Widget is at the minimal width");
    });

    it("should render overlay with width max error description when in error state", () => {
        const wrapper = createComponent({
            isResizingColumnOrRow: true,
            isActive: true,
            reachedWidthLimit: "max",
        });
        const message = wrapper.find(".gd-resize-overlay-text");
        expect(message).toExist();
        expect(message.text()).toBe("Widget is at the maximal width");
    });

    it("should render overlay with height error description when in error state", () => {
        const wrapper = createComponent({
            isResizingColumnOrRow: true,
            isActive: true,
            reachedHeightLimit: "max",
        });
        const message = wrapper.find(".gd-resize-overlay-text");
        expect(message).toExist();
        expect(message.text()).toBe("Widget is at the maximal height");
    });
});
