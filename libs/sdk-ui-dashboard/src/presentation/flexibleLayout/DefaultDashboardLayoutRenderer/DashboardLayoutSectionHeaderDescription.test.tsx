// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { type DashboardState } from "../../../model/store/types.js";
import {
    unavailableObjectsActions,
    unavailableObjectsSliceReducer,
} from "../../../model/store/unavailableObjects/index.js";

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated against their real dependencies by a test file that ran earlier in the same worker.
vi.hoisted(() => {
    vi.resetModules();
});

const restricted: IUnavailableDashboardReference = {
    ref: idRef("margin", "measure"),
    type: "measure",
    reason: "forbidden",
};

const state = {
    unavailableObjects: unavailableObjectsSliceReducer(
        undefined,
        unavailableObjectsActions.setUnavailableObjects([restricted]),
    ),
    config: { config: { separators: undefined } },
} as unknown as DashboardState;

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: (state: DashboardState) => unknown) => selector(state),
    useDashboardDispatch: () => vi.fn(),
}));

vi.mock("../../../_staging/sharedHooks/useRichTextFilters.js", () => ({
    useSectionDescriptionFilters: () => ({ loading: false, filters: [] }),
}));

vi.mock("../../../model/react/useWidgetExecConfig.js", () => ({
    useDashboardExecConfig: () => ({}),
}));

const { DashboardLayoutSectionHeaderDescription } =
    await import("./DashboardLayoutSectionHeaderDescription.js");

describe("DashboardLayoutSectionHeaderDescription", () => {
    it("marks a reference the user may not read, instead of failing the whole description", async () => {
        const { container } = render(
            <BackendProvider backend={dummyBackend()}>
                <WorkspaceProvider workspace="ws-1">
                    <DashboardLayoutSectionHeaderDescription description="Margin {metric/margin}" />
                </WorkspaceProvider>
            </BackendProvider>,
        );

        expect(await screen.findByText("restricted")).toBeInTheDocument();
        expect(container.querySelector(".gd-rich-text-metric-restricted")).toBeInTheDocument();
    });
});
