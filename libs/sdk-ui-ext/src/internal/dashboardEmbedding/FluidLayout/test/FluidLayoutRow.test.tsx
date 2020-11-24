// (C) 2019-2020 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { FluidLayoutRow } from "../FluidLayoutRow";
import { FluidLayoutColumn } from "../FluidLayoutColumn";
import { FluidLayoutRowRenderer } from "../FluidLayoutRowRenderer";
import {
    createArrayWithSize,
    createLayoutRowWithNColumns,
    layoutRowWithOneColumn,
    TextLayoutRowRenderer,
} from "./fixtures";

const CustomRowRenderer: TextLayoutRowRenderer = ({ children }) => <div>{children}</div>;

describe("FluidLayoutRow", () => {
    it.each(createArrayWithSize(5).map((_, i) => i))("should render %s columns", (size: number) => {
        const wrapper = shallow(
            <FluidLayoutRow row={createLayoutRowWithNColumns(size)} rowIndex={0} screen="xl" />,
        );
        expect(wrapper.find(FluidLayoutColumn)).toHaveLength(size);
    });

    it("should use default row renderer, when rowRenderer prop is not provided", () => {
        const wrapper = shallow(<FluidLayoutRow row={layoutRowWithOneColumn} rowIndex={0} screen="xl" />);
        expect(wrapper.find(FluidLayoutRowRenderer)).toHaveLength(1);
    });

    it("should use provided row renderer, when rowRenderer prop is provided", () => {
        const wrapper = shallow(
            <FluidLayoutRow
                row={layoutRowWithOneColumn}
                rowIndex={0}
                screen="xl"
                rowRenderer={CustomRowRenderer}
            />,
        );

        expect(wrapper.find(CustomRowRenderer)).toHaveLength(1);
    });
});
