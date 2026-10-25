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

    describe("Maql segment redirect", () => {
        const tooltipDetails: IOrganizedCatalogTooltipDetailsMeasure = {
            metricMaql: [
                { title: "element1", category: "metric", uri: "/uri1" },
                { title: "element2", category: "attribute", uri: "/uri2" },
                { title: "element3", category: "identifier" },
                { title: "element4" },
            ],
        };

        it("should not render maql segment redirects when redirect is not allowed", () => {
            const { container } = renderComponent({ ...tooltipDetails, isRedirectAllowed: false });

            expect(container.querySelectorAll(".s-adi-maql-segment-redirect")).toHaveLength(0);
        });

        it("should render 2 maql segment redirects with correct href properties", () => {
            const { container } = renderComponent({
                ...tooltipDetails,
                projectId: "projectId",
                isRedirectAllowed: true,
            });

            expect(container.querySelectorAll(".s-adi-maql-segment-redirect")).toHaveLength(2);
            expect(
                container.querySelectorAll("a[href='/#s=/gdc/workspaces/projectId|objectPage|/uri1']"),
            ).toHaveLength(1);
            expect(
                container.querySelectorAll("a[href='/#s=/gdc/workspaces/projectId|objectPage|/uri2']"),
            ).toHaveLength(1);
        });

        it("should render 2 maql segment redirects with correct href properties and workspaceRef", () => {
            const { container } = renderComponent({
                ...tooltipDetails,
                projectId: "projectId",
                isRedirectAllowed: true,
            });

            expect(container.querySelectorAll(".s-adi-maql-segment-redirect")).toHaveLength(2);
            expect(
                container.querySelectorAll("a[href='/#s=/gdc/workspaces/projectId|objectPage|/uri1']"),
            ).toHaveLength(1);
            expect(
                container.querySelectorAll("a[href='/#s=/gdc/workspaces/projectId|objectPage|/uri2']"),
            ).toHaveLength(1);
        });
    });
});
