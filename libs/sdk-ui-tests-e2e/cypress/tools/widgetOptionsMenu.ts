// (C) 2021-2022 GoodData Corporation

import { Widget } from "./widget";

export class WidgetOptionsMenu {
    constructor(private widget: Widget) {}

    getButtonElement() {
        return this.widget.getElement().find(".s-dash-item-action-widget-options");
    }

    open() {
        this.getButtonElement().realHover().click({ force: true });
        return this;
    }

    getElement() {
        return cy.get(".s-edit-insight-config");
    }

    getItemElements() {
        return this.getElement().find(".gd-menu-item");
    }

    getExportToXLSXButtonElement() {
        return this.getElement().find(".s-options-menu-export-xlsx");
    }

    getExportToCSVButtonElement() {
        return this.getElement().find(".s-options-menu-export-csv");
    }

    clickExportToXLSX() {
        this.getExportToXLSXButtonElement().click({ force: true });
        return this;
    }

    getScheduleExportButtonElement() {
        return this.getElement().find(".s-options-menu-schedule-export");
    }

    clickScheduleExport() {
        this.getScheduleExportButtonElement().click({ force: true });
        return this;
    }

    getExploreButtonElement() {
        return this.getElement().find(".s-options-menu-explore-insight");
    }

    clickExplore() {
        this.getExploreButtonElement().click({ force: true });
        return this;
    }
}
