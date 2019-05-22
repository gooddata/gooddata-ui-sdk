// (C) 2019 GoodData Corporation
import { cloneDeep } from "lodash";
import { mount } from "enzyme";
import { IntlWrapper } from "../../../../../utils/intlProvider";
import * as React from "react";
import ColoredItemContent, { IColoredItemContentProps } from "../ColoredItemContent";

const defaultProps: IColoredItemContentProps = {
    color: { r: 0, g: 0, b: 0 },
    text: "text",
};

function createComponent(customProps: Partial<IColoredItemContentProps> = {}) {
    const props: IColoredItemContentProps = { ...cloneDeep(defaultProps), ...customProps };
    return mount<IColoredItemContentProps>(
        <IntlWrapper locale="en-US">
            <ColoredItemContent {...props} />
        </IntlWrapper>,
    );
}

describe("ColoredItemContent", () => {
    it("should set s-color class with the current RGB color", () => {
        const wrapper = createComponent({ color: { r: 1, g: 2, b: 3 } });
        expect(
            wrapper
                .find(ColoredItemContent)
                .find(".s-color-1-2-3")
                .exists(),
        ).toBe(true);
    });
});
