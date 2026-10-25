// (C) 2020-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { hideDialog } from "../actions/dialogs_actions.js";
import { reportTitleChange } from "../actions/report_actions.js";
import { saveReportCheck } from "../actions/save_actions.js";
import { getSourceDashboardId, isAllowedDashboardLinks } from "../selectors/route_selector.js";
import { saveReportFromKDDialogSelector } from "../selectors/save_report_from_kd_dialog_selector.js";
import { analyticalDashboardUriFactorySelector } from "../selectors/uri_selector.js";
import { type IInsightUsageOnDashboard } from "../store/insight_usage/insight_usage_state.js";
import { createAnalyticalDashboard } from "../tests/constants.test.helpers.js";
import { withIntl } from "../utils/with_intl.js";

import { dialogClickCancel, dialogClickSubmit } from "./dialog_utils.js";
import { SaveReportFromKDDialog } from "./SaveReportFromKDDialog.js";

vi.hoisted(() => {
    vi.resetModules();
});

const useSelectorMock = vi.hoisted(() => vi.fn());
const dispatchMock = vi.hoisted(() => vi.fn());

vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    return {
        ...actual,
        useSelector: (selector: unknown) => useSelectorMock(selector),
        useDispatch: () => dispatchMock,
    };
});

afterAll(() => {
    // The dialog pulls in saveReportFromKD/DashboardItem; drop it from the shared (isolate:false)
    // module registry so sibling files do not reuse the copy bound to the mocked useSelector.
    vi.resetModules();
});

const EMPTY_INSIGHT_USAGE: IInsightUsageOnDashboard = {
    accessibleDashboards: [],
    allDashboards: [],
    inaccessibleDashboardsCount: 0,
    allDashboardsCount: 0,
};

