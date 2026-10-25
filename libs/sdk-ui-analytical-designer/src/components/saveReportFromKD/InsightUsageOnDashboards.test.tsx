// (C) 2020-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createAnalyticalDashboard } from "../../tests/constants.test.helpers.js";
import { withIntl } from "../../utils/with_intl.js";
import { withRedux } from "../../utils/with_redux.js";

import { Component, type InsightUsageOnDashboardsProps } from "./InsightUsageOnDashboardsList.js";

// This file drives the component through a real store, so it must not reuse module instances that a
// sibling file (isolate:false shares the module graph) evaluated while "react-redux" was mocked -
// DashboardItem would keep the mocked useSelector and get undefined for every selector.
vi.hoisted(() => {
    vi.resetModules();
});

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
        expect(container.querySelector("summary").textContent).toEqual("View usage (3 dashboards)");
    });
});
