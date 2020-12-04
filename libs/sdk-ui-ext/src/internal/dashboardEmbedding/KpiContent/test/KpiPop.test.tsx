// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";

import KpiPop, { IKpiPopProps } from "../KpiPop";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider";

function renderKpiPop(props: IKpiPopProps) {
    const wrapper = mount(
        <InternalIntlWrapper>
            <KpiPop {...props} />
        </InternalIntlWrapper>,
    );
    return {
        wrapper,
        component: wrapper.find(KpiPop).instance(),
    };
}

const requiredKpiPopProps: IKpiPopProps = {
    currentPeriodValue: 41013,
    previousPeriodValue: 51722,
    meaning: "growIsGood",
    disabled: true,
    isLoading: false,
    previousPeriodName: "prev. year",
    format: "##:###",
    separators: {
        thousand: "'",
        decimal: ",",
    },
    kpiWidth: 174,
};

describe("KpiPop's module functions", () => {
    const { wrapper } = renderKpiPop(requiredKpiPopProps);

    it("should return kpiPop section", () => {
        expect(wrapper.find(".kpi-pop-section")).toHaveLength(1);
    });

    it("should return kpiPop previous period", () => {
        expect(wrapper.find(".kpi-pop-period")).toHaveLength(1);
    });

    it("should return kpiPop percentage", () => {
        expect(wrapper.find(".kpi-pop-change")).toHaveLength(1);
    });

    it("should return kpiPop percentage with responsive css class", () => {
        expect(wrapper.find(".kpi-pop-change").html().includes("is-kpi-neutral")).toBe(true);
    });
});
