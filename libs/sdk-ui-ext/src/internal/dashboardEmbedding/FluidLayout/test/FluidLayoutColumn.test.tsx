// (C) 2019-2020 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { FluidLayoutColumn } from "../FluidLayoutColumn";
import { FluidLayoutColumnRenderer } from "../FluidLayoutColumnRenderer";
import {
    layoutColumn,
    layoutRowWithOneColumn,
    TextLayoutColumnRenderer,
    TextLayoutContentRenderer,
} from "./fixtures";

const CustomColumnRenderer: TextLayoutColumnRenderer = ({ children }) => <div>{children}</div>;
const CustomContentRenderer: TextLayoutContentRenderer = ({ column }) => <div>{column.content}</div>;

describe("FluidLayoutColumn", () => {
    it("should render default column renderer, when columnRenderer prop is not provided", () => {
        const wrapper = shallow(
            <FluidLayoutColumn
                row={layoutRowWithOneColumn}
                rowIndex={0}
                screen="xl"
                column={layoutColumn}
                columnIndex={1}
                contentRenderer={CustomContentRenderer}
            />,
        );
        expect(wrapper.find(FluidLayoutColumnRenderer)).toHaveLength(1);
    });

    it("should render provided column renderer, when columnRenderer prop is provided", () => {
        const wrapper = shallow(
            <FluidLayoutColumn
                row={layoutRowWithOneColumn}
                rowIndex={0}
                screen="xl"
                column={layoutColumn}
                columnRenderer={CustomColumnRenderer}
                columnIndex={1}
                contentRenderer={CustomContentRenderer}
            />,
        );

        expect(wrapper.find(CustomColumnRenderer)).toHaveLength(1);
    });

    it("should render provided content renderer", () => {
        const wrapper = shallow(
            <FluidLayoutColumn
                row={layoutRowWithOneColumn}
                rowIndex={0}
                screen="xl"
                column={layoutColumn}
                contentRenderer={CustomContentRenderer}
                columnIndex={1}
            />,
        );

        expect(wrapper.find(CustomContentRenderer)).toHaveLength(1);
    });
});
