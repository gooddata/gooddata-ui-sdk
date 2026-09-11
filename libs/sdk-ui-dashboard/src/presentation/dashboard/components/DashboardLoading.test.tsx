// (C) 2026 GoodData Corporation

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContractExpired, UnexpectedError } from "@gooddata/sdk-backend-spi";

import { render } from "../tests/render.test.utils.js";

import { DashboardLoading } from "./DashboardLoading.js";

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

    it("should mirror the trial lock when a trial contract expired", async () => {
        render(<DashboardLoading />, {
            state: { loading: { loading: false, error: new ContractExpired("TRIAL") } },
        });

        expect(await screen.findByText("Your trial has ended.")).toBeTruthy();
        expect(
            screen.getByText("Contact us if you would like to continue using GoodData Cloud."),
        ).toBeTruthy();
        expect(screen.getByRole("button", { name: "Contact us" })).toBeTruthy();
    });

    it("should mirror the non-trial lock and offer no way out when a paid contract expired", async () => {
        render(<DashboardLoading />, {
            state: { loading: { loading: false, error: new ContractExpired("GROWTH") } },
        });

        expect(await screen.findByText("Your access is locked.")).toBeTruthy();
        expect(screen.getByText("Contact the account administrator to regain access.")).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Contact us" })).toBeNull();
    });

    it("should keep the message of any other load failure", async () => {
        render(<DashboardLoading />, {
            state: { loading: { loading: false, error: new UnexpectedError("Dashboard not found") } },
        });

        expect(await screen.findByText("Dashboard not found")).toBeTruthy();
    });
});
