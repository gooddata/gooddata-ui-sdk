// (C) 2021-2025 GoodData Corporation

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
            .realClick();
        return this;
    }

    seriesPointHasClass(className: string, seriesIndex: number, pointIndex = 0) {
        this.getHighchartsContainer()
            .find(`.highcharts-series.highcharts-series-${seriesIndex} .highcharts-point`)
            .eq(pointIndex)
            .should("have.class", className);
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
    public hasTooltipTitleWidth(tooltipEl: string, width: number) {
        cy.get(tooltipEl).should("have.attr", "style", `max-width: ${width}px;`);
        return this;
    }

    hoverOnHighChartSeries(index: number, pointIndex = 0) {
        this.getElement()
            .find(
                `.highcharts-series-${index}.highcharts-tracker rect,
             .highcharts-series-${index}.highcharts-tracker path, 
             .highcharts-data-label text,
             .highcharts-series rect
             `,
            )
            .eq(pointIndex)
            .realHover();
        cy.wait(1000); //wait until the tooltip visible
    }

    getTooltipContents(index: number, pointIndex = 0) {
        this.hoverOnHighChartSeries(index, pointIndex);
        const result: string[] = [];
        const titles = ".gd-viz-tooltip-title:visible";
        const values = ".gd-viz-tooltip-value:visible";
        cy.get(".gd-viz-tooltip-item:visible").each(($li) => {
            const titleText = $li.find(titles).text().trim();
            const valueText = $li.find(values).text().trim();
            result.push(titleText, valueText);
        });

        return cy.wrap(result);
    }

    hasTooltipInteraction(index: number, pointIndex = 0) {
        this.hoverOnHighChartSeries(index, pointIndex);
        cy.get(".gd-viz-tooltip-interaction:visible").should("have.text", "Click chart to drill");
    }

    hasTooltipContents(index: number, pointIndex = 0, tooltip: string[]) {
        this.getTooltipContents(index).should("deep.equal", tooltip);
        this.hasTooltipInteraction(index, pointIndex);
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

    verifyTotalPointsOfChart(group: number, count: number) {
        this.getElement().find(`.highcharts-series-${group} .highcharts-point`).should("have.length", count);
        return this;
    }

    hasScatterSerieColor(index: number, value: string) {
        this.getElement()
            .find(`.highcharts-series-0 path`)
            .eq(index)
            .invoke("attr", "fill")
            .should("eq", value);
        return this;
    }
}
