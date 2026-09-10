// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import { type IInsight, type IInsightWidget, idRef } from "@gooddata/sdk-model";

import { insightsActions, insightsSliceReducer } from "../../../../model/store/insights/index.js";
import { type DashboardState } from "../../../../model/store/types.js";
import {
    unavailableObjectsActions,
    unavailableObjectsSliceReducer,
} from "../../../../model/store/unavailableObjects/index.js";

const mockUseDashboardSelector = vi.fn();
const mockPlaceholderProvider = vi.fn();

// `isolate: false` shares one module graph per worker, so the module mocked below may already have
// been evaluated against its real dependencies by a test file that ran earlier in the same worker,
// which would turn the `vi.mock()` call into a no-op.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => mockUseDashboardSelector(selector),
}));

vi.mock("../../../dashboardContexts/DashboardComponentsContext.js", () => ({
    useDashboardComponentsContext: () => ({
        RestrictedPlaceholderComponentProvider: mockPlaceholderProvider,
    }),
}));

const { DashboardWidgetInsightGuard } = await import("./DashboardWidgetInsightGuard.js");

const insightRef = idRef("insight-1", "insight");

const widget: IInsightWidget = {
    type: "insight",
    insight: insightRef,
    ref: idRef("widget-1"),
    uri: "/widget-1",
    identifier: "widget-1",
    title: "Confidential revenue",
    description: "",
    drills: [],
    ignoreDashboardFilters: [],
};

const insight: IInsight = {
    insight: {
        title: "Confidential revenue",
        ref: insightRef,
        uri: "/insight-1",
        identifier: "insight-1",
        visualizationUrl: "local:table",
        buckets: [],
        filters: [],
        sorts: [],
        properties: {},
    },
};

const messages = {
    "widget.error.restricted_insight.message": "No access to this visualization",
    "widget.error.restricted_insight.description": "Ask your administrator for access",
};

function stateWith(...unavailableObjects: IUnavailableDashboardReference[]): DashboardState {
    return {
        backendCapabilities: { backendCapabilities: { hasTypeScopedIdentifiers: true } },
        insights: insightsSliceReducer(undefined, insightsActions.setInsights([insight])),
        unavailableObjects: unavailableObjectsSliceReducer(
            undefined,
            unavailableObjectsActions.setUnavailableObjects(unavailableObjects),
        ),
    } as unknown as DashboardState;
}

function WidgetStandIn({ widget }: { widget: IInsightWidget }) {
    return (
        <>
            <div>the real widget</div>
            <div>{widget.title}</div>
        </>
    );
}

function DefaultPlaceholderStandIn() {
    return <div className="info-label-icon">the default placeholder</div>;
}

function ConsumerPlaceholder() {
    return <div>the consumer placeholder</div>;
}

function renderGuard(state: DashboardState) {
    mockUseDashboardSelector.mockImplementation((selector: (state: DashboardState) => unknown) =>
        selector(state),
    );

    return render(
        <IntlProvider locale="en-US" messages={messages}>
            <DashboardWidgetInsightGuard
                widget={widget}
                screen="xl"
                dashboardItemClasses="s-dash-item-0"
                Component={WidgetStandIn}
            />
        </IntlProvider>,
    );
}

describe("DashboardWidgetInsightGuard", () => {
    beforeEach(() => {
        mockUseDashboardSelector.mockReset();
        mockPlaceholderProvider.mockReset();
        mockPlaceholderProvider.mockImplementation(() => DefaultPlaceholderStandIn);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders the widget when its insight is available", () => {
        renderGuard(stateWith());

        expect(screen.getByText("the real widget")).toBeInTheDocument();
    });

    it("replaces the widget with a placeholder when its insight is restricted", () => {
        const { container } = renderGuard(
            stateWith({ ref: insightRef, type: "insight", reason: "forbidden" }),
        );

        expect(screen.queryByText("the real widget")).not.toBeInTheDocument();
        // the stored title can name the restricted object, so it must go with the widget
        expect(screen.queryByText("Confidential revenue")).not.toBeInTheDocument();
        expect(container.querySelector(".info-label-icon")).toBeInTheDocument();
    });

    it("lets a consumer replace the placeholder", () => {
        mockPlaceholderProvider.mockImplementation(() => ConsumerPlaceholder);

        renderGuard(stateWith({ ref: insightRef, type: "insight", reason: "forbidden" }));

        expect(screen.getByText("the consumer placeholder")).toBeInTheDocument();
        expect(screen.queryByText("the default placeholder")).not.toBeInTheDocument();
        // the withheld insight must not be handed to the replacement
        expect(mockPlaceholderProvider).toHaveBeenCalledWith(widget);
    });

    it("renders the widget when its insight is only missing", () => {
        renderGuard(stateWith({ ref: insightRef, type: "insight", reason: "notFound" }));

        expect(screen.getByText("the real widget")).toBeInTheDocument();
    });
});
