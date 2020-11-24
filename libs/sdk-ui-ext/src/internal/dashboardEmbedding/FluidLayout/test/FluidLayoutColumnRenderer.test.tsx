// (C) 2019-2020 GoodData Corporation
import React from "react";
import { shallow } from "enzyme";
import { Col } from "react-grid-system";
import zip from "lodash/zip";
import { FluidLayoutColumnRenderer } from "../FluidLayoutColumnRenderer";
import { ALL_SCREENS } from "../constants";
import { TextLayoutColumn } from "./fixtures";

const testWidths = [12, 10, 6, 4, 2];
const testCases = zip(ALL_SCREENS, testWidths);

const testColumn: TextLayoutColumn = {
    size: testCases.reduce(
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
    ),
};

describe("FluidLayoutColumnRenderer", () => {
    it("should propagate responsive widths to Col component", () => {
        const wrapper = shallow(
            <FluidLayoutColumnRenderer
                row={{ columns: [] }}
                column={testColumn}
                rowIndex={0}
                columnIndex={0}
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
