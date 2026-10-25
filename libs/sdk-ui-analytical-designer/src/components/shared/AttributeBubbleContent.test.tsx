// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type IOrganizedCatalogTooltipDetailsAttribute } from "../../typings/catalog.js";
import { withIntl } from "../../utils/with_intl.js";

import { AttributeBubbleContent } from "./AttributeBubbleContent.js";

describe("AttributeBubbleContent", () => {
    const attrElements = [{ title: "" }, { title: "element1" }, { title: "element2" }];
    const Wrapped = withIntl(AttributeBubbleContent);

    function renderComponent(tooltipDetails: IOrganizedCatalogTooltipDetailsAttribute) {
        return render(
            <Wrapped
                attrElements={tooltipDetails.attrElements}
                attrElementsTotalCount={tooltipDetails.attrElementsTotalCount}
                attrElementsNumberFormat={tooltipDetails.attrElementsNumberFormat}
                separators={tooltipDetails.separators}
                dataset={tooltipDetails.dataset}
            />,
        );
    }

    it("renders elements if provided", () => {
        const { container } = renderComponent({ attrElements });
        const tags = container.querySelectorAll(".s-attribute-element");
        expect(tags).toHaveLength(3);
        attrElements.forEach((element, idx) => {
            expect(tags[idx].textContent).toContain(element.title);
        });
    });

    it("formats the values of a numeric computed attribute by their number format", () => {
        const { container } = renderComponent({
            attrElements: [{ title: "1234.5" }, { title: "abc" }],
            attrElementsNumberFormat: "#,##0.0",
            separators: { decimal: ",", thousand: " " },
        });
        const tags = container.querySelectorAll(".s-attribute-element");
        expect(Array.from(tags).map((tag) => tag.textContent)).toEqual(["1 234,5", "abc"]);
    });

    it("renders dataset if provided", () => {
        const { container } = renderComponent({ attrElements, dataset: { title: "Dataset" } });
        const dataset = container.querySelector(".s-dataset-name");
        expect(dataset.textContent).toEqual("Dataset");
    });

    it('should replace blank title with "(empty value)" text', () => {
        const { container } = renderComponent({ attrElements });
        const tags = container.querySelectorAll(".s-attribute-element");
        const emptyTitleTag = tags[0];
        expect(emptyTitleTag.textContent).toEqual("(empty value)");
    });

    it("renders total elements text", () => {
        const { container } = renderComponent({ attrElements, attrElementsTotalCount: 5 });
        const more = container.querySelector(".adi-tooltip-elements-more");
        expect(more.textContent).toContain(" 2 ");
    });

    it("renders loading if no elements provided", () => {
        const { container } = renderComponent({});
        expect(container.querySelector(".s-values-wrapper").textContent).toContain("Loading");
    });

    it("renders loading if no dataset is provided", () => {
        const { container } = renderComponent({});
        expect(container.querySelector(".s-dataset-wrapper").textContent).toContain("Loading");
    });
});
