// (C) 2020-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createAnalyticalDashboard } from "../../tests/constants.test.helpers.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import { Component, type InsightUsageOnDashboardsProps } from "./InsightUsageOnDashboardsList.js";

// This file drives the component through a real store, so it must not reuse module instances that a

describe("InsightUsageOnDashboards", () => {
    const defaultProps: InsightUsageOnDashboardsProps = {
        insightUsedOnDashboards: {
            accessibleDashboards: [
                createAnalyticalDashboard("Dashboard 0", "897GwbW", 0),
                createAnalyticalDashboard("Dashboard 1", "IUsdi987ei", 0),
                createAnalyticalDashboard("Dashboard 2", "KHiuh27", 0),
            ],
            allDashboards: [
                createAnalyticalDashboard("Dashboard 0", "897GwbW", 0),
                createAnalyticalDashboard("Dashboard 1", "IUsdi987ei", 0),
                createAnalyticalDashboard("Dashboard 2", "KHiuh27", 0),
            ],
            inaccessibleDashboardsCount: 0,
            allDashboardsCount: 3,
        },
        insightUsedInDocuments: {
            accessibleDocuments: [],
            inaccessibleDocumentsCount: 0,
            allDocumentsCount: 0,
        },
    };

    function renderComponent(customProps: Partial<InsightUsageOnDashboardsProps> = {}) {
        const WrappedComponent = withIntl(withRedux(Component));
        return render(<WrappedComponent {...defaultProps} {...customProps} />);
    }

    it("should the list dashboard item be empty", () => {
        const { container } = renderComponent({
            insightUsedOnDashboards: {
                accessibleDashboards: [],
                allDashboards: [],
                inaccessibleDashboardsCount: 0,
                allDashboardsCount: 0,
            },
        });
        expect(container.querySelectorAll(".s-insight-usage-dashboard-item")).toHaveLength(0);
    });

    it("should render the dashboard items", () => {
        const { container } = renderComponent();
        expect(container.querySelectorAll(".s-insight-usage-dashboard-item")).toHaveLength(3);
        expect(
            Array.from(container.querySelectorAll("summary")).map((summary) => summary.textContent),
        ).toEqual(["Dashboards (3)"]);
    });

    it("should render the document items after the dashboards", () => {
        const { container } = renderComponent({
            insightUsedInDocuments: {
                accessibleDocuments: [{ id: "doc1", title: "Board pack", type: "document" }],
                inaccessibleDocumentsCount: 0,
                allDocumentsCount: 1,
            },
        });
        expect(container.querySelectorAll(".s-insight-usage-dashboard-item")).toHaveLength(3);
        expect(container.querySelector(".s-insight-usage-document-item").textContent).toEqual("Board pack");
        expect(
            Array.from(container.querySelectorAll("summary")).map((summary) => summary.textContent),
        ).toEqual(["Dashboards (3)", "Documents (1)"]);
    });

    it("should show only the documents section when no dashboard uses the visualization", () => {
        const { container } = renderComponent({
            insightUsedOnDashboards: {
                accessibleDashboards: [],
                allDashboards: [],
                inaccessibleDashboardsCount: 0,
                allDashboardsCount: 0,
            },
            insightUsedInDocuments: {
                accessibleDocuments: [
                    { id: "doc1", title: "Board pack", type: "document" },
                    { id: "doc2", title: "Weekly review", type: "document" },
                ],
                inaccessibleDocumentsCount: 0,
                allDocumentsCount: 2,
            },
        });
        expect(
            Array.from(container.querySelectorAll("summary")).map((summary) => summary.textContent),
        ).toEqual(["Documents (2)"]);
    });

    it("should count the reports the user may not open without naming them", () => {
        const { container } = renderComponent({
            insightUsedInDocuments: {
                accessibleDocuments: [{ id: "doc1", title: "Board pack", type: "document" }],
                inaccessibleDocumentsCount: 2,
                allDocumentsCount: 3,
            },
        });
        expect(
            Array.from(container.querySelectorAll("summary")).map((summary) => summary.textContent),
        ).toEqual(["Dashboards (3)", "Documents (3)"]);
        expect(container.querySelectorAll(".s-insight-usage-document-item")).toHaveLength(1);
        expect(container.querySelector(".s-kd-save-dialog-usage-inaccessible").textContent).toEqual(
            "and 2 more not shared with you.",
        );
    });
});
