// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    type IDashboardExportParameter,
    type IInsight,
    idRef,
    isExportDefinitionVisualizationObjectRequestPayload,
} from "@gooddata/sdk-model";

import { selectDashboardHiddenFilters } from "../../../../../../model/store/filtering/dashboardFilterSelectors.js";
import { selectWidgetLocalIdToTabIdMap } from "../../../../../../model/store/tabs/layout/layoutSelectors.js";
import { selectCurrentUser } from "../../../../../../model/store/user/userSelectors.js";
import { type ExtendedDashboardWidget } from "../../../../../../model/types/layoutTypes.js";
import { IntlWrapper } from "../../../../../localization/IntlWrapper.js";
import { useEditScheduledEmail } from "../useEditScheduledEmail.js";

// Sentinel for the partially-mocked parametersSelectors module (vitest hoists vi.mock above imports).
function exportEffectiveParametersSelector(): never {
    throw new Error("Sentinel selector must be resolved by the useDashboardSelector mock.");
}

// The reporter's case: no effective override, so the new automation seeds no params.
const noEffectiveParameters: Record<string, IDashboardExportParameter[]> = {};

// The hook reads ~12 selectors but only dereferences these four; the rest are optional-chained or
// `?? []`-coalesced inside the hook, so an undefined default is safe.
function resolveSelectorValue(selector: unknown): unknown {
    switch (selector) {
        case selectCurrentUser:
            return { login: "u1", email: "u1@example.com", ref: idRef("u1") };
        case selectWidgetLocalIdToTabIdMap:
            return { w1: "tab1" };
        case selectDashboardHiddenFilters:
            return [];
        case exportEffectiveParametersSelector:
            return noEffectiveParameters;
        default:
            return undefined;
    }
}

vi.mock("../../../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => resolveSelectorValue(selector),
}));

vi.mock(
    import("../../../../../../model/store/tabs/parameters/parametersSelectors.js"),
    async (importOriginal) => ({
        ...(await importOriginal()),
        selectExportEffectiveParameters: () => exportEffectiveParametersSelector,
    }),
);

vi.mock("../useScheduleValidation.js", () => ({
    useScheduleValidation: () => ({ isValid: true }),
}));

const widget: ExtendedDashboardWidget = {
    type: "insight",
    insight: idRef("insight-1", "insight"),
    ignoreDashboardFilters: [],
    drills: [],
    title: "Widget",
    description: "",
    ref: idRef("w1"),
    uri: "/w1",
    identifier: "w1",
    localIdentifier: "w1",
};

const insight: IInsight = {
    insight: {
        identifier: "insight-1",
        uri: "/insight-1",
        ref: idRef("insight-1", "insight"),
        title: "Insight",
        visualizationUrl: "local:table",
        buckets: [],
        filters: [],
        sorts: [],
        properties: {},
    },
};

const addedParameters: Record<string, IDashboardExportParameter[]> = {
    tab1: [{ id: "topN", value: "5", title: "Top N" }],
};

// Drive the hook directly; the parameters hook (the only other caller of setParametersWire) is
// covered separately.
function renderEditHook() {
    return renderHook(
        () =>
            useEditScheduledEmail({
                notificationChannels: [{ id: "channel-1" } as any],
                insight,
                widget,
                maxAutomationsRecipients: 10,
                setEditedAutomationFilters: () => {},
                setStoreFilters: () => {},
                filtersForNewAutomation: [],
                enableNewScheduledExport: true,
            }),
        { wrapper: IntlWrapper },
    );
}

function paramsByTabOf(result: ReturnType<typeof renderEditHook>["result"]) {
    return (result.current.editedAutomation.exportDefinitions ?? [])
        .filter((ed) => isExportDefinitionVisualizationObjectRequestPayload(ed.requestPayload))
        .map((ed) => ed.requestPayload.content.parametersByTab);
}

describe("useEditScheduledEmail — export parameters survive attachment changes (F1-2594)", () => {
    it("keeps a wire written while no attachment is selected, then a format is picked", () => {
        const { result } = renderEditHook();

        act(() => {
            result.current.onWidgetAttachmentsChange([]);
        });
        act(() => {
            result.current.setParametersWire(addedParameters);
        });
        act(() => {
            result.current.onWidgetAttachmentsChange(["XLSX"]);
        });

        expect(paramsByTabOf(result)).toEqual([addedParameters]);
    });

    it("keeps the wire across a deselect-all then reselect of attachments", () => {
        const { result } = renderEditHook();

        act(() => {
            result.current.setParametersWire(addedParameters);
        });
        act(() => {
            result.current.onWidgetAttachmentsChange([]);
        });
        act(() => {
            result.current.onWidgetAttachmentsChange(["PNG"]);
        });

        expect(paramsByTabOf(result)).toEqual([addedParameters]);
    });

    // Sanity: this order always worked; guards the fix against breaking it.
    it("keeps a wire written after the format change", () => {
        const { result } = renderEditHook();

        act(() => {
            result.current.onWidgetAttachmentsChange(["XLSX"]);
        });
        act(() => {
            result.current.setParametersWire(addedParameters);
        });

        expect(paramsByTabOf(result)).toEqual([addedParameters]);
    });
});
