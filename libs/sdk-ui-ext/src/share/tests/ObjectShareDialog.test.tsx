// (C) 2026 GoodData Corporation

import { act, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { type IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import type {
    IUiConfirmDialogProps,
    IUiGranteeRowControlsProps,
    IUiObjectShareDialogProps,
} from "@gooddata/sdk-ui-kit";

import { en_US } from "../../internal/translations/en-US.localization-bundle.js";
import type {
    IObjectShareController,
    IObjectShareControllerActions,
    IObjectShareControllerState,
} from "../objectShareController.types.js";
import { ObjectShareDialog } from "../ObjectShareDialog.js";

// Real English strings, so copy-sensitive behavior ("(you)" suffix, the shared
// self-restrict warning) is asserted against what users actually see.
const MESSAGES = Object.fromEntries(Object.entries(en_US).map(([id, message]) => [id, message.text]));
const SELF_RESTRICT_TITLE = MESSAGES["objectShare.selfRestrict.title"]!;
const SELF_RESTRICT_WARNING = MESSAGES["objectShare.selfRestrict.warning"]!;

// Capture the props ObjectShareDialog computes for its children, so gating and
// row composition can be asserted directly — no modal/portal DOM.
const captured = vi.hoisted(() => ({
    addDisabled: [] as Array<boolean | undefined>,
    rows: [] as Array<{ id: string; name: string; email?: string }>,
    controls: [] as Array<Partial<IUiGranteeRowControlsProps>>,
    confirms: [] as Array<{
        title: string;
        isOpen: boolean | undefined;
        onConfirm: () => void;
        onCancel: () => void;
    }>,
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
        // Capture the computed Add-disable and each row's identity, and render the
        // controls slot so row-control props (and the real Admin tag) render too.
        UiObjectShareDialog: (props: IUiObjectShareDialogProps) => {
            captured.addDisabled.push(props.isAddDisabled);
            // Snapshot of the LAST render only — re-renders replace, not append,
            // so whole-array assertions stay stable.
            captured.rows.length = 0;
            return (
                <div>
                    {props.grantees.map((g) => {
                        captured.rows.push({ id: g.id, name: g.name, email: g.email });
                        return <div key={g.id}>{g.controls}</div>;
                    })}
                </div>
            );
        },
        UiGranteeRowControls: (props: IUiGranteeRowControlsProps) => {
            captured.controls.push(props);
            return null;
        },
        UiAddGranteeDialog: () => null,
        UiConfirmDialog: (props: IUiConfirmDialogProps) => {
            captured.confirms.push({
                title: props.title,
                isOpen: props.isOpen,
                onConfirm: props.onConfirm,
                onCancel: props.onCancel,
            });
            return null;
        },
    };
});

const TARGET: IObjectPermissionsObject = { kind: "label", ref: idRef("label.country") };

const noop = () => {};
const asyncNoop = async () => {};

const OTHER_GRANTEE = {
    id: "user:u1",
    kind: "user" as const,
    granteeRef: idRef("u1"),
    name: "Jane Good",
    level: "VIEW" as const,
};

const SELF_GRANTEE = {
    id: "user:self",
    kind: "user" as const,
    granteeRef: idRef("self"),
    name: "Marek Stránský",
    isSelf: true,
    level: "VIEW" as const,
};

function makeController(stateOverrides: Partial<IObjectShareControllerState>): IObjectShareController {
    const actions: IObjectShareControllerActions = {
        reset: noop,
        openAddGrantee: noop,
        closeAddGrantee: noop,
        setPendingGrantees: noop,
        loadOptions: async () => ({ users: [], groups: [] }),
        confirmAddGrantees: asyncNoop,
        changePermissionLevel: vi.fn(asyncNoop),
        removeGrantee: vi.fn(asyncNoop),
        changeGranteeLabels: asyncNoop,
        requestGeneralAccessChange: noop,
        cancelGeneralAccessChange: noop,
        confirmGeneralAccessChange: asyncNoop,
        changeWorkspaceLevel: asyncNoop,
    };
    const state: IObjectShareControllerState = {
        subview: "main",
        status: "success",
        accessUnavailable: false,
        summary: undefined,
        targetKey: "label.country",
        selfIdentity: undefined,
        selfIdentityResolved: true,
        seededWithoutGrants: false,
        grantees: [OTHER_GRANTEE],
        generalAccess: "RESTRICTED",
        workspaceLevel: "VIEW",
        workspaceAccessInherited: false,
        workspaceLevelLocked: false,
        workspaceLevelSaving: false,
        labels: [],
        labelsResolved: true,
        selectedLabelIdsByGrantee: {},
        pendingGrantees: [],
        ...stateOverrides,
    };
    return { state, actions };
}

function renderDialog(controller: IObjectShareController) {
    captured.addDisabled.length = 0;
    captured.rows.length = 0;
    captured.controls.length = 0;
    captured.confirms.length = 0;
    return render(
        <IntlProvider locale="en-US" messages={MESSAGES}>
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

const lastSelfConfirm = () => captured.confirms.filter((c) => c.title === SELF_RESTRICT_TITLE).at(-1);

describe("ObjectShareDialog gating", () => {
    it("locks Add and grantee-row controls until per-label scope resolves", () => {
        renderDialog(makeController({ labelsResolved: false }));

        expect(captured.addDisabled.at(-1)).toBe(true);
        expect(captured.controls.at(-1)?.isDisabled).toBe(true);
    });

    it("leaves Add and grantee-row controls enabled once loaded and resolved", () => {
        renderDialog(makeController({}));

        expect(captured.addDisabled.at(-1)).toBe(false);
        expect(captured.controls.at(-1)?.isDisabled).toBe(false);
    });
});

describe("ObjectShareDialog self row", () => {
    it("suffixes the signed-in user's own row name with (you)", () => {
        renderDialog(makeController({ grantees: [SELF_GRANTEE, OTHER_GRANTEE] }));

        expect(captured.rows.map((r) => r.name)).toEqual(["Marek Stránský (you)", "Jane Good"]);
    });

    it("renders the sole self grant as merged controls with the shared warning tooltip", () => {
        renderDialog(makeController({ grantees: [SELF_GRANTEE] }));

        const controls = captured.controls.at(-1)!;
        expect(controls.mergedControls).toBe(true);
        expect(controls.disabledLevels).toEqual(["SHARE"]);
        expect(controls.disabledTooltip).toBe(SELF_RESTRICT_WARNING);
    });

    it("offers both levels enabled for a sole self EDIT grant", () => {
        renderDialog(makeController({ grantees: [{ ...SELF_GRANTEE, level: "EDIT" as const }] }));

        const controls = captured.controls.at(-1)!;
        expect(controls.mergedControls).toBe(true);
        expect(controls.disabledLevels).toBeUndefined();
    });

    it("keeps normal controls for a self row when other grantees exist", () => {
        renderDialog(makeController({ grantees: [SELF_GRANTEE, OTHER_GRANTEE] }));

        expect(captured.controls.every((c) => !c.mergedControls)).toBe(true);
    });

    it("confirms before lowering the signed-in user's own level, then commits", () => {
        const controller = makeController({
            grantees: [{ ...SELF_GRANTEE, level: "SHARE" as const }],
        });
        renderDialog(controller);
        expect(lastSelfConfirm()?.isOpen).toBe(false);

        const controls = captured.controls.at(-1)!;
        act(() => {
            controls.onPermissionChange!("VIEW");
        });

        expect(lastSelfConfirm()?.isOpen).toBe(true);
        expect(controller.actions.changePermissionLevel).not.toHaveBeenCalled();

        act(() => {
            lastSelfConfirm()!.onConfirm();
        });
        expect(controller.actions.changePermissionLevel).toHaveBeenCalledWith("user:self", "VIEW");
        expect(lastSelfConfirm()?.isOpen).toBe(false);
    });

    it("discards the staged self-restriction on cancel", () => {
        const controller = makeController({
            grantees: [{ ...SELF_GRANTEE, level: "SHARE" as const }],
        });
        renderDialog(controller);

        const controls = captured.controls.at(-1)!;
        act(() => {
            controls.onPermissionChange!("VIEW");
        });
        act(() => {
            lastSelfConfirm()!.onCancel();
        });

        expect(lastSelfConfirm()?.isOpen).toBe(false);
        expect(controller.actions.changePermissionLevel).not.toHaveBeenCalled();
    });

    it("routes removing the signed-in user's own sole access through the same confirm", () => {
        const controller = makeController({ grantees: [SELF_GRANTEE] });
        renderDialog(controller);

        const controls = captured.controls.at(-1)!;
        act(() => {
            controls.onRemoveAccess!();
        });
        expect(lastSelfConfirm()?.isOpen).toBe(true);

        act(() => {
            lastSelfConfirm()!.onConfirm();
        });
        expect(controller.actions.removeGrantee).toHaveBeenCalledWith("user:self");
    });
});

describe("ObjectShareDialog administrator empty state", () => {
    const SELF_IDENTITY = { id: "marek", name: "Marek Stránský", email: "marek@example.com" };
    // The badge is keyed to the LOAD-time emptiness, so every positive case seeds empty.
    const ADMIN_STATE = { grantees: [], selfIdentity: SELF_IDENTITY, seededWithoutGrants: true };

    it("synthesizes the signed-in user's row with the Admin tag when the list loaded empty", () => {
        renderDialog(makeController(ADMIN_STATE));

        expect(captured.rows).toEqual([
            { id: "self-admin", name: "Marek Stránský (you)", email: "marek@example.com" },
        ]);
        // The Admin tag is a real UiTag rendered into the row's controls slot.
        expect(screen.getByText(MESSAGES["objectShare.adminTag.label"]!)).toBeInTheDocument();
    });

    it("shows no admin row when the list was only emptied locally (seeded with grants)", () => {
        // A grant-holder who removed their own sole grant: list is empty NOW, but
        // it did not load empty — they have no grant-independent access.
        renderDialog(
            makeController({ grantees: [], selfIdentity: SELF_IDENTITY, seededWithoutGrants: false }),
        );

        expect(captured.rows).toEqual([]);
    });

    it("shows no admin row when a workspace-wide SHARE rule explains the access", () => {
        renderDialog(
            makeController({
                ...ADMIN_STATE,
                generalAccess: "WORKSPACE",
                workspaceLevel: "SHARE",
            }),
        );

        expect(captured.rows).toEqual([]);
    });

    it("shows no admin row before the access list has loaded", () => {
        renderDialog(makeController({ ...ADMIN_STATE, status: "loading" }));

        expect(captured.rows).toEqual([]);
    });

    it("shows no admin row while the profile is unresolved", () => {
        renderDialog(makeController({ ...ADMIN_STATE, selfIdentity: undefined }));

        expect(captured.rows).toEqual([]);
    });
});

describe("ObjectShareDialog sole-row identity guard", () => {
    it("disables a sole grantee row until the profile resolves", () => {
        // An unidentified sole row may be the caller's own grant — mutating it
        // would bypass the self-restriction confirm.
        renderDialog(
            makeController({
                grantees: [{ ...SELF_GRANTEE, isSelf: undefined }],
                selfIdentityResolved: false,
            }),
        );

        expect(captured.controls.at(-1)?.isDisabled).toBe(true);
        expect(captured.controls.at(-1)?.mergedControls).toBeFalsy();
    });

    it("keeps a sole row disabled when the profile request failed", () => {
        // Profile errors are swallowed (selfIdentityResolved stays false) — the
        // guard must hold indefinitely, not just during the request.
        renderDialog(
            makeController({
                grantees: [{ ...OTHER_GRANTEE }],
                selfIdentityResolved: false,
            }),
        );

        expect(captured.controls.at(-1)?.isDisabled).toBe(true);
    });

    it("does not gate a sole group row on profile resolution", () => {
        // A group can never be the signed-in user — a failed profile lookup must
        // not lock its controls.
        renderDialog(
            makeController({
                grantees: [
                    {
                        id: "group:g1",
                        kind: "group" as const,
                        granteeRef: idRef("g1"),
                        level: "VIEW" as const,
                    },
                ],
                selfIdentityResolved: false,
            }),
        );

        expect(captured.controls.at(-1)?.isDisabled).toBe(false);
        expect(captured.controls.at(-1)?.mergedControls).toBeFalsy();
    });

    it("does not gate multi-row lists on profile resolution", () => {
        renderDialog(
            makeController({
                grantees: [SELF_GRANTEE, OTHER_GRANTEE],
                selfIdentityResolved: false,
            }),
        );

        expect(captured.controls.every((c) => !c.isDisabled)).toBe(true);
    });
});

describe("ObjectShareDialog staged self-restriction lifecycle", () => {
    it("drops the staged self-restriction when the dialog is closed via isOpen", () => {
        // The detail view navigates between objects by toggling isOpen alone (no
        // onClose), and the self row's id is target-independent — a stale confirm
        // must not survive to the next object.
        const controller = makeController({
            grantees: [{ ...SELF_GRANTEE, level: "SHARE" as const }],
        });
        const view = (open: boolean) => (
            <IntlProvider locale="en-US" messages={MESSAGES}>
                <BackendProvider backend={dummyBackendEmptyData()}>
                    <WorkspaceProvider workspace="ws">
                        <ObjectShareDialog
                            target={TARGET}
                            objectTitle="Country"
                            isOpen={open}
                            onClose={noop}
                            controller={controller}
                        />
                    </WorkspaceProvider>
                </BackendProvider>
            </IntlProvider>
        );
        captured.controls.length = 0;
        captured.confirms.length = 0;
        const { rerender } = render(view(true));

        const controls = captured.controls.at(-1)!;
        act(() => {
            controls.onPermissionChange!("VIEW");
        });
        expect(lastSelfConfirm()?.isOpen).toBe(true);

        rerender(view(false));
        rerender(view(true));

        expect(lastSelfConfirm()?.isOpen).toBe(false);
        expect(controller.actions.changePermissionLevel).not.toHaveBeenCalled();
    });

    it("drops the staged self-restriction when the target changes while open", () => {
        // A consumer may swap the target without closing; the staged confirm is
        // keyed to the target and must not apply to the next object.
        const controllerA = makeController({
            targetKey: "label.country",
            grantees: [{ ...SELF_GRANTEE, level: "SHARE" as const }],
        });
        const controllerB = makeController({
            targetKey: "label.city",
            grantees: [{ ...SELF_GRANTEE, level: "SHARE" as const }],
        });
        const view = (controller: IObjectShareController) => (
            <IntlProvider locale="en-US" messages={MESSAGES}>
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
            </IntlProvider>
        );
        captured.controls.length = 0;
        captured.confirms.length = 0;
        const { rerender } = render(view(controllerA));

        const controls = captured.controls.at(-1)!;
        act(() => {
            controls.onPermissionChange!("VIEW");
        });
        expect(lastSelfConfirm()?.isOpen).toBe(true);

        rerender(view(controllerB));

        expect(lastSelfConfirm()?.isOpen).toBe(false);
        expect(controllerA.actions.changePermissionLevel).not.toHaveBeenCalled();
        expect(controllerB.actions.changePermissionLevel).not.toHaveBeenCalled();
    });
});
