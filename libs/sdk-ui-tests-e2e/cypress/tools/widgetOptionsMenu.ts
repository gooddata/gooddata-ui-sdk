// (C) 2021-2025 GoodData Corporation

import { type Widget } from "./widget";

export class WidgetOptionsMenu {
    constructor(private widget: Widget) {}

    getButtonElement() {
        return this.widget.getElement();
    }

    open() {
        this.getButtonElement().find(".dash-item-content .gd-absolute-row").click();
        return this;
    }

    getElement() {
        return cy.get(".s-edit-insight-config");
    }
}
