// (C) 2019-2020 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { Col } from "react-grid-system";
import zip from "lodash/zip";
import { FluidLayoutFacade, IFluidLayoutSizeByScreen } from "@gooddata/sdk-backend-spi";
import { FluidLayoutColumnRenderer } from "../FluidLayoutColumnRenderer";
import { ALL_SCREENS } from "../constants";
import { fluidLayoutMock, fluidLayoutRowMock } from "../mocks";

const testWidths = [12, 10, 6, 4, 2];
const testCases = zip(ALL_SCREENS, testWidths);

const sizeForAllScreens: IFluidLayoutSizeByScreen = testCases.reduce(
    (acc, [screen, widthAsGridColumnsCount]) => ({
        ...acc,
        [screen]: {
            widthAsGridColumnsCount,
        },
    }),
    {
        xl: {
            widthAsGridColumnsCount: 0,
        },
    },
);

export const layoutFacade = FluidLayoutFacade.for(
    fluidLayoutMock([fluidLayoutRowMock([["Test", sizeForAllScreens]])]),
);

describe("FluidLayoutColumnRenderer", () => {
    it("should propagate responsive widths to Col component", () => {
        const wrapper = shallow(
            <FluidLayoutColumnRenderer
                DefaultRenderer={FluidLayoutColumnRenderer}
                column={layoutFacade.rows().row(0).columns().column(0)}
                screen="xl"
            />,
        );
        expect(wrapper.find(Col)).toHaveProp("xl", 12);
        expect(wrapper.find(Col)).toHaveProp("lg", 10);
        expect(wrapper.find(Col)).toHaveProp("md", 6);
        expect(wrapper.find(Col)).toHaveProp("sm", 4);
        expect(wrapper.find(Col)).toHaveProp("xs", 2);
    });
});
