// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { afterEach, describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IAnalyticalWorkspace, type IInsightReferencing } from "@gooddata/sdk-backend-spi";
import { type IListedDashboard, type IMetadataObject, idRef } from "@gooddata/sdk-model";

import { deleteReportConfirmation } from "../actions/delete_actions.js";
import { adoptHostBackend, resetBackend } from "../backend.js";
import { createStore } from "../create_store.js";
import { withIntl } from "../utils/with_intl.js";

import { DeleteReportDialog } from "./DeleteReportDialog.js";

function metadataObject(
    type: "analyticalDashboard" | "document",
    id: string,
    title: string,
): IMetadataObject {
    return {
        id,
        ref: idRef(id, type),
        type,
        title,
        uri: "",
        description: "",
        production: false,
        unlisted: false,
        deprecated: false,
    };
}

function useBackend(referencing: IInsightReferencing, userDashboards: IListedDashboard[] = []) {
    const instance = dummyBackend();
    vi.spyOn(instance, "workspace").mockReturnValue({
        insights: () => ({ getInsightReferencingObjects: () => Promise.resolve(referencing) }),
        dashboards: () => ({ getDashboards: () => Promise.resolve(userDashboards) }),
    } as unknown as IAnalyticalWorkspace);
    adoptHostBackend({ instance });
}

function renderDialog() {
    const { store } = createStore();
    store.dispatch(deleteReportConfirmation(idRef("chart", "insight"), { title: "Revenue by region" }));
    const Wrapped = withIntl(DeleteReportDialog);
    return render(
        <Provider store={store}>
            <Wrapped />
        </Provider>,
    );
}

function isDeleteDisabled() {
    return document.querySelector(".s-dialog-submit-button")!.getAttribute("aria-disabled") === "true";
}

describe("DeleteReportDialog", () => {
    afterEach(() => {
        resetBackend();
        vi.restoreAllMocks();
    });

    it("blocks the delete of a visualization only a report uses, and links the report", async () => {
        useBackend({
            analyticalDashboards: [],
            documents: [metadataObject("document", "q3/pack", "Q3 board pack")],
        });
        renderDialog();

        const message = await screen.findByText(/used in some reports\. To delete/);
        expect(message.textContent).not.toContain("dashboards");
        expect(isDeleteDisabled()).toBe(true);
        expect(screen.getByText(/The visualization is used in/).textContent).toContain("1 report");

        const toggle = document.querySelector(".s-delete-report-dialog-usage-more button")!;
        expect(toggle.textContent).toBe("Show more");
        expect(toggle.getAttribute("aria-expanded")).toBe("false");
        fireEvent.click(toggle);
        expect(toggle.getAttribute("aria-expanded")).toBe("true");
        expect(document.querySelector("h4.gd-delete-report-dialog-usage-group-heading")).toBeNull();

        const link = screen.getByText("Q3 board pack").closest("a")!;
        expect(link.getAttribute("href")).toMatch(/\/reports\/document\/q3%2Fpack$/);
    });

    it("groups dashboards and reports in one message when both use the visualization", async () => {
        useBackend(
            {
                analyticalDashboards: [metadataObject("analyticalDashboard", "board", "Board")],
                documents: [metadataObject("document", "pack", "Q3 board pack")],
            },
            [{ identifier: "board" } as IListedDashboard],
        );
        renderDialog();

        expect(await screen.findByText(/used in dashboards and reports/)).toBeTruthy();
        expect(screen.getByText(/The visualization is used in/).textContent).toContain("2 places");
        expect(document.querySelectorAll(".s-delete-report-dialog-usage-more")).toHaveLength(1);
        expect(isDeleteDisabled()).toBe(true);

        fireEvent.click(document.querySelector(".s-delete-report-dialog-usage-more button")!);
        const headings = document.querySelectorAll("h4.gd-delete-report-dialog-usage-group-heading");
        expect(Array.from(headings, (heading) => heading.textContent)).toEqual([
            "Dashboards (1)",
            "Reports (1)",
        ]);
        expect(screen.getByText("Board")).toBeTruthy();
        expect(screen.getByText("Q3 board pack")).toBeTruthy();
    });

    it("keeps the dashboard message when only dashboards use the visualization", async () => {
        useBackend({ analyticalDashboards: [metadataObject("analyticalDashboard", "board", "Board")] });
        renderDialog();

        expect(await screen.findByText(/used on some dashboards/)).toBeTruthy();
        expect(screen.queryByText(/The visualization is used in/)).toBeNull();
        expect(isDeleteDisabled()).toBe(true);
    });

    it("allows the delete of a visualization nothing uses", async () => {
        useBackend({ analyticalDashboards: [], documents: [] });
        renderDialog();

        expect(
            await screen.findByText("The visualization is not used on any dashboard or in any report."),
        ).toBeTruthy();
        expect(isDeleteDisabled()).toBe(false);
    });
});
