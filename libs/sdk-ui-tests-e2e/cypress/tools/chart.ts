// (C) 2021 GoodData Corporation
export const YAXIS_LABELS_SELECTOR =
    ".highcharts-yaxis-labels text[text-anchor = 'middle'], .highcharts-yaxis-labels text[text-anchor = 'end']";
export const XAXIS_LABELS_SELECTOR =
    ".highcharts-xaxis-labels text[text-anchor = 'middle'], .highcharts-xaxis-labels text[text-anchor = 'end']";
const LEGEND_ICON_SELECTOR = ".viz-legend .series-icon";
const DATA_LABELS_SELECTOR = ".highcharts-data-labels .highcharts-label text";

export class Chart {
    constructor(private parentSelector: string) {}

    getElementSelector() {
        return this.parentSelector;
    }

    getElement() {
        return cy.get(this.getElementSelector());
    }

    scrollIntoView() {
        this.getElement().scrollIntoView();
        return this;
    }

    waitLoaded() {
        this.getElement().find(".s-loading").should("not.exist");
        return this;
    }

    waitComputed() {
        cy.get(".adi-computing-inner").should("not.exist");
        this.getElement().find(".visualization-container-measure-wrap").should("exist");
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
            .find(`.highcharts-series.highcharts-series-${seriesIndex} .highcharts-point`)
            .eq(pointIndex)
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

    hasDataLabelValues(labels: string[]) {
        this.getDataLabelValues().should("deep.equal", labels);
        return this;
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

    isHighchartsChart(isHighchartsChart: boolean = true) {
        this.getElement()
            .find(".highcharts-root")
            .should(isHighchartsChart ? "exist" : "not.exist");
    }

    public hasLegendColorCount(count: number) {
        this.getElement().find(DATA_LABELS_SELECTOR).should("have.length", count);
    }

    public hasMatchingColorLegend(color: string) {
        this.getElement()
            .find(LEGEND_ICON_SELECTOR)
            .invoke("css", "background-color")
            .then((backgroundColorItem) => {
                expect(backgroundColorItem).eq(color);
            });
    }

    public hasMatchingPercentageLabels(labels: RegExp[]) {
        for (let i = 0; i < labels.length; i++) {
            this.getElement().find(DATA_LABELS_SELECTOR).eq(i).contains(labels[i]).should("exist");
        }
    }

    public assertShortenMetricName(element: string, width: number) {
        cy.get(element).invoke("css", "text-overflow").should("equal", "ellipsis");
        cy.get(element)
            .invoke("width")
            .then((widthValue) => {
                cy.wrap(widthValue).should("equal", width);
            });
        return this;
    }

    private getTooltipContents(index: number) {
        cy.get(
            `.highcharts-series-${index}.highcharts-tracker rect, .highcharts-series-${index}.highcharts-tracker path `,
        )
            .first()
            .trigger("mouseover", { force: true });

        cy.wait(500);
        const result: string[] = [];
        cy.get(".gd-viz-tooltip-content")
            .find(".gd-viz-tooltip-title")
            .each(($li) => {
                return result.push($li.text());
            });
        return cy.wrap(result);
    }

    hasTooltipContents(index: number, tooltip: string[]) {
        this.getTooltipContents(index).should("deep.equal", tooltip);
        return this;
    }

    clickCellHeatMap(index: number) {
        this.getElement().find(".highcharts-data-label text").eq(index).click({ force: true });
        return this;
    }

    isColumnHighlighted(value: string, isStroked = true) {
        cy.get(`.highcharts-data-label text`)
            .contains(value)
            .trigger("mouseover")
            .should(isStroked ? "have.attr" : "not.have.attr", "stroke");
        return this;
    }
}
