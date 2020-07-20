// (C) 2019 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import { mount } from "enzyme";
import { InternalIntlWrapper } from "../../../../../utils/internalIntlProvider";
import React from "react";
import ColoredItemContent, { IColoredItemContentProps } from "../ColoredItemContent";

const defaultProps: IColoredItemContentProps = {
    color: { r: 0, g: 0, b: 0 },
    text: "text",
};

function createComponent(customProps: Partial<IColoredItemContentProps> = {}) {
    const props: IColoredItemContentProps = { ...cloneDeep(defaultProps), ...customProps };
    return mount<IColoredItemContentProps>(
        <InternalIntlWrapper>
            <ColoredItemContent {...props} />
        </InternalIntlWrapper>,
    );
}

describe("ColoredItemContent", () => {
    it("should set s-color class with the current RGB color", () => {
        const wrapper = createComponent({ color: { r: 1, g: 2, b: 3 } });
        expect(wrapper.find(ColoredItemContent).find(".s-color-1-2-3").exists()).toBe(true);
    });
});
