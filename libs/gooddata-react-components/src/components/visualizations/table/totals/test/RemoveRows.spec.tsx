// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { AFM } from "@gooddata/typings";

import { RemoveRows, IRemoveRowsProps } from "../RemoveRows";
import { ITotalWithData } from "../../../../../interfaces/Totals";

const FIXTURE: { totalsWithData: ITotalWithData[] } = {
    totalsWithData: [
        {
            type: "sum",
            alias: "Sum",
            outputMeasureIndexes: [],
            values: [null, null, 125],
        },
        {
            type: "avg",
            alias: "Avg",
            outputMeasureIndexes: [],
            values: [null, 45.98, 12.32],
        },
        {
            type: "nat",
            alias: "Rollup",
            outputMeasureIndexes: [],
            values: [null, 12.99, 1.008],
        },
    ],
};

describe("RemoveRows", () => {
    function render(customProps = {}) {
        const props: IRemoveRowsProps = {
            totalsWithData: FIXTURE.totalsWithData,
        };

        return mount(<RemoveRows {...props} {...customProps} />);
    }

    it("should render as many rows as totals given", () => {
        const component = render();
        expect(component.find(".indigo-totals-remove-row").length).toEqual(FIXTURE.totalsWithData.length);
    });

    it("should call passed 'onRemove' function with specific total type", () => {
        const onRemove = jest.fn();
        const component = render({ onRemove });
        const totalType: AFM.TotalType = FIXTURE.totalsWithData[1].type;

        const removeAvgButton = component.find(`Button.s-totals-rows-remove-${totalType}`);

        removeAvgButton.simulate("click");
        expect(onRemove).toBeCalledWith(totalType);
        expect(onRemove.mock.calls.length).toEqual(1);
    });

    // tslint:disable-next-line:max-line-length
    it("should apply 'last-added' classname only to the row of type same as passed in 'lastAddedTotalType' prop", () => {
        const component = render({ lastAddedTotalType: "sum" });

        expect(component.find(".totals-remove-row-sum.last-added").length).toEqual(1);

        expect(component.find(".totals-remove-row-avg.last-added").length).toEqual(0);
        expect(component.find(".totals-remove-row-nat.last-added").length).toEqual(0);
    });

    // tslint:disable-next-line:max-line-length
    it("should call 'onLastAddedTotalRowHighlightPeriodEnd' callback prop after component is rendered with highlighted row and timer runs out", () => {
        jest.useFakeTimers();

        const onLastAddedTotalRowHighlightPeriodEnd = jest.fn();
        render({ lastAddedTotalType: "sum", onLastAddedTotalRowHighlightPeriodEnd });

        expect(onLastAddedTotalRowHighlightPeriodEnd).not.toBeCalled();

        jest.runOnlyPendingTimers();

        expect(onLastAddedTotalRowHighlightPeriodEnd.mock.calls.length).toEqual(1);

        jest.useRealTimers();
    });
});
