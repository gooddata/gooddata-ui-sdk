// (C) 2023 GoodData Corporation
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { InternalIntlWrapper } from "../../../../../utils/internalIntlProvider.js";
import CalculationListItemInfo from "../CalculationListItemInfo.js";
import * as CalculationListItemInfoSection from "../CalculationListItemInfoSection.js";
import { CalculateAs, CalculationType } from "@gooddata/sdk-ui-charts";

describe("CalculationListItemInfo", () => {
    const renderCalculationListItemInfo = (props: { title: string; calculationType: CalculationType }) => {
        return render(
            <InternalIntlWrapper>
                <CalculationListItemInfo {...props} />
            </InternalIntlWrapper>,
        );
    };

    it("Should render title correctly", () => {
        const title = "Info change title";
        const props = { title, calculationType: CalculateAs.CHANGE };
        const { getByText } = renderCalculationListItemInfo(props);
        expect(getByText(title)).toBeInTheDocument();
    });

    it("Should render item info sections correctly", () => {
        const MockInfoSection = vi.spyOn(CalculationListItemInfoSection, "default");
        const calculationType = CalculateAs.CHANGE;
        const props = { title: "Change", calculationType };
        renderCalculationListItemInfo(props);
        expect(MockInfoSection).toHaveBeenCalledTimes(3);
        expect(MockInfoSection).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                calculationType,
                section: "useIn",
            }),
            expect.anything(),
        );
        expect(MockInfoSection).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                calculationType,
                section: "formula",
            }),
            expect.anything(),
        );
        expect(MockInfoSection).toHaveBeenNthCalledWith(
            3,
            expect.objectContaining({
                calculationType,
                section: "example",
            }),
            expect.anything(),
        );
    });
});
