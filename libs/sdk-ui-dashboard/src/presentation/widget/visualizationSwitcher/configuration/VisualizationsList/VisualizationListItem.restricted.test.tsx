// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import { type IInsight, type IInsightWidget, idRef } from "@gooddata/sdk-model";

import { type DashboardState } from "../../../../../model/store/types.js";
import {
    unavailableObjectsActions,
    unavailableObjectsSliceReducer,
} from "../../../../../model/store/unavailableObjects/index.js";

const mockUseDashboardSelector = vi.fn();

// `isolate: false` shares one module graph per worker, so the module mocked below may already have
// been evaluated against its real dependencies by a test file that ran earlier in the same worker.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => mockUseDashboardSelector(selector),
    useDashboardDispatch: () => vi.fn(),
}));

const { VisualizationListItem } = await import("./VisualizationListItem.js");

const restrictedInsightRef = idRef("insight-restricted", "insight");

function visualization(identifier: string, title: string, insight = idRef("insight-1", "insight")) {
    return {
        type: "insight",
        insight,
        ref: idRef(identifier),
        uri: `/${identifier}`,
        identifier,
        title,
        description: "",
        drills: [],
        ignoreDashboardFilters: [],
    } as IInsightWidget;
}

const messages = {
    "visualizationSwitcher.restrictedEntry": "Restricted",
    "visualizationSwitcher.list.menu.move.up": "Move up",
    "visualizationSwitcher.list.menu.move.down": "Move down",
    "visualizationSwitcher.list.menu.remove": "Remove",
};

function renderItem(entry: IInsightWidget, insight?: IInsight) {
    const restricted: IUnavailableDashboardReference = {
        ref: restrictedInsightRef,
        type: "insight",
        reason: "forbidden",
    };
    const state = {
        unavailableObjects: unavailableObjectsSliceReducer(
            undefined,
            unavailableObjectsActions.setUnavailableObjects([restricted]),
        ),
    } as unknown as DashboardState;

    mockUseDashboardSelector.mockImplementation((selector: (state: DashboardState) => unknown) =>
        selector(state),
    );

    return render(
        <IntlProvider locale="en-US" messages={messages}>
            <VisualizationListItem
                visualization={entry}
                insight={insight!}
                isActive={false}
                isFirst={false}
                isLast={false}
                shouldRenderActions
                onVisualizationDeleted={vi.fn()}
                onVisualizationSelect={vi.fn()}
                onVisualizationPositionChange={vi.fn()}
            />
        </IntlProvider>,
    );
}

function openMenu(container: HTMLElement) {
    fireEvent.click(container.querySelector(".gd-vis-switcher-show-more-button")!);
}

describe("VisualizationListItem", () => {
    beforeEach(() => {
        mockUseDashboardSelector.mockReset();
    });

    it("labels a restricted entry instead of naming the object", () => {
        renderItem(visualization("restricted", "Attrition by team", restrictedInsightRef));

        expect(screen.getByText("Restricted")).toBeInTheDocument();
        expect(screen.queryByText("Attrition by team")).not.toBeInTheDocument();
    });

    it("offers a restricted entry removal alone, because its order cannot be judged", () => {
        const { container } = renderItem(
            visualization("restricted", "Attrition by team", restrictedInsightRef),
        );

        openMenu(container);

        expect(screen.getByText("Remove")).toBeInTheDocument();
        expect(screen.queryByText("Move up")).not.toBeInTheDocument();
        expect(screen.queryByText("Move down")).not.toBeInTheDocument();
    });

    it("keeps title and all three actions for a readable entry", () => {
        const { container } = renderItem(visualization("readable", "Revenue by month"));

        expect(screen.getByText("Revenue by month")).toBeInTheDocument();

        openMenu(container);

        expect(screen.getByText("Move up")).toBeInTheDocument();
        expect(screen.getByText("Move down")).toBeInTheDocument();
        expect(screen.getByText("Remove")).toBeInTheDocument();
    });
});
