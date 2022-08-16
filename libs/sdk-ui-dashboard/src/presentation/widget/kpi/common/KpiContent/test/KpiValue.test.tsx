// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";

import KpiValue, { IKpiValueProps } from "../KpiValue";

import { IntlWrapper } from "../../../../../localization";

function renderKpiValue(props: IKpiValueProps) {
    return render(
        <IntlWrapper>
            <KpiValue {...props} />
        </IntlWrapper>,
    );
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
        renderKpiValue(kpiValueProps);
        expect(document.querySelector(".kpi-link-style-underline")).toBeInTheDocument();
    });

    it("Should be hidden underline when disableKpiDrillUnderline is set to true", () => {
        const kpiValueProps = {
            ...requiredKpiValueProps,
            disableKpiDrillUnderline: true,
        };

        renderKpiValue(kpiValueProps);
        expect(document.querySelector(".kpi-link-style-underline")).not.toBeInTheDocument();
    });
});
