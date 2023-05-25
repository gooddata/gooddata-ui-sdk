// (C) 2007-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import KpiPop, { IKpiPopProps } from "../KpiPop.js";

import { IntlWrapper } from "../../../../../localization/index.js";

function renderKpiPop(props: IKpiPopProps) {
    return render(
        <IntlWrapper>
            <KpiPop {...props} />
        </IntlWrapper>,
    );
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
    clientWidth: 154,
};

describe("KpiPop's module functions", () => {
    it("should return kpiPop, previous period, percentage sections", () => {
        renderKpiPop(requiredKpiPopProps);
        expect(screen.getByText("change")).toBeInTheDocument();
        expect(screen.getByText("prev. year")).toBeInTheDocument();
    });
});
