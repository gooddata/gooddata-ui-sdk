// (C) 2020-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { getSourceDashboardId, isAllowedDashboardLinks } from "../../selectors/route_selector.js";
import { analyticalDashboardUriFactorySelector } from "../../selectors/uri_selector.js";
import { type IInsightUsageOnDashboardItem } from "../../store/insight_usage/insight_usage_state.js";
import { withIntl } from "../../utils/with_intl.js";

import { DashboardItem } from "./DashboardItem.js";

vi.hoisted(() => {
    vi.resetModules();
});

const useSelectorMock = vi.hoisted(() => vi.fn());

vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    return {
        ...actual,
        useSelector: (selector: unknown) => useSelectorMock(selector),
    };
});

afterAll(() => {
    // Drop DashboardItem (and the rest of this file's graph) from the shared (isolate:false) module
    // registry so sibling files do not reuse the copy bound to the mocked useSelector.
    vi.resetModules();
});

describe("DashboardItem", () => {
    const Wrapped = withIntl(DashboardItem);

    const dashboard: IInsightUsageOnDashboardItem = {
        title: "Dashboard 0",
        id: "897GwbW",
    };

    function renderComponent({
        isAllowLinkToDashboard = true,
        sourceDashboardId = dashboard.id,
    }: {
        isAllowLinkToDashboard?: boolean;
        sourceDashboardId?: string;
    }) {
        useSelectorMock.mockImplementation((selector: unknown) => {
            switch (selector) {
                case isAllowedDashboardLinks:
                    return isAllowLinkToDashboard;
                case getSourceDashboardId:
                    return sourceDashboardId;
                case analyticalDashboardUriFactorySelector:
                    return (v: string) => v;
                default:
                    return undefined;
            }
        });

        return render(<Wrapped dashboard={dashboard} />);
    }

    beforeEach(() => {
        useSelectorMock.mockReset();
    });

    it("should render the dashboard item as a link when the isAllowLinkToDashboard is true", () => {
        const { container } = renderComponent({
            isAllowLinkToDashboard: true,
            sourceDashboardId: "abc",
        });
        const item = container.querySelectorAll("a");

        expect(item).toHaveLength(1);
        expect(item[0]).toHaveAttribute("href", dashboard.id);
    });

    it("should render the dashboard item as text when the isAllowLinkToDashboard is false", () => {
        const { container } = renderComponent({
            isAllowLinkToDashboard: false,
            sourceDashboardId: "abc",
        });
        const item = container.querySelectorAll("a");

        expect(item).toHaveLength(0);
    });

    it.each([
        ["link", "the same with the dashboard id", "897GwbW"],
        ["text", "the different with the dashboard id", "Ois876Gi"],
    ])(
        "should render the dashboard item as a %s when the sourceDashboardId is %s",
        (_desc: string, _text: string, sourceDashboardId: string) => {
            const { container } = renderComponent({
                isAllowLinkToDashboard: true,
                sourceDashboardId,
            });
            expect(container.querySelectorAll("a")).toHaveLength(sourceDashboardId === dashboard.id ? 0 : 1);
        },
    );
});
