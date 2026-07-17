// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    type IDashboardExportParameter,
    type IInsight,
    type IWidget,
    idRef,
    isExportDefinitionVisualizationObjectRequestPayload,
} from "@gooddata/sdk-model";

import { IntlWrapper } from "../../../../../localization/IntlWrapper.js";
import {
    AutomationsContextProvider,
    type IAutomationsContextValue,
} from "../../../../contexts/AutomationsContext.js";
import {
    type IScheduledEmailDialogContextValue,
    ScheduledEmailDialogContextProvider,
} from "../../../../contexts/ScheduledEmailDialogContext.js";
import { useEditScheduledEmail } from "../useEditScheduledEmail.js";

vi.mock("../useScheduleValidation.js", () => ({
    useScheduleValidation: () => ({ isValid: true }),
}));

const widget: IWidget = {
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

// The hook reads only a handful of context fields; the rest are optional-chained or `?? []`-coalesced
// inside the hook, so partial stubs cast through `unknown` are safe for these tests.
const automationsContextValue = {
    settings: undefined,
    timezone: undefined,
    currentUser: { login: "u1", email: "u1@example.com", ref: idRef("u1") },
    features: {
        enableAutomationEvaluationMode: false,
    },
} as unknown as IAutomationsContextValue;

const scheduledEmailDialogContextValue = {
    dashboardId: "dashboard-1",
    dashboardTitle: "Dashboard",
    hiddenFilters: [],
    commonDateFilterId: undefined,
    widgetLocalIdToTabIdMap: { w1: "tab1" },
    // The reporter's case: no effective override, so the new automation seeds no params.
    exportParametersByTab: {},
} as unknown as IScheduledEmailDialogContextValue;

function wrapper({ children }: { children: ReactNode }) {
    return (
        <IntlWrapper>
            <AutomationsContextProvider value={automationsContextValue}>
                <ScheduledEmailDialogContextProvider value={scheduledEmailDialogContextValue}>
                    {children}
                </ScheduledEmailDialogContextProvider>
            </AutomationsContextProvider>
        </IntlWrapper>
    );
}

// Drive the hook directly; the parameters hook (the only other caller of setParametersWire) is
// covered separately.
function renderEditHook() {
    return renderHook(
        () =>
            useEditScheduledEmail({
                notificationChannels: [{ id: "channel-1" } as any],
                insight,
                widget,
                users: [],
                maxAutomationsRecipients: 10,
                setEditedAutomationFilters: () => {},
                setStoreFilters: () => {},
                filtersForNewAutomation: [],
            }),
        { wrapper },
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
