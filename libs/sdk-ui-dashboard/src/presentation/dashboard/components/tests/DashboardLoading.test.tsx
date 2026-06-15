// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { render } from "../../../../../test/render.js";
import { DashboardLoading } from "../DashboardLoading.js";

describe("DashboardLoading", () => {
    it("should emit the loading export status while the dashboard is loading in export mode with enableExportTimeoutFix", () => {
        const { container } = render(
            <DashboardLoading
                config={{ initialRenderMode: "export", settings: { enableExportTimeoutFix: true } }}
            />,
        );

        const exportElement = container.querySelector("[data-export-status]");
        expect(exportElement).toHaveAttribute("data-export-status", "loading");
        expect(exportElement).toHaveAttribute("data-export-type", "dashboard");
        // the export status element is just a data carrier and must not take part in the layout
        expect(exportElement).not.toBeVisible();
        // the loading indicator itself must still be rendered
        expect(container.querySelector(".s-loading")).not.toBeNull();
    });

    it("should not emit any export status in export mode when enableExportTimeoutFix is off", () => {
        const { container } = render(<DashboardLoading config={{ initialRenderMode: "export" }} />);

        expect(container.querySelector("[data-export-status]")).toBeNull();
        expect(container.querySelector(".s-loading")).not.toBeNull();
    });

    it("should not emit any export status while the dashboard is loading outside of export mode", () => {
        const { container } = render(
            <DashboardLoading
                config={{ initialRenderMode: "view", settings: { enableExportTimeoutFix: true } }}
            />,
        );

        expect(container.querySelector("[data-export-status]")).toBeNull();
        expect(container.querySelector(".s-loading")).not.toBeNull();
    });

    it("should not emit any export status while the dashboard is loading when no render mode is set", () => {
        const { container } = render(<DashboardLoading />);

        expect(container.querySelector("[data-export-status]")).toBeNull();
    });
});
