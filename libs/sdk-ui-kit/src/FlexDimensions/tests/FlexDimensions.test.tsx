// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount, ReactWrapper } from "enzyme";

import { FlexDimensions } from "../FlexDimensions";
import { IFlexDimensionsProps, IFlexDimensionsState } from "../typings";

describe("FlexDimensions", () => {
    it("should not throttle (external) updateSize method", () => {
        const wrapper: ReactWrapper<IFlexDimensionsProps, IFlexDimensionsState, FlexDimensions> = mount(
            <FlexDimensions>
                <div />
            </FlexDimensions>,
        );
        const component = wrapper.instance();
        const updateSizeSpy = jest.spyOn(component, "setState");

        component.updateSize();
        component.updateSize();

        expect(updateSizeSpy).toHaveBeenCalledTimes(2);
        updateSizeSpy.mockReset();
        updateSizeSpy.mockRestore();
    });
});
