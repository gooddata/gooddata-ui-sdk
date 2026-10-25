// (C) 2007-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { createAnalyticalDashboard, createListedDashboard } from "../tests/constants.test.helpers.js";
import { withMdObjectMeta } from "../tests/report_builder.test.helpers.js";
import { getInitializedState } from "../tests/state.test.helpers.js";
import { withData, withReport } from "../tests/state_builder.test.helpers.js";

import { reportTitleSelector } from "./report_title_selector.js";

describe("Report title selector test", () => {
    const DEFAULT_SELECTOR_VALUE = {
        currentTitle: "",
        currentDescription: "",
        isTitleDefined: false,
        isReportLocked: true,
        canEditTitle: false,
        isEnabledUsages: false,
        isSaveDisabled: true,
    };

    it("check default props values", () => {
        const selector = reportTitleSelector(getInitializedState());

        expect(selector).toEqual({
            ...DEFAULT_SELECTOR_VALUE,
            isReportLocked: false,
            canEditTitle: true,
        });
    });

    it("should have correct report title", () => {
        const title = "My title";

        const state = withData(getInitializedState(), { title: title });
        const selector = reportTitleSelector(state);

        expect(selector).toEqual({
            ...DEFAULT_SELECTOR_VALUE,
            currentTitle: title,
            isTitleDefined: true,
            isReportLocked: false,
            canEditTitle: true,
        });
    });

    it("should have correct report description", () => {
        const description = "My description";

        const state = withData(getInitializedState(), { summary: description });
        const selector = reportTitleSelector(state);

        expect(selector).toEqual({
            ...DEFAULT_SELECTOR_VALUE,
            currentDescription: description,
            isReportLocked: false,
            canEditTitle: true,
        });
    });

    it("should have locked flag", () => {
        const locked = 1;

        const state = withReport(getInitializedState(), {
            lastSavedObject: withMdObjectMeta(getInitializedState().report.lastSavedObject, {
                locked: locked as unknown as boolean,
            }),
        });
        const selector = reportTitleSelector(state);

        expect(selector).toEqual(DEFAULT_SELECTOR_VALUE);
    });

    it("should have isEnabledUsages", () => {
        const state = withData(withReport(getInitializedState(), { opening: false }), {
            insightUsagesOnDashboards: {
                referencedDashboards: [createAnalyticalDashboard("title", "id", 1)],
                allUserDashboards: [createListedDashboard("title", "id", 1)],
            },
        });
        const selector = reportTitleSelector(state);

        expect(selector).toEqual({
            ...DEFAULT_SELECTOR_VALUE,
            isReportLocked: false,
            canEditTitle: true,
            isEnabledUsages: true,
        });
    });
});
