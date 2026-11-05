// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type IOrganizedCatalogTooltipDetailsMeasure } from "../../typings/catalog.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import { MeasureBubbleContent } from "./MeasureBubbleContent.js";

describe("MeasureBubbleContent", () => {
    function renderComponent(tooltipDetails: IOrganizedCatalogTooltipDetailsMeasure) {
        const WrappedMeasureBubbleContent = withRedux(withIntl(MeasureBubbleContent));
        return render(<WrappedMeasureBubbleContent {...tooltipDetails} />);
    }

    it("renders maql if provided", () => {
        const tooltipDetails: IOrganizedCatalogTooltipDetailsMeasure = {
            metricMaql: [
                { title: "element1", category: "metric" },
                { title: "element2", category: "attribute" },
                { title: "element3", category: "text" },
            ],
        };

        const { container } = renderComponent(tooltipDetails);

        const tags = container.querySelectorAll(".adi-maql-segment");
        expect(tags).toHaveLength(2);
        tags.forEach((tag, idx) => {
            expect(tag.textContent).toContain(tooltipDetails.metricMaql[idx].title);
        });

        const maqlText = container.querySelector(".adi-metric-maql");
        tooltipDetails.metricMaql.forEach((m) => expect(maqlText.textContent).toContain(m.title));
    });

    it("renders loading if no maql provided", () => {
        const { container } = renderComponent({});
        expect(container.querySelector("p").textContent).toContain("Loading");
    });
});
