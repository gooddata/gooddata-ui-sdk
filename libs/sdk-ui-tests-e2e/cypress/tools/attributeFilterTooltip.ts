// (C) 2023-2025 GoodData Corporation

const TOOLTIP = ".s-attribute-filter-details-bubble";
const TOOLTIP_HEADER = ".s-attribute-filter-tooltip-header";
const TOOLTIP_ITEM = ".s-attribute-filter-tooltip-item";

export class AttributeFilterTooltip {
    getElement() {
        return cy.get(TOOLTIP);
    }

    hasHeading(name: string) {
        this.getElement().find(TOOLTIP_HEADER).should("contain.text", name);
        return this;
    }

    hasAttributeName(name: string) {
        this.getElement().find(`${TOOLTIP_ITEM}-name`).should("contain.text", name);
        return this;
    }

    hasDataSet(name: string) {
        this.getElement().find(`${TOOLTIP_ITEM}-dataset`).should("contain.text", name);
        return this;
    }

    hasAttributeValues(name: string[]) {
        const result: string[] = [];
        this.getElement()
            .find(".s-attribute-element")
            .each(($li) => {
                return result.push($li.text());
            });
        cy.wrap(result).should("deep.include.members", name);
        return this;
    }
}
