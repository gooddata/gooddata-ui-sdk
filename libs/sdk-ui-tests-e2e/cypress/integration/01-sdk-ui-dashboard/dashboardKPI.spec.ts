// (C) 2022 GoodData Corporation

import * as Navigation from "../../tools/navigation";
import { EditMode } from "../../tools/editMode";
import { Widget } from "../../tools/widget";
import { KpiConfiguration, KPIMeasureDropdown } from "../../tools/kpiConfiguration";
import { DateFilter, RelativePreset } from "../../tools/dateFilter";
import { DateFilterRelativeForm } from "../../tools/dateFilterRelativeForm";

Cypress.Cookies.defaults({
    preserve: ["GDCAuthTT", "GDCAuthSTT", "_csrfToken"],
});

Cypress.on("uncaught:exception", (error) => {
    console.error("Uncaught exception cause", error);
    return false;
});

Cypress.Cookies.debug(true);

const editMode = new EditMode();
const widget = new Widget(0);
const dateFilter = new DateFilter();
const kpiConfiguration = new KpiConfiguration(0);
const kpiMeasureDropdown = new KPIMeasureDropdown();

beforeEach(() => {
    cy.login();
    Navigation.visit("dashboard/kpis");
});

describe("KPI POP", { tags: ["pre-merge_isolated_bear"] }, () => {
    it("Check newly added KPI has POP section", () => {
        widget.getKPI().hasPOPSection();

        editMode.edit();
        widget.getKPI().hasPOPSection();
    });

    it("Check KPI without comparison", () => {
        const widget = new Widget(4);
        widget.getKPI().hasPOPSection(false);

        editMode.edit();
        widget.getKPI().hasPOPSection(false);
    });

    it("Check KPI POP section", () => {
        editMode.edit();

        const kpi = widget.getKPI().hasCompareTitle("prev. period");

        cy.fixture("kpiPOPProvider").then((data) => {
            data.forEach(
                (filter: { comparisonType: string; dateFilter: RelativePreset; kpiPOPTitle: string }) => {
                    kpi.clickValue();
                    kpiConfiguration
                        .openComparisonDropdown()
                        .chooseComparison(filter.comparisonType)
                        .clickOutside();
                    dateFilter.open().selectRelativePreset(filter.dateFilter).apply();

                    kpi.hasCompareTitle(filter.kpiPOPTitle);
                },
            );
        });
    });

    it("Check KPI POP section when filtering by floating range", () => {
        editMode.edit();
        const kpi = widget.getKPI().clickValue();

        kpiConfiguration
            .openComparisonDropdown()
            .chooseComparison("Same period in previous year")
            .clickOutside();
        dateFilter.open().selectFloatingRange();

        const relativeForm = new DateFilterRelativeForm();

        relativeForm
            .selectTab("year")
            .typeIntoFromInput("9{downarrow}{enter}")
            .typeIntoToInput("2{downarrow}{enter}");

        dateFilter.apply().subtitleHasValue("From 9 to 2 years ago");
        kpi.hasPOPSection();
    });
});

describe("KPI metric dropdown", { tags: ["pre-merge_isolated_bear"] }, () => {
    it("Check search string reset after dropdown toggle", () => {
        editMode.edit();

        widget.getKPI().clickValue();
        kpiConfiguration.toggleMeasureDropdown();
        kpiMeasureDropdown.find("amount");

        kpiConfiguration.toggleMeasureDropdown().toggleMeasureDropdown();
        kpiMeasureDropdown.searchBoxIsEmpty();
    });

    it("Check search string reset after item select", () => {
        editMode.edit();

        widget.getKPI().clickValue();
        kpiConfiguration.toggleMeasureDropdown().chooseMeasure("Amount");

        kpiConfiguration.toggleMeasureDropdown();
        kpiMeasureDropdown.searchBoxIsEmpty();
    });

    it("Check no matching message", () => {
        editMode.edit();

        widget.getKPI().clickValue();
        kpiConfiguration.toggleMeasureDropdown();
        kpiMeasureDropdown.find("abc").noMatchingData();
    });
});

describe("KPI metric formatting", { tags: ["pre-merge_isolated_bear"] }, () => {
    it("Test custom metric formatting", () => {
        editMode.edit();

        const kpi = widget.getKPI().clickValue();

        cy.fixture("kpiFormatProvider").then((data) => {
            data.forEach((format: { metricName: string; value: string }) => {
                kpiConfiguration.toggleMeasureDropdown().chooseMeasure(format.metricName);
                kpi.hasValue(format.value);
            });
        });
    });
});
