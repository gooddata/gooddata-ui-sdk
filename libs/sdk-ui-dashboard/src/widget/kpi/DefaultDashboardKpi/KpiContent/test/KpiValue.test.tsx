// (C) 2007-2020 GoodData Corporation
import React from "react";
import { mount } from "enzyme";

import { IntlWrapper } from "../../../../../localization";
import KpiValue, { IKpiValueProps } from "../KpiValue";

function renderKpiValue(props: IKpiValueProps) {
    const wrapper = mount(
        <IntlWrapper>
            <KpiValue {...props} />
        </IntlWrapper>,
    );
    return {
        wrapper,
        component: wrapper.find(KpiValue).instance(),
    };
}

const requiredKpiValueProps: IKpiValueProps = {
    isLoading: false,
    value: 42,
    format: "##:###",
    separators: {
        thousand: "'",
        decimal: ",",
    },
};

describe("KpiValue drill underline", () => {
    it("Should be shown underline when disableKpiDrillUnderline is set to false", () => {
        const kpiValueProps = {
            ...requiredKpiValueProps,
            disableKpiDrillUnderline: false,
        };

        const { wrapper } = renderKpiValue(kpiValueProps);
        expect(wrapper.find(".s-kpi-value").hasClass("kpi-link-style-underline")).toBe(true);
    });

    it("Should be hidden underline when disableKpiDrillUnderline is set to true", () => {
        const kpiValueProps = {
            ...requiredKpiValueProps,
            disableKpiDrillUnderline: true,
        };

        const { wrapper } = renderKpiValue(kpiValueProps);
        expect(wrapper.find(".s-kpi-value").hasClass("kpi-link-style-underline")).toBe(false);
    });
});
