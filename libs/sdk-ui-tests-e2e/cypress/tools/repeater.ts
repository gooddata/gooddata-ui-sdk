// (C) 2024 GoodData Corporation

const REPEATER_INSIGHT = ".s-repeater";

export class Repeater {
    getElement() {
        return cy.get(REPEATER_INSIGHT);
    }

    hasHeaderLabel(values: string[]) {
        this.getElement()
            .find(".ag-header-cell-text")
            .each(($element, index) => {
                cy.wrap($element).should("contain.text", values[index]);
            });
        return this;
    }

    hasHeaderCellsAmount(amount: number) {
        this.getElement().find(`.ag-header-cell-text`).should("have.length", amount);
        return this;
    }

    getCellValue(index: number) {
        return this.getElement().find(`.ag-cell-value`).eq(index);
    }

    isPlaceholderImageInCell(index: number) {
        this.getCellValue(index).find(".gd-repeater-image-empty").should("exist");
        return this;
    }

    isImageInCell(index: number) {
        this.getCellValue(index).find("img.gd-repeater-image").should("exist");
        return this;
    }

    isHyperlinkInCell(index: number, value: string) {
        this.getCellValue(index).find("a.gd-repeater-link").should("contain", value);
        return this;
    }

    hasRowHeight(expectedValue: string) {
        this.getElement().find(".gd-table-row").should("have.css", "height", expectedValue);
        return this;
    }

    hasVerticalAlign(index: number, value: string) {
        this.getCellValue(index).find(`.gd-vertical-align-${value}`).should("exist");
        return this;
    }

    hasTextWrapping(index: number, value: string) {
        this.getCellValue(index).find(`.gd-text-wrapping-${value}`).should("exist");
        return this;
    }

    hasImageSize(index: number, value: string) {
        this.getCellValue(index).find(`.gd-image-sizing-${value}`).should("exist");
        return this;
    }

    hasChartInCell(index: number, type: string, numberOfPoints: number) {
        this.getCellValue(index).find(`.highcharts-${type}-series`).should("exist");
        this.getCellValue(index).find(`.highcharts-point`).should("have.length", numberOfPoints);
        return this;
    }

    hasContentInCell(cellIndex: number, value: string) {
        this.getCellValue(cellIndex).should("contain.text", value);
        return this;
    }

    hasColor(cellIndex: number, pointIndex: number, color: string) {
        this.getCellValue(cellIndex)
            .find(`.highcharts-point`)
            .eq(pointIndex)
            .should("have.attr", "fill", color);
        return this;
    }

    shouldShowErorrMessage(errorMessage: string) {
        cy.get(`.s-error`).should("contain.text", errorMessage);
    }
}
