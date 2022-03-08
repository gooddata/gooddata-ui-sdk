// (C) 2021 GoodData Corporation

export const YAXIS_LABELS_SELECTOR =
    ".highcharts-yaxis-labels text[text-anchor = 'middle'], .highcharts-yaxis-labels text[text-anchor = 'end']";
export const XAXIS_LABELS_SELECTOR =
    ".highcharts-xaxis-labels text[text-anchor = 'middle'], .highcharts-xaxis-labels text[text-anchor = 'end']";

export class Chart {
    constructor(private parentSelector: string) {}

    getElementSelector() {
        return this.parentSelector;
    }

    getElement() {
        return cy.get(this.getElementSelector());
    }

    waitLoaded() {
        this.getElement().find(".s-loading").should("not.exist");
        //this.getElement().find(".s-loading-done").should("exist");
        return this;
    }

    getHighchartsContainer() {
        return cy.get(this.parentSelector).find(".highcharts-container");
    }

    getContentElement() {
        return cy.get(this.parentSelector).find(".visualization-content");
    }

    clickSeriesPoint(seriesIndex: number, pointIndex = 0) {
        this.getHighchartsContainer()
            .settled(`.highcharts-series.highcharts-series-${seriesIndex} .highcharts-point`)
            .eq(pointIndex)
            .scrollIntoView()
            .click({ force: true });
        return this;
    }

    hasCountOfDrillPoints(count: number) {
        cy.get(".highcharts-drilldown-point").should("have.length", count);
        return this;
    }

    hasNoDataForFilter() {
        this.getContentElement().contains("No data for your filter selection").should("exist");
    }

    getDataLabelValues() {
        const result: string[] = [];
        this.getHighchartsContainer()
            .find(`.highcharts-data-label text`)
            .each(($li) => {
                return result.push($li.text());
            });
        return cy.wrap(result);
    }

    clickAxisDrilldownLabel(axis: "x" | "y", index: number) {
        this.getHighchartsContainer()
            .find(`.highcharts-${axis}axis-labels .highcharts-drilldown-axis-label`)
            .eq(index)
            .click();
        return this;
    }

    getYAxisLabelsElements() {
        return cy.get(YAXIS_LABELS_SELECTOR);
    }

    getXAxisLabelElements() {
        return cy.get(XAXIS_LABELS_SELECTOR);
    }

    getYAxisLabels() {
        const result: string[] = [];
        this.getYAxisLabelsElements().each(($li) => {
            return result.push($li.text());
        });
        return cy.wrap(result);
    }

    getXAxisLabels() {
        const result: string[] = [];
        this.getXAxisLabelElements().each(($li) => {
            return result.push($li.text());
        });
        return cy.wrap(result);
    }
}
