// (C) 2021-2024 GoodData Corporation

import { Chart } from "./chart";
import { Table } from "./table";
import { Kpi } from "./kpi";
import { InsightsCatalog, InsightTitle } from "./insightsCatalog";
import { Headline } from "./headline";
import { RichText } from "./richText";

export class Widget {
    constructor(private index: number) {}

    getElementSelector() {
        return `.s-dash-item-${this.index}`;
    }

    getElement() {
        return cy.get(this.getElementSelector());
    }

    waitLoadStarted() {
        this.getElement().find(".s-loading").should("exist");
        return this;
    }

    waitChartLoaded() {
        // it needs to see visualization-uri-root to know the chart loading
        this.getElement().find(".visualization-uri-root").should("exist");
        // wait for .s-loading not existed to make sure chart loaded
        this.getElement().find(".gd-visualization-content").find(".s-loading").should("not.exist");
        return this;
    }

    waitKpiLoaded() {
        this.getElement().find(".content-loaded.widget-loaded").should("exist");
        this.getElement().find(".is-alert-evaluating").should("not.exist");
        return this;
    }

    waitTableLoaded() {
        this.getElement().find(".s-loading").should("not.exist");
        this.getElement().find(".s-loading-done").should("exist");
        return this;
    }

    isLoading(expected = true) {
        const css = expected
            ? ".s-loading-done, .content-loaded.widget-loaded, .visualization-value-loading"
            : ".content-loaded.widget-loaded, .visualization-value-loading";
        this.getElement()
            .find(css)
            .should(expected ? "exist" : "not.exist");
        return this;
    }

    setTitle(title: string) {
        this.getElement().find(".s-headline").click().type(`${title}{enter}`);
        return this;
    }

    getChart() {
        return new Chart(this.getElementSelector());
    }

    getHeadline() {
        return new Headline(this.getElementSelector());
    }

    getTable() {
        return new Table(this.getElementSelector());
    }

    getKPI() {
        return new Kpi(this.getElementSelector());
    }

    getRichText() {
        return new RichText(this.getElementSelector());
    }

    removeKPIWidget(confirm: boolean) {
        this.getElement().click().get(".dash-item-action-delete").click();
        if (confirm) {
            this.getElement().get(".s-delete").click();
        } else {
            this.getElement().get(".s-cancel").click();
        }
        return this;
    }

    removeVizWidget() {
        this.getElement().click().get(".s-delete-insight-item").click();
        return this;
    }

    exists(expect = true) {
        this.getElement().should(expect ? "exist" : "not.exist");
        return this;
    }

    isTitleVisible(expect = true) {
        this.getElement()
            .find(".s-headline")
            .should(expect ? "exist" : "not.exist");
        return this;
    }

    hasAlert(expect = true) {
        this.getElement()
            .find(".dash-item-content")
            .should(expect ? "have.class" : "not.have.class", "has-set-alert");
        return this;
    }

    hasTriggeredAlert(expect = true) {
        this.getElement()
            .find(".dash-item-content")
            .should(expect ? "have.class" : "not.have.class", "is-alert-triggered");
        return this;
    }

    /**
     * This checks actual width in grid of 12
     * @param size - size of widget
     * @returns
     */
    hasWidth(size: number) {
        this.getElement()
            .parents(".s-fluid-layout-column")
            .should("have.class", `s-fluid-layout-column-width-${size}`);
        return this;
    }

    /**
     * This will drag width to bulletIndex
     * @param bulletIndex - index of bullet
     * @returns
     */
    resizeWidthTo(bulletIndex: number) {
        const dataTransfer = new DataTransfer();
        const parentElement = ".gd-fluidlayout-column-container";

        cy.get(this.getElementSelector())
            .parents(parentElement)
            .find(".s-dash-width-resizer-hotspot")
            .trigger("dragstart", {
                dataTransfer,
            });

        cy.get(`.s-resize-bullet-${bulletIndex}`).trigger("drop", "center", {
            dataTransfer,
            force: true,
        });

        return this;
    }

    hover() {
        this.getElement().realHover();
        return this;
    }

    focus() {
        this.getElement().find(".is-selectable").click({ force: true });
        return this;
    }

    openTooltip() {
        this.getElement().find(".s-description-trigger").click();
        return this;
    }

    tooltipHoverExist(expect = true) {
        this.getElement()
            .find(".s-description-trigger")
            .should(expect ? "exist" : "not.exist");
        return this;
    }

    tooltipHasText(text: string) {
        cy.get(".s-gd-description-panel").should("have.text", text);
        return this;
    }

    getEditableLabelElement() {
        return this.getElement().find(".s-editable-label");
    }

    hasTitle(title: string) {
        this.getElement().find(".s-headline").should("have.text", title);
        return this;
    }

    isSelected() {
        this.getElement().should("have.class", "is-selected");
        return this;
    }

    dragBefore(name: InsightTitle) {
        return this.drag(name, "prev");
    }

    dragAfter(name: InsightTitle) {
        return this.drag(name, "next");
    }

    drag(name: InsightTitle, offset: "next" | "prev") {
        const dataTransfer = new DataTransfer();
        const catalog = new InsightsCatalog();
        catalog.searchExistingInsight(name);
        cy.get(catalog.getInsightSelector(name)).parent().trigger("dragstart", { dataTransfer });
        cy.get(`.dropzone.${offset}`).eq(this.index).trigger("dragenter", { dataTransfer });
        return this;
    }

    add(name: InsightTitle, offset: "next" | "prev") {
        const catalog = new InsightsCatalog();
        catalog.searchExistingInsight(name);
        const dataTransfer = new DataTransfer();
        cy.get(catalog.getInsightSelector(name)).parent().trigger("dragstart", { dataTransfer, force: true });
        cy.get(`.dropzone.${offset}`).eq(this.index).trigger("drop", { dataTransfer, force: true });
        return this;
    }

    hasPlaceholderTitle(placeholderTitle: string) {
        this.getElement()
            .find(".s-headline")
            .click()
            .find("textarea")
            .should("have.prop", "placeholder", placeholderTitle);
        return this;
    }

    getTitle() {
        return this.getElement().find(".s-headline");
    }

    addBefore(name: InsightTitle) {
        return this.add(name, "prev");
    }

    hasNoDataForFilter() {
        this.getElement().contains("No data for your filter selection").should("exist");
    }

    hasError() {
        this.getElement().contains("Sorry, we can't display this visualization").should("exist");
    }

    scrollIntoView() {
        this.getElement().scrollIntoView();
        return this;
    }
}
