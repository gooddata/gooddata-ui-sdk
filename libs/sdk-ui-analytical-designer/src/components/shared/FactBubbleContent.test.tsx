// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { type IOrganizedCatalogTooltipDetailsFact } from "../../typings/catalog.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../../utils/translations.js";

import { FactBubbleContent } from "./FactBubbleContent.js";

const translations = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];

describe("FactBubbleContent", () => {
    const tooltipDetails = { dataset: { title: "title1" } };

    function renderComponent(tooltipDetails: IOrganizedCatalogTooltipDetailsFact) {
        return render(
            <IntlProvider locale="en-US" messages={translations}>
                <FactBubbleContent dataset={tooltipDetails.dataset} />
            </IntlProvider>,
        );
    }

    it("renders dataset if provided", () => {
        const { container } = renderComponent(tooltipDetails);
        expect(container.querySelector(".s-dataset-name").textContent).toEqual(tooltipDetails.dataset.title);
    });

    it("renders loading if no dataset provided", () => {
        const { container } = renderComponent({});
        expect(container.querySelector("p").textContent).toContain("Loading");
    });
});
