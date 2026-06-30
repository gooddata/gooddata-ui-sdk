// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { type IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import type { IUiGranteeRowControlsProps, IUiObjectShareDialogProps } from "@gooddata/sdk-ui-kit";

import type {
    IObjectShareController,
    IObjectShareControllerActions,
    IObjectShareControllerState,
} from "../objectShareController.types.js";
import { ObjectShareDialog } from "../ObjectShareDialog.js";

// Capture the disable props ObjectShareDialog computes for its children, so the
// gating can be asserted directly — no modal/portal DOM, no message-text queries.
const captured = vi.hoisted(() => ({
    addDisabled: [] as Array<boolean | undefined>,
    rowDisabled: [] as Array<boolean | undefined>,
}));

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => {
    const actual = (await importOriginal()) as Record<string, unknown>;
    return {
        ...actual,
        useToastMessage: () => ({
            addSuccess: vi.fn(),
            addError: vi.fn(),
            addProgress: vi.fn(),
            addWarning: vi.fn(),
        }),
        // Capture the computed Add-disable, and render the row controls so the
        // row's isDisabled is captured too.
        UiObjectShareDialog: (props: IUiObjectShareDialogProps) => {
            captured.addDisabled.push(props.isAddDisabled);
            return (
                <div>
                    {props.grantees.map((g) => (
                        <div key={g.id}>{g.controls}</div>
                    ))}
                </div>
            );
        },
        UiGranteeRowControls: (props: IUiGranteeRowControlsProps) => {
            captured.rowDisabled.push(props.isDisabled);
            return null;
        },
        UiAddGranteeDialog: () => null,
        UiTransferOwnershipDialog: () => null,
        UiConfirmDialog: () => null,
    };
});

const TARGET: IObjectPermissionsObject = { kind: "label", ref: idRef("label.country") };

const noop = () => {};
const asyncNoop = async () => {};

function makeController(stateOverrides: Partial<IObjectShareControllerState>): IObjectShareController {
    const actions: IObjectShareControllerActions = {
        reset: noop,
        openAddGrantee: noop,
        closeAddGrantee: noop,
        setPendingGrantees: noop,
        loadOptions: async () => ({ users: [], groups: [] }),
        confirmAddGrantees: asyncNoop,
        changePermissionLevel: asyncNoop,
        removeGrantee: asyncNoop,
        changeGranteeLabels: asyncNoop,
        requestGeneralAccessChange: noop,
        cancelGeneralAccessChange: noop,
        confirmGeneralAccessChange: asyncNoop,
        changeWorkspaceLevel: asyncNoop,
        openTransferOwnership: noop,
        closeTransferOwnership: noop,
        setTransferTarget: noop,
        setTransferAlsoRemoveSelf: noop,
        confirmTransferOwnership: asyncNoop,
    };
    const state: IObjectShareControllerState = {
        subview: "main",
        status: "success",
        accessUnavailable: false,
        summary: undefined,
        grantees: [
            { id: "user:u1", kind: "user", granteeRef: idRef("u1"), name: "Jane Good", level: "VIEW" },
        ],
        generalAccess: "RESTRICTED",
        workspaceLevel: "VIEW",
        workspaceLevelSaving: false,
        labels: [],
        labelsResolved: true,
        selectedLabelIdsByGrantee: {},
        pendingGrantees: [],
        transferTarget: undefined,
        transferAlsoRemoveSelf: false,
        transferTargetIsOwner: false,
        transferSaving: false,
        ...stateOverrides,
    };
    return { state, actions };
}

function renderDialog(controller: IObjectShareController) {
    captured.addDisabled.length = 0;
    captured.rowDisabled.length = 0;
    return render(
        // The dialog computes its confirm-subdialog props via formatMessage even
        // though those children are stubbed here; this test asserts gating booleans,
        // not copy, so swallow the expected missing-translation noise (no bundle
        // loaded) rather than fail on it.
        <IntlProvider locale="en-US" messages={{}} onError={() => {}}>
            <BackendProvider backend={dummyBackendEmptyData()}>
                <WorkspaceProvider workspace="ws">
                    <ObjectShareDialog
                        target={TARGET}
                        objectTitle="Country"
                        isOpen
                        onClose={noop}
                        controller={controller}
                    />
                </WorkspaceProvider>
            </BackendProvider>
        </IntlProvider>,
    );
}

describe("ObjectShareDialog gating", () => {
    // The transfer dialog can be dismissed (Back/Cancel/close) while its write is
    // still committing, dropping the user back on the main view. Guard the main
    // view's mutations on transferSaving so they can't race the in-flight transfer.
    it("locks Add and grantee-row controls while a transfer write is in flight", () => {
        renderDialog(makeController({ transferSaving: true }));

        expect(captured.addDisabled.at(-1)).toBe(true);
        expect(captured.rowDisabled.at(-1)).toBe(true);
    });

    it("leaves Add and grantee-row controls enabled when no transfer is saving", () => {
        renderDialog(makeController({ transferSaving: false }));

        expect(captured.addDisabled.at(-1)).toBe(false);
        expect(captured.rowDisabled.at(-1)).toBe(false);
    });
});
