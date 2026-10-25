// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { afterAll, describe, expect, it, vi } from "vitest";

import { type reportTitleSelector } from "../selectors/report_title_selector.js";
import { withIntl } from "../utils/with_intl.js";
import { withRedux } from "../utils/with_redux.js";

import { ReportTitle } from "./ReportTitle.js";

type ReportTitleStateProps = ReturnType<typeof reportTitleSelector>;

vi.hoisted(() => {
    vi.resetModules();
});

const stateProps = vi.hoisted(() => ({ current: null as unknown }));

vi.mock("../selectors/report_title_selector.js", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("../selectors/report_title_selector.js");
    return {
        ...actual,
        reportTitleSelector: () => stateProps.current,
    };
});

afterAll(() => {
    // Drop this file's mocked selector from the shared (isolate:false) registry so it does not leak
    // into sibling files that import the real one (e.g. selectors/report_title_selector.test.ts).
    vi.resetModules();
});

describe("ReportTitle", () => {
    function renderReportTitle(userStateProps: Partial<ReportTitleStateProps>) {
        const defaultStateProps: ReportTitleStateProps = {
            currentTitle: "",
            currentDescription: "",
            isTitleDefined: false,
            isReportLocked: false,
            canEditTitle: true,
            isEnabledUsages: false,
            isSaveDisabled: false,
        };

        // the same object reference must be returned on every selector call
        stateProps.current = { ...defaultStateProps, ...userStateProps };

        const Wrapped = withRedux(withIntl(ReportTitle));

        return render(<Wrapped />);
    }

    describe("Report title", () => {
        it("should render EditableLabel with label foo", () => {
            const currentTitle = "foo";
            const { container } = renderReportTitle({
                currentTitle,
            });

            expect(container.querySelector("div.s-report-title").textContent).toEqual(currentTitle);
        });

        describe("Unsaved changes", () => {
            it.each([
                ["render", false, 1],
                ["NOT render", true, 0],
            ])(
                'should %s "Unsaved changes" icon when isSaveDisabled value is %s',
                (_s: string, isSaveDisabled: boolean, expected: number) => {
                    const { container } = renderReportTitle({
                        isSaveDisabled,
                    });
                    expect(container.querySelectorAll(".unsaved-notification")).toHaveLength(expected);
                },
            );
        });

        describe("InsightUsageOnDashboards", () => {
            it.each([
                ["render", true, 1],
                ["NOT render", false, 0],
            ])(
                'should %s "InsightUsageOnDashboards" icon when isEnabledUsages value is %s',
                (_s: string, isEnabledUsages: boolean, expected: number) => {
                    const { container } = renderReportTitle({
                        isEnabledUsages,
                    });
                    expect(container.querySelectorAll(".s-gd-insight-usage-on-dashboards")).toHaveLength(
                        expected,
                    );
                },
            );
        });
    });
});
