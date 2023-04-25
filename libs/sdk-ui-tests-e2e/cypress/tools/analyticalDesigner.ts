// (C) 2021 GoodData Corporation
export const AD_OVERLAY_SELECTOR = "#adOverlay";
export const REPORT_TITLE_SELECTOR = ".s-report-title";
export const SAVE_BUTTON_SELECTOR = ".s-save-button";
export const DATE_FILTER_BUTTON_SELECTOR = ".adi-date-filter-button";
export const TRASH_SELECTOR = ".s-trash";
export const EDITOR_LOADING_SELECTOR = ".editor-loading";
export const REPORT_COMPUTING = ".s-report-computing";
export const SAVE_AS_NEW_BUTTON_SELECTOR = ".s-save_as_new";
export const NAME_INSIGHT_INPUT_SELECTOR = ".gd-confirm .s-name-insight-dialog-input";
export const DIALOG_FOOTER_SELECTOR = ".gd-dialog-footer";
export const DIALOG_SUBMIT_BUTTON_SELECTOR = ".s-dialog-submit-button";
export const OVERLAY_MESSAGE_SELECTOR = ".gd-message-overlay";
export const CATEGORY_TITLE_SELECTOR = ".s-catalog-item-title";
export const MEASURES_BUCKET_SELECTOR = ".s-bucket-invitation-measures";

export class AnalyticalDesigner {
    getElement() {
        return cy.getIframeBody(AD_OVERLAY_SELECTOR);
    }

    setTitle(title: string) {
        this.getElement().should("exist");
        this.getElement().find(".s-editable-label.s-report-title").type(title).click();
        return this;
    }

    searchData(itemName: string) {
        this.getElement().find(".s-catalogue-search .gd-input-field-small").clear().type(itemName);
        return this;
    }

    save() {
        this.getElement().find(".s-save-button.s-save").should("not.have.class", "disabled").click();
        return this;
    }

    setChartType(chartType: string) {
        this.getElement().find(`.gd-vis-type-${chartType}`).click();
        return this;
    }

    getInsightTitle() {
        const result = [] as string[];
        this.getElement()
            .find(REPORT_TITLE_SELECTOR)
            .then(($el) => {
                return result.push($el.text());
            });
        return cy.wrap(result);
    }

    isSaveButtonDisabled(isDisable: true) {
        this.getElement()
            .find(SAVE_BUTTON_SELECTOR)
            .should("have.class", isDisable ? "disabled" : "enabled");
        return this;
    }

    removeDateFilter() {
        const dataTransfer = new DataTransfer();
        this.getElement().find(DATE_FILTER_BUTTON_SELECTOR).trigger("dragstart", { dataTransfer });
        cy.get(TRASH_SELECTOR).trigger("drop", { dataTransfer });
        return this;
    }

    waitForInsightComputing() {
        this.getElement().find(REPORT_COMPUTING).should("exist");
        this.getElement().find(EDITOR_LOADING_SELECTOR).should("not.exist");
        this.getElement().find(REPORT_COMPUTING).should("not.exist");
        return this;
    }

    saveAsNewInsight(insightName: string) {
        this.getElement()
            .find(SAVE_AS_NEW_BUTTON_SELECTOR)
            .click()
            .then(() => {
                this.inputInsightNameInDialog(insightName);
            });
        this.waitForSuccessMessage();
        return this;
    }

    inputInsightNameInDialog(insightName: string) {
        this.getElement().find(NAME_INSIGHT_INPUT_SELECTOR).type(insightName);

        this.getElement().find(DIALOG_FOOTER_SELECTOR).find(DIALOG_SUBMIT_BUTTON_SELECTOR).click();
    }

    waitForSuccessMessage(): void {
        cy.log("Wait for success message on toolbar, then wait it disappeared");
        this.getElement()
            .find(OVERLAY_MESSAGE_SELECTOR)
            .should("be.visible")
            .then(() => {
                this.getElement().find(OVERLAY_MESSAGE_SELECTOR).should("not.exist");
            });
    }

    waitForMainLoading() {
        this.getElement().find("main-loading").should("not.exist");
        return this;
    }
}