describe("Test SaveReportFromKDDialog", () => {
    interface ISelectorValues {
        insightUsedOnDashboards?: IInsightUsageOnDashboard;
        openSaveReportFromKD?: boolean;
        editingReportTitle?: string;
        isSaveAsNewReportOnly?: boolean;
        canCreateCopy?: boolean;
    }

    function renderComponent({
        insightUsedOnDashboards = EMPTY_INSIGHT_USAGE,
        openSaveReportFromKD = true,
        editingReportTitle = "Insight Title",
        isSaveAsNewReportOnly = false,
        canCreateCopy = true,
    }: ISelectorValues = {}) {
        useSelectorMock.mockImplementation((selector: unknown) => {
            if (selector === saveReportFromKDDialogSelector) {
                return {
                    insightUsedOnDashboards,
                    openSaveReportFromKD,
                    editingReportTitle,
                    isSaveAsNewReportOnly,
                    canCreateCopy,
                };
            }
            // selectors read by the nested DashboardItem
            if (selector === isAllowedDashboardLinks) {
                return false;
            }
            if (selector === getSourceDashboardId) {
                return undefined;
            }
            if (selector === analyticalDashboardUriFactorySelector) {
                return (id: string) => `/dashboard/${id}`;
            }
            return undefined;
        });

        const Wrapped = withIntl(SaveReportFromKDDialog);
        return render(<Wrapped />);
    }

    beforeEach(() => {
        vi.useFakeTimers();
        useSelectorMock.mockReset();
        dispatchMock.mockReset();
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    it("should not render the dialog when the openSaveReportFromKD doesn't active", () => {
        const { container } = renderComponent({
            openSaveReportFromKD: false,
        });

        expect(container.querySelectorAll(".s-save-report-from-kd-dialog")).toHaveLength(0);
    });

    it("should render the dialog correctly", () => {
        renderComponent();
        const confirmDialog = document.querySelector(".s-save-report-from-kd-dialog");
        const saveOption = confirmDialog.querySelector<HTMLInputElement>(".s-save-option");

        expect(confirmDialog).toBeInTheDocument();
        expect(confirmDialog.querySelector(".s-dialog-submit-button").textContent).toBe("Save");
        expect(saveOption.disabled).toBeFalsy();
        expect(saveOption.checked).toBeFalsy();

        expect(confirmDialog.querySelectorAll(".s-view-usage")).toHaveLength(0);

        dialogClickSubmit(confirmDialog);
        expect(dispatchMock).toHaveBeenCalledWith(saveReportCheck(false, true));
    });

    it("should only show the dialog in the create new mode, and display the tooltip on the disabled option", () => {
        renderComponent({
            isSaveAsNewReportOnly: true,
        });
        const confirmDialog = document.querySelector(".s-save-report-from-kd-dialog");
        const saveOption = confirmDialog.querySelector<HTMLInputElement>(".s-save-option");
        const input = confirmDialog.querySelector<HTMLInputElement>(".s-report-name-input input");

        expect(confirmDialog.querySelector(".s-dialog-submit-button").textContent).toBe("Create copy");
        expect(saveOption.disabled).toBeFalsy();
        expect(saveOption.checked).toBeTruthy();

        expect(input).toBeInTheDocument();
        expect(input.value).toEqual(`Copy of Insight Title`);

        dialogClickSubmit(confirmDialog);
        expect(dispatchMock).toHaveBeenCalledWith(reportTitleChange("Copy of Insight Title"));
        expect(dispatchMock).toHaveBeenCalledWith(saveReportCheck(true, true));
    });

    it("should offer only saving on all dashboards to a user who may not create visualizations", () => {
        renderComponent({ canCreateCopy: false });

        const confirmDialog = document.querySelector(".s-save-report-from-kd-dialog");
        expect(confirmDialog.querySelector(".s-save-option")).toBeNull();
        expect(confirmDialog.querySelector(".s-dialog-submit-button").textContent).toBe("Save");

        dialogClickSubmit(confirmDialog);
        expect(dispatchMock).toHaveBeenCalledWith(saveReportCheck(false, true));
    });

    it("should hide dialog when clicking the cancel button", () => {
        renderComponent();
        dialogClickCancel(document.querySelector(".s-save-report-from-kd-dialog"));
        expect(dispatchMock).toHaveBeenCalledTimes(1);
        expect(dispatchMock).toHaveBeenCalledWith(hideDialog());
    });

    describe("insight usage on dashboards", () => {
        it("should display the view usage dashboards when the usage dashboards list has value", () => {
            renderComponent({
                insightUsedOnDashboards: {
                    accessibleDashboards: [createAnalyticalDashboard("Sale", "Bee", 1)],
                    allDashboards: [createAnalyticalDashboard("Sale", "Bee", 1)],
                    inaccessibleDashboardsCount: 0,
                    allDashboardsCount: 1,
                },
            });

            expect(document.querySelectorAll(".s-insight-usage-dashboard-item")).toHaveLength(1);
        });

        it("should render expected dialog content when insight is used only on one dashboard that is not accessible", () => {
            renderComponent({
                insightUsedOnDashboards: {
                    accessibleDashboards: [],
                    allDashboards: [createAnalyticalDashboard("Sale", "Bee", 1)],
                    inaccessibleDashboardsCount: 1,
                    allDashboardsCount: 1,
                },
            });

            expect(document.querySelectorAll(".s-insight-usage-dashboard-item")).toHaveLength(0);
            expect(document.querySelector(".s-kd-save-dialog-usage-inaccessible").textContent).toEqual(
                "Dashboard is not shared with you.",
            );
        });

        it("should render expected dialog content when insight is used also on on dashboards that is not accessible", () => {
            renderComponent({
                insightUsedOnDashboards: {
                    accessibleDashboards: [],
                    allDashboards: [
                        createAnalyticalDashboard("Sale", "Bee", 1),
                        createAnalyticalDashboard("Sale 2", "Fee", 2),
                    ],
                    inaccessibleDashboardsCount: 2,
                    allDashboardsCount: 2,
                },
            });

            expect(document.querySelectorAll(".s-insight-usage-dashboard-item")).toHaveLength(0);
            expect(document.querySelector(".s-kd-save-dialog-usage-inaccessible").textContent).toEqual(
                "Dashboards are not shared with you.",
            );
        });

        it("should render expected dialog content when some referenced dashboard are not accessible", () => {
            renderComponent({
                insightUsedOnDashboards: {
                    accessibleDashboards: [createAnalyticalDashboard("Sale", "Bee", 1)],
                    allDashboards: [
                        createAnalyticalDashboard("Sale", "Bee", 1),
                        createAnalyticalDashboard("Sale 2", "Fee", 2),
                    ],
                    inaccessibleDashboardsCount: 1,
                    allDashboardsCount: 2,
                },
            });

            expect(document.querySelectorAll(".s-insight-usage-dashboard-item")).toHaveLength(1);
            expect(document.querySelector(".s-kd-save-dialog-usage-inaccessible").textContent).toEqual(
                "and 1 more not shared with you.",
            );
        });

        it("should render expected dialog content when insight is used also on multiple dashboards are not accessible", () => {
            renderComponent({
                insightUsedOnDashboards: {
                    accessibleDashboards: [createAnalyticalDashboard("Sale", "Bee", 1)],
                    allDashboards: [
                        createAnalyticalDashboard("Sale", "Bee", 1),
                        createAnalyticalDashboard("Sale 2", "Fee", 2),
                        createAnalyticalDashboard("Sale 3", "Qee", 3),
                    ],
                    inaccessibleDashboardsCount: 2,
                    allDashboardsCount: 3,
                },
            });

            expect(document.querySelectorAll(".s-insight-usage-dashboard-item")).toHaveLength(1);
            expect(document.querySelector(".s-kd-save-dialog-usage-inaccessible").textContent).toEqual(
                "and 2 more not shared with you.",
            );
        });
    });
});
