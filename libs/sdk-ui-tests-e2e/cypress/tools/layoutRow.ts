// (C) 2021-2025 GoodData Corporation

import { InsightsCatalog, InsightTitle } from "./insightsCatalog";
import { SectionHeader } from "./sectionHeader";

const catalog = new InsightsCatalog();

export class LayoutRow {
    constructor(private rowIndex: number) {}

    getSelector() {
        return `.gd-grid-layout__section:nth-child(${this.rowIndex + 1})`;
    }

    getElement() {
        return cy.get(this.getSelector());
    }

    getItems() {
        return this.getElement().find(".s-dash-item");
    }

    hasWidgets(count: number) {
        this.getItems().should("have.length", count);
        return this;
    }

    hasTitles(titles: string[]) {
        this.hasWidgets(titles.length);

        titles.forEach((title, itemIndex) => {
            this.getItems().eq(itemIndex).find(".s-headline").should("have.text", title);
        });

        return this;
    }

    getHeader() {
        return new SectionHeader(this.rowIndex);
    }

    addAbove(name: InsightTitle) {
        catalog.searchExistingInsight(name);
        this.dragAndDropItems(catalog.getInsightSelector(name), `${this.getSelector()} .row-hotspot`);
        catalog.clearSearch();
        return this;
    }

    addLast(name: InsightTitle) {
        catalog.searchExistingInsight(name);
        this.dragAndDropItems(catalog.getInsightSelector(name), `.s-last-drop-position`);
        catalog.clearSearch();
        return this;
    }

    addInsightPlaceholder() {
        this.dragAndDropItems(".s-add-insight", ".s-drag-info-placeholder-drop-target");
        return this;
    }

    addKpiPlaceholder() {
        this.dragAndDropItems(".s-add-kpi:not(.disabled)", ".s-drag-info-placeholder-drop-target");
        return this;
    }

    addRichTextWidget() {
        this.dragAndDropItems(".s-add-rich-text", `${this.getSelector()} .row-hotspot`);
        return this;
    }

    hasCountOfHeaderSection(count: number) {
        cy.get(".s-fluid-layout-row-header").should("have.length", count);
        return this;
    }

    dragAndDropItems(source: string, target: string) {
        const dataTransfer = new DataTransfer();
        cy.get(source).should("exist");
        cy.get(source).parent().trigger("dragstart", { dataTransfer });
        cy.get(target).should("be.visible");
        cy.get(target).trigger("drop", { dataTransfer });
        return this;
    }

    dragAbove(name: InsightTitle) {
        catalog.searchExistingInsight(name);
        this.dragItems(catalog.getInsightSelector(name), `${this.getSelector()} .row-hotspot`);
        catalog.clearSearch();
        return this;
    }

    dragItems(source: string, target: string) {
        const dataTransfer = new DataTransfer();
        cy.get(source).should("exist");
        cy.get(source).parent().trigger("dragstart", { dataTransfer });
        cy.get(target).should("be.visible");
        cy.get(target).trigger("dragenter", { dataTransfer });
        return this;
    }

    scrollIntoView() {
        this.getElement().scrollIntoView();
        return this;
    }
}
