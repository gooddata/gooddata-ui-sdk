// (C) 2019-2022 GoodData Corporation
import { withTestConfig } from "../../tools/configure";
import { PLUGIN_8_8_0_CONFIG, PLUGIN_LATEST_CONFIG } from "../../support/constants";

describe("Widgets", () => {
    describe("8.8.0", () => {
        beforeEach(() => {
            cy.login();
            withTestConfig(PLUGIN_8_8_0_CONFIG);
        });

        it("should cover custom widgets API", () => {
            shouldAddCustomWidget();
        });

        it("should cover insight widgets API", () => {
            shouldCustomizeInsightWidgetWithTag();
            shouldCustomizeInsightWidgetWithCustomProvider();
            shouldCustomizeInsightWidgetWithCustomDecorator();
        });

        it("should cover kpi widgets API", () => {
            shouldCustomizeKpiWidgetWithCustomProvider();
            shouldCustomizeKpiWidgetWithCustomDecorator();
        });
    });

    describe("latest", () => {
        beforeEach(() => {
            cy.login();
            withTestConfig(PLUGIN_LATEST_CONFIG);
        });

        it("should cover custom widgets API", () => {
            shouldAddCustomWidget();
        });

        it("should cover insight widgets API", () => {
            shouldCustomizeInsightWidgetWithTag();
            shouldCustomizeInsightWidgetWithCustomProvider();
            shouldCustomizeInsightWidgetWithCustomDecorator();
        });

        it("should cover kpi widgets API", () => {
            shouldCustomizeKpiWidgetWithCustomProvider();
            shouldCustomizeKpiWidgetWithCustomDecorator();
        });
    });
});

// customize.customWidgets().addCustomWidget()
function shouldAddCustomWidget() {
    cy.get(".s-custom-widget").should("exist");
}

// customize.insightWidgets().withTag()
function shouldCustomizeInsightWidgetWithTag() {
    cy.get(".s-custom-tag-insight-widget").should("exist");
}

// customize.insightWidgets().withCustomProvider()
function shouldCustomizeInsightWidgetWithCustomProvider() {
    cy.get(".s-custom-insight-widget").should("exist");
}

// customize.kpiWidgets().withCustomDecorator()
function shouldCustomizeInsightWidgetWithCustomDecorator() {
    cy.get(".s-decorated-insight-widget").should("exist");
}

// customize.kpiWidgets().withCustomProvider()
function shouldCustomizeKpiWidgetWithCustomProvider() {
    cy.get(".s-custom-kpi-widget").should("exist");
}

// customize.kpiWidgets().withCustomDecorator()
function shouldCustomizeKpiWidgetWithCustomDecorator() {
    cy.get(".s-decorated-kpi-widget").should("exist");
}
