// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { type IInsightWidget, idRef } from "@gooddata/sdk-model";

import { DefaultWidgetDeleteDialog } from "./DefaultWidgetDeleteDialog.js";

const widget: IInsightWidget = {
    type: "insight",
    insight: idRef("insight-1", "insight"),
    ref: idRef("widget-1"),
    uri: "/widget-1",
    identifier: "widget-1",
    title: "Confidential revenue",
    description: "",
    drills: [],
    ignoreDashboardFilters: [],
};

const messages = {
    "deleteWidgetDialog.headline": "Delete widget?",
    "deleteWidgetDialog.objectsMessage": "Objects associated with the widget {title} will stop working:",
    "deleteWidgetDialog.objectsMessage.restricted": "Objects associated with this widget will stop working:",
    "deleteWidgetDialog.alerts": "Alerts",
    "deleteWidgetDialog.schedules": "Schedules",
    cancel: "Cancel",
    delete: "Delete",
};

function renderDialog({ isRestricted = false }: { isRestricted?: boolean } = {}) {
    return render(
        <IntlProvider locale="en-US" messages={messages}>
            <DefaultWidgetDeleteDialog
                isVisible
                showAlertsMessage
                showSchedulesMessage={false}
                onDelete={vi.fn()}
                onCancel={vi.fn()}
                widget={widget}
                isRestricted={isRestricted}
            />
        </IntlProvider>,
    );
}

describe("DefaultWidgetDeleteDialog", () => {
    it("never names a widget the user is not allowed to see", () => {
        renderDialog({ isRestricted: true });

        expect(screen.queryByText(/Confidential revenue/)).not.toBeInTheDocument();
        expect(
            screen.getByText("Objects associated with this widget will stop working:"),
        ).toBeInTheDocument();
    });

    it("names an ordinary widget, which is what makes the warning useful", () => {
        renderDialog();

        expect(screen.getByText(/Confidential revenue/)).toBeInTheDocument();
    });
});
