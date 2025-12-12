// (C) 2022-2025 GoodData Corporation

import { Dashboard } from "../../tools/dashboards";
import { DateFilter, type RelativePreset } from "../../tools/dateFilter";
import { DateFilterRelativeForm } from "../../tools/dateFilterRelativeForm";
import { EditMode } from "../../tools/editMode";
import { KPIMeasureDropdown, KpiConfiguration } from "../../tools/kpiConfiguration";
import * as Navigation from "../../tools/navigation";
import { Widget } from "../../tools/widget";

const editMode = new EditMode();
const widget = new Widget(0);
const dateFilter = new DateFilter();
const kpiConfiguration = new KpiConfiguration(0);
const kpiMeasureDropdown = new KPIMeasureDropdown();

beforeEach(() => {
    Navigation.visit("dashboard/kpis");
});

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
describe.skip("KPI POP", { tags: ["pre-merge_isolated_bear"] }, () => {
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

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
describe.skip("KPI metric dropdown", { tags: ["pre-merge_isolated_bear"] }, () => {
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

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
describe.skip("KPI metric formatting", { tags: ["pre-merge_isolated_bear"] }, () => {
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

// Can be removed once migrated to tiger or once decided that we don't want to migrate the test.
describe.skip("KPI with alert", { tags: ["checklist_integrated_bear"] }, () => {
    //Cover ticket: RAIL-4760
    it("Dashboard should reload and render well after delete KPI has alert", () => {
        editMode.edit();
        new Widget(1).removeKPIWidget(true);
        new Dashboard().dashboardBodyExist(true);
    });
});
