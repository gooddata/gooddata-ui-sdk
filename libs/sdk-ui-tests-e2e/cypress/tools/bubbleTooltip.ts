// (C) 2023 GoodData Corporation

export class BubbleTooltip {
    hasTooltip(tooltip: string) {
        cy.get(".gd-overlay-content .bubble-content .content").should("contain.text", tooltip);
        return this;
    }
}
