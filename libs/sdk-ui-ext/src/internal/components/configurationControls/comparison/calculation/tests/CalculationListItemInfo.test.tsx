// (C) 2023-2025 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalculateAs, CalculationType } from "@gooddata/sdk-ui-charts";

import { InternalIntlWrapper } from "../../../../../utils/internalIntlProvider.js";
import { CalculationListItemInfo } from "../CalculationListItemInfo.js";

const CALCULATION_INFO_SELECTOR = ".calculation-item-info";

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

    it.each([
        [
            CalculateAs.CHANGE,
            "Change",
            "Calculates the relative change between primary and secondary metric values.",
            "Formula",
            "(Primary - Secondary) / Secondary",
            "Example",
            "Year-over-year sales change = (the current year's sales - the previous year's sales) / the previous year's sales",
        ],
        [
            CalculateAs.CHANGE_DIFFERENCE,
            "Change (difference)",
            "Calculates both the relative change and absolute difference between primary and secondary metric values.",
            "Formula (relative change)",
            "(Primary - Secondary) / Secondary",
            "Formula (absolute difference)",
            "Primary - Secondary",
            "Example",
            "Year-over-year sales change = [(the current year's sales - the previous year's sales) / the previous year's sales] AND [the current year's sales - the previous year's sales]",
        ],
        [
            CalculateAs.RATIO,
            "Ratio",
            "Quantifies the share of the primary metric value in the secondary metric value.",
            "Formula",
            "Primary / Secondary",
            "Example",
            "Current sales compared to a quota = current sales / quota",
        ],
        [
            CalculateAs.DIFFERENCE,
            "Difference",
            "Calculates the absolute difference between primary and secondary metric values.",
            "Formula",
            "Primary - Secondary",
            "Example",
            "Year-over-year sales difference = the current year's sales - the previous year's sales",
        ],
    ])("Should render item info correctly for '%' item", (...params) => {
        const [calculationType, ...infos] = params;
        const { container } = renderCalculationListItemInfo({
            title: infos[0],
            calculationType,
        });

        const tooltip = container.querySelector(CALCULATION_INFO_SELECTOR);
        expect(tooltip.children.length).toBe(infos.length);
        infos.forEach((expected, index) => {
            expect(tooltip.children[index].innerHTML).toEqual(expected);
        });
    });
});
