// (C) 2023 GoodData Corporation
import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { InternalIntlWrapper } from "../../../../../utils/internalIntlProvider.js";
import CalculationListItemInfoSection from "../CalculationListItemInfoSection.js";
import { CalculationType } from "@gooddata/sdk-ui-charts";

const USE_IN_TEXT_QUERY = "When to use";
const FORMULA_TEXT_QUERY = "Formula";
const EXAMPLE_TEXT_QUERY = "Example";

const CHANGE_USE_IN_CONTENT_TEXT_QUERY =
    "To calculate relative change between primary and secondary measure values.";
const CHANGE_FORMULA_CONTENT_TEXT_QUERY = "(Primary - Secondary) / Secondary";
const CHANGE_EXAMPLE_CONTENT_TEXT_QUERY =
    "Sales change this year compared to last year = (This year sales - Last year sales) / Last year sales";

const RATIO_USE_IN_CONTENT_TEXT_QUERY =
    "To calculate what part of secondary metric value is primary measure value.";
const RATIO_FORMULA_CONTENT_TEXT_QUERY = "Primary / Secondary";
const RATIO_EXAMPLE_CONTENT_TEXT_QUERY = "Sales this year compared to a quota = This year sales / quota";

const DIFFERENCE_USE_IN_CONTENT_TEXT_QUERY =
    "To calculate absolute difference between primary and secondary measures values.";
const DIFFERENCE_FORMULA_CONTENT_TEXT_QUERY = "Primary - Secondary";
const DIFFERENCE_EXAMPLE_CONTENT_TEXT_QUERY = "...";

describe("CalculationListItemInfoSection", () => {
    const renderCalculationListItemInfoSection = (props: {
        calculationType: CalculationType;
        section: any;
    }) => {
        return render(
            <InternalIntlWrapper>
                <CalculationListItemInfoSection {...props} />
            </InternalIntlWrapper>,
        );
    };

    const specs = [
        ["useIn", "change", USE_IN_TEXT_QUERY, CHANGE_USE_IN_CONTENT_TEXT_QUERY],
        ["formula", "change", FORMULA_TEXT_QUERY, CHANGE_FORMULA_CONTENT_TEXT_QUERY],
        ["example", "change", EXAMPLE_TEXT_QUERY, CHANGE_EXAMPLE_CONTENT_TEXT_QUERY],
        ["useIn", "ratio", USE_IN_TEXT_QUERY, RATIO_USE_IN_CONTENT_TEXT_QUERY],
        ["formula", "ratio", FORMULA_TEXT_QUERY, RATIO_FORMULA_CONTENT_TEXT_QUERY],
        ["example", "ratio", EXAMPLE_TEXT_QUERY, RATIO_EXAMPLE_CONTENT_TEXT_QUERY],
        ["useIn", "difference", USE_IN_TEXT_QUERY, DIFFERENCE_USE_IN_CONTENT_TEXT_QUERY],
        ["formula", "difference", FORMULA_TEXT_QUERY, DIFFERENCE_FORMULA_CONTENT_TEXT_QUERY],
        ["example", "difference", EXAMPLE_TEXT_QUERY, DIFFERENCE_EXAMPLE_CONTENT_TEXT_QUERY],
    ];

    it.each(specs)(
        "Should render %s section correctly when calculation type is %s",
        (section: string, calculationType: CalculationType, title: string, content: string) => {
            const { getByText } = renderCalculationListItemInfoSection({ calculationType, section });
            expect(getByText(title)).toBeInTheDocument();
            expect(getByText(content)).toBeInTheDocument();
        },
    );
});
