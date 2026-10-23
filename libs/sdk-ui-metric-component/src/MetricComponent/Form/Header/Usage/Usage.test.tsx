// (C) 2007-2026 GoodData Corporation

import { act, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { type IInsight, type IMeasureMetadataObject } from "@gooddata/sdk-model";
import { WorkspaceProvider } from "@gooddata/sdk-ui";

import { mountWithIntlComponent } from "../../../../tests/render.test.utils.js";
import { emptyMetric } from "../../../metric/emptyMetric.js";

import { Usage } from "./Usage.js";

const metric = {
    ...emptyMetric,
    title: "Testing metric",
    ref: {
        identifier: "id",
        type: "measure",
    },
    uri: "uri",
    id: "id",
} as IMeasureMetadataObject;
const insight = {
    insight: {
        identifier: "insight",
        uri: "uri",
        ref: {
            identifier: "insight",
            type: "insight",
        },
        title: "Testing insight",
    },
} as IInsight;

function renderUsage(measures: Array<IMeasureMetadataObject>, insights: Array<IInsight>) {
    return mountWithIntlComponent(
        <WorkspaceProvider workspace="test">
            <Usage data={{ measures, insights }} />
        </WorkspaceProvider>,
    );
}

describe("Usage", () => {
    it("should render with one metric and one insight", async () => {
        await act(async () => {
            renderUsage([metric], [insight]);
        });

        expect(screen.getByText("used in:")).toBeInTheDocument();
        expect(screen.getByText("1 metric, 1 visualization")).toBeInTheDocument();
    });

    it("should render with more metrics and more insights", async () => {
        await act(async () => {
            renderUsage([metric, metric], [insight, insight]);
        });

        expect(screen.getByText("used in:")).toBeInTheDocument();
        expect(screen.getByTestId("2_metrics__2_visualizations")).toBeInTheDocument();
        expect(screen.getByText("2 metrics, 2 visualizations")).toBeInTheDocument();
    });

    it("should render and open list", async () => {
        await act(async () => {
            renderUsage([metric, metric], [insight, insight]);
        });

        expect(document.querySelectorAll(".gd-menu-item").length).toBe(0);

        await act(async () => {
            const buttons = screen.getAllByTestId("2_metrics__2_visualizations");
            fireEvent.click(buttons[0]);
        });

        expect(document.querySelectorAll(".gd-menu-item").length).toBe(6);

        expect(document.querySelectorAll(".gd-menu-item")[0].innerHTML).toContain("Metrics (2)");
        expect(document.querySelectorAll(".gd-menu-item")[1].innerHTML).toContain("Testing metric");
        expect(document.querySelectorAll(".gd-menu-item")[2].innerHTML).toContain("Testing metric");
        expect(document.querySelectorAll(".gd-menu-item")[3].innerHTML).toContain("Visualizations (2)");
        expect(document.querySelectorAll(".gd-menu-item")[4].innerHTML).toContain("Testing insight");
        expect(document.querySelectorAll(".gd-menu-item")[5].innerHTML).toContain("Testing insight");
    });

    it("should render and open list, close metrics, close insights", async () => {
        await act(async () => {
            renderUsage([metric, metric], [insight, insight]);
        });

        expect(document.querySelectorAll(".gd-menu-item").length).toBe(0);

        await act(async () => {
            const buttons = screen.getAllByTestId("2_metrics__2_visualizations");
            fireEvent.click(buttons[0]);
        });

        expect(document.querySelectorAll(".gd-menu-item").length).toBe(6);
        expect(document.querySelectorAll(".gd-menu-item")[0].innerHTML).toContain("Metrics (2)");
        expect(document.querySelectorAll(".gd-menu-item")[1].innerHTML).toContain("Testing metric");
        expect(document.querySelectorAll(".gd-menu-item")[2].innerHTML).toContain("Testing metric");
        expect(document.querySelectorAll(".gd-menu-item")[3].innerHTML).toContain("Visualizations (2)");
        expect(document.querySelectorAll(".gd-menu-item")[4].innerHTML).toContain("Testing insight");
        expect(document.querySelectorAll(".gd-menu-item")[5].innerHTML).toContain("Testing insight");

        await act(async () => {
            fireEvent.click(document.querySelectorAll(".gd-menu-item")[0]);
        });

        expect(document.querySelectorAll(".gd-menu-item").length).toBe(4);
        expect(document.querySelectorAll(".gd-menu-item")[0].innerHTML).toContain("Metrics (2)");
        expect(document.querySelectorAll(".gd-menu-item")[1].innerHTML).toContain("Visualizations (2)");
        expect(document.querySelectorAll(".gd-menu-item")[2].innerHTML).toContain("Testing insight");
        expect(document.querySelectorAll(".gd-menu-item")[3].innerHTML).toContain("Testing insight");

        await act(async () => {
            fireEvent.click(document.querySelectorAll(".gd-menu-item")[1]);
        });

        expect(document.querySelectorAll(".gd-menu-item").length).toBe(2);
        expect(document.querySelectorAll(".gd-menu-item")[0].innerHTML).toContain("Metrics (2)");
        expect(document.querySelectorAll(".gd-menu-item")[1].innerHTML).toContain("Visualizations (2)");

        await act(async () => {
            fireEvent.click(document.querySelectorAll(".gd-menu-item")[0]);
            fireEvent.click(document.querySelectorAll(".gd-menu-item")[1]);
        });

        expect(document.querySelectorAll(".gd-menu-item").length).toBe(6);
        expect(document.querySelectorAll(".gd-menu-item")[0].innerHTML).toContain("Metrics (2)");
        expect(document.querySelectorAll(".gd-menu-item")[1].innerHTML).toContain("Testing metric");
        expect(document.querySelectorAll(".gd-menu-item")[2].innerHTML).toContain("Testing metric");
        expect(document.querySelectorAll(".gd-menu-item")[3].innerHTML).toContain("Visualizations (2)");
        expect(document.querySelectorAll(".gd-menu-item")[4].innerHTML).toContain("Testing insight");
        expect(document.querySelectorAll(".gd-menu-item")[5].innerHTML).toContain("Testing insight");
    });
});
