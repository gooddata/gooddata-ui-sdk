// (C) 2026 GoodData Corporation

import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { idRef } from "@gooddata/sdk-model";
import type {
    IObjectShareController,
    IObjectShareControllerActions,
    IObjectShareControllerState,
} from "@gooddata/sdk-ui-ext";

import type { ShareableCatalogItem } from "../types.js";

// The provider creates a controller via useObjectShare and renders ObjectShareDialog.
// Neither is under test here — stub both so the test isolates the context split
// (state vs actions) and its re-render behavior. useShareableLabels is stubbed to a
// settled, label-free result so the controller stub's inputs are stable.
const stubState: IObjectShareControllerState = {
    subview: "main",
    status: "success",
    summary: undefined,
    grantees: [],
    generalAccess: "RESTRICTED",
    workspaceLevel: "VIEW",
    workspaceLevelSaving: false,
    labels: [],
    labelsResolved: true,
    selectedLabelIdsByGrantee: {},
    pendingGrantees: [],
};
const noop = () => {};
const asyncNoop = async () => {};
const stubActions: IObjectShareControllerActions = {
    reset: noop,
    openAddGrantee: noop,
    closeAddGrantee: noop,
    setPendingGrantees: noop,
    loadOptions: async () => ({ groups: [], users: [] }),
    confirmAddGrantees: asyncNoop,
    changePermissionLevel: asyncNoop,
    removeGrantee: asyncNoop,
    changeGranteeLabels: asyncNoop,
    requestGeneralAccessChange: noop,
    cancelGeneralAccessChange: noop,
    confirmGeneralAccessChange: asyncNoop,
    changeWorkspaceLevel: asyncNoop,
};
const controllerStub: IObjectShareController = { state: stubState, actions: stubActions };

vi.mock("@gooddata/sdk-ui-ext", () => ({
    useObjectShare: () => controllerStub,
    ObjectShareDialog: () => null,
}));

vi.mock("../useShareableLabels.js", () => ({
    useShareableLabels: () => ({ labels: [], loading: false, error: false }),
}));

import {
    CatalogItemShareProvider,
    useCatalogItemShareActions,
    useCatalogItemShareState,
} from "../CatalogItemShareProvider.js";

const attribute: ShareableCatalogItem = {
    description: "",
    tags: [],
    createdBy: "",
    updatedBy: "",
    createdAt: null,
    updatedAt: null,
    isLocked: false,
    isEditable: true,
    type: "attribute",
    identifier: "attr.region",
    title: "Region",
};

const target = { kind: "attribute" as const, ref: idRef("attr.region", "attribute") };

describe("CatalogItemShareProvider", () => {
    it("re-renders state consumers on an open/close tick but not actions-only consumers", () => {
        const stateRenders = vi.fn();
        const actionsRenders = vi.fn();
        let open: () => void = () => {};

        function StateConsumer() {
            useCatalogItemShareState();
            stateRenders();
            return null;
        }
        function ActionsConsumer() {
            open = useCatalogItemShareActions().open;
            actionsRenders();
            return null;
        }

        render(
            <CatalogItemShareProvider
                shareableItem={attribute}
                target={target}
                labels={{ labels: [], loading: false, error: false }}
            >
                <StateConsumer />
                <ActionsConsumer />
            </CatalogItemShareProvider>,
        );

        expect(stateRenders).toHaveBeenCalledTimes(1);
        expect(actionsRenders).toHaveBeenCalledTimes(1);

        // Opening the dialog flips isOpen — a state change. The state consumer must
        // re-render; the actions consumer must NOT (its context value is stable).
        act(() => open());

        expect(stateRenders).toHaveBeenCalledTimes(2);
        expect(actionsRenders).toHaveBeenCalledTimes(1);
    });

    it("reports inactive when the item is not shareable", () => {
        let active = true;
        function Probe() {
            active = useCatalogItemShareState().active;
            return null;
        }

        render(
            <CatalogItemShareProvider
                shareableItem={undefined}
                target={undefined}
                labels={{ labels: [], loading: false, error: false }}
            >
                <Probe />
            </CatalogItemShareProvider>,
        );

        expect(active).toBe(false);
    });
});
