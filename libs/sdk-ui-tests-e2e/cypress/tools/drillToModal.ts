// (C) 2021-2025 GoodData Corporation

import { Chart } from "./chart";
import { Table } from "./table";

export class DrillToModal {
    getElement() {
        return cy.get(".s-drill-modal-dialog");
    }

    getTitleElement() {
        return this.getElement().find(".s-drill-title");
    }

    getChart() {
        return new Chart(".s-drill-modal-dialog");
    }

    getTable() {
        return new Table(".s-drill-modal-dialog");
    }

    close() {
        this.getElement().find(".s-dialog-close-button").should("be.visible").click();
        this.getElement().should("not.exist");
    }

    getModalText() {
        return this.getElement().find(".gd-visualization-content .gd-typography--h2");
    }

    waitForDrillModalViz() {
        this.getElement().find(".gd-loading-equalizer-wrap").should("not.exist");
        return this;
    }

    back() {
        this.getElement().find(".s-drill-reset-button").click();
        return this;
    }

    selectDropdownAttribute(attr: string) {
        cy.get(".gd-drill-modal-picker-dropdown")
            .find(".s-drill-down")
            .should("be.visible")
            .contains(`${attr}`)
            .click({ force: true });
        return this;
    }

    selectCrossFiltering() {
        cy.get(".gd-drill-modal-picker-dropdown")
            .find(".s-cross-filtering")
            .should("be.visible")
            .click({ force: true });
        return this;
    }

    hasTitleHeader(title: string) {
        this.getTitleElement().should("have.text", title);
        return this;
    }
}
