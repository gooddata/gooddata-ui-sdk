// (C) 2019-2020 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { FluidLayoutFacade } from "@gooddata/sdk-backend-spi";
import { FluidLayoutColumn } from "../FluidLayoutColumn";
import { FluidLayoutColumnRenderer } from "../FluidLayoutColumnRenderer";
import { fluidLayoutWithOneColumn, TextLayoutColumnRenderer, TextLayoutContentRenderer } from "./fixtures";

const CustomColumnRenderer: TextLayoutColumnRenderer = ({ children }) => <div>{children}</div>;
const CustomContentRenderer: TextLayoutContentRenderer = ({ column }) => <div>{column.content()}</div>;

const layoutFacade = FluidLayoutFacade.for(fluidLayoutWithOneColumn);

describe("FluidLayoutColumn", () => {
    it("should render default column renderer, when columnRenderer prop is not provided", () => {
        const wrapper = shallow(
            <FluidLayoutColumn
                screen="xl"
                column={layoutFacade.rows().row(0).columns().column(0)}
                contentRenderer={CustomContentRenderer}
            />,
        );
        expect(wrapper.find(FluidLayoutColumnRenderer)).toExist();
    });

    it("should render provided column renderer, when columnRenderer prop is provided", () => {
        const wrapper = shallow(
            <FluidLayoutColumn
                screen="xl"
                column={layoutFacade.rows().row(0).columns().column(0)}
                columnRenderer={CustomColumnRenderer}
                contentRenderer={CustomContentRenderer}
            />,
        );

        expect(wrapper.find(CustomColumnRenderer)).toExist();
    });

    it("should render provided content renderer", () => {
        const wrapper = shallow(
            <FluidLayoutColumn
                screen="xl"
                column={layoutFacade.rows().row(0).columns().column(0)}
                contentRenderer={CustomContentRenderer}
            />,
        );

        expect(wrapper.find(CustomContentRenderer)).toExist();
    });
});
