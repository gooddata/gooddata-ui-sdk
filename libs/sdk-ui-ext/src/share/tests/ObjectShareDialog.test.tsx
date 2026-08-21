// (C) 2026 GoodData Corporation

import { act, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { afterAll, describe, expect, it, vi } from "vitest";

import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { type IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import type {
    IUiAddGranteeDialogProps,
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

// The dialog owns its controller (one open = one session), so tests inject a stub
// by mocking the controller hook: `renderDialog` assigns the stub per test.
// `hookCalls` counts hook invocations, so lifecycle tests can assert the session
// does not exist at all while the dialog is closed.
const injected = vi.hoisted(() => ({
    controller: undefined as IObjectShareController | undefined,
    hookCalls: 0,
}));
vi.mock("../useObjectShareController.js", () => ({
    useObjectShareController: () => {
        injected.hookCalls += 1;
        return injected.controller!;
    },
}));

// Real English strings, so copy-sensitive behavior ("(you)" suffix, the shared
// self-restrict warning) is asserted against what users actually see.
const MESSAGES = Object.fromEntries(Object.entries(en_US).map(([id, message]) => [id, message.text]));
const SELF_RESTRICT_TITLE = MESSAGES["objectShare.selfRestrict.title"]!;
const SELF_RESTRICT_WARNING = MESSAGES["objectShare.selfRestrict.warning"]!;

// Capture the props ObjectShareDialog computes for its children, so gating and
// row composition can be asserted directly — no modal/portal DOM.
const captured = vi.hoisted(() => ({
    addDisabled: [] as Array<boolean | undefined>,
    isLoading: [] as Array<boolean | undefined>,
    rows: [] as Array<{ id: string; name: string; email?: string }>,
    controls: [] as Array<Partial<IUiGranteeRowControlsProps>>,
    addGrantee: [] as Array<Partial<IUiAddGranteeDialogProps>>,
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
            captured.isLoading.push(props.isLoading);
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
        UiAddGranteeDialog: (props: IUiAddGranteeDialogProps) => {
            captured.addGrantee.push(props);
            return null;
        },
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

/*
 * Test isolation is disabled for this package, so the module cache is shared between test files:
 * ObjectShareDialog.js may already have been evaluated - bound to the real controller hook and UI kit
 * components - elsewhere, and the mocked graph this file builds must not outlive it. Re-import it up front so
 * this file always observes the mocks above, and drop the mocked graph again on the way out.
 *
 * This runs while the file is still being imported, not from a `beforeAll`: the re-import pulls the whole
 * ui-kit graph behind the dialog through the mock above, and whichever file loads it first in a worker pays
 * seconds for it - more than the 10s `hookTimeout` allows on a loaded CI machine, which is what made this
 * suite flake. Module loading carries no such budget, and there is nothing cheaper to move off it: the reset
 * is what the mock wiring depends on.
 */
vi.resetModules();
const { ObjectShareDialog } = await import("../ObjectShareDialog.js");

afterAll(() => {
    vi.resetModules();
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
        summary: undefined,
        grantees: [OTHER_GRANTEE],
        selfManagedGranteeId: undefined,
        selfManagedDisabledLevels: undefined,
        workspaceDisabledLevels: undefined,
        grantableDisabledLevels: undefined,
        granteeControlsLocked: false,
        adminSelfRow: undefined,
        generalAccess: "RESTRICTED",
        workspaceLevel: "VIEW",
        workspaceInheritedLevel: undefined,
        workspaceLevelLocked: false,
        workspaceLevelSaving: false,
        labels: [],
        labelsResolved: true,
        labelsInitializing: false,
        selectedLabelIdsByGrantee: {},
        inheritedLabelIdsByGrantee: {},
        pendingGrantees: [],
        ...stateOverrides,
    };
    return { state, actions };
}

function renderDialog(controller: IObjectShareController, onSummaryChange?: (summary: unknown) => void) {
    captured.addDisabled.length = 0;
    captured.isLoading.length = 0;
    captured.rows.length = 0;
    captured.controls.length = 0;
    captured.confirms.length = 0;
    captured.addGrantee.length = 0;
    injected.controller = controller;
    return render(
        <IntlProvider locale="en-US" messages={MESSAGES}>
            <BackendProvider backend={dummyBackendEmptyData()}>
                <WorkspaceProvider workspace="ws">
                    <ObjectShareDialog
                        target={TARGET}
                        objectTitle="Country"
                        isOpen
                        onClose={noop}
                        onSummaryChange={onSummaryChange}
                    />
                </WorkspaceProvider>
            </BackendProvider>
        </IntlProvider>,
    );
}

const lastSelfConfirm = () => captured.confirms.filter((c) => c.title === SELF_RESTRICT_TITLE).at(-1);

describe("ObjectShareDialog session lifecycle", () => {
    it("mounts no session while closed — the controller does not exist", () => {
        // The one-open-one-session contract is enforced by the component itself: a
        // consumer keeping it mounted with isOpen=false must get no controller, no
        // fetches, and no state that could leak into the next open.
        injected.controller = makeController({});
        injected.hookCalls = 0;
        const { container } = render(
            <IntlProvider locale="en-US" messages={MESSAGES}>
                <BackendProvider backend={dummyBackendEmptyData()}>
                    <WorkspaceProvider workspace="ws">
                        <ObjectShareDialog
                            target={TARGET}
                            objectTitle="Country"
                            isOpen={false}
                            onClose={noop}
                        />
                    </WorkspaceProvider>
                </BackendProvider>
            </IntlProvider>,
        );
        expect(injected.hookCalls).toBe(0);
        expect(container.firstChild).toBeNull();
    });
});

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

    it("offers the add step the same label checklist the grantee rows use", () => {
        // Without this the add step has no label picker at all, so a new grantee can
        // only be scoped after the grant already landed on every label.
        const labels = [
            { ref: idRef("lbl.primary"), id: "lbl.primary", title: "Id", isPrimary: true, isDefault: false },
            { ref: idRef("lbl.name"), id: "lbl.name", title: "Name", isPrimary: false, isDefault: true },
        ];
        renderDialog(makeController({ labels }));

        expect(captured.addGrantee.at(-1)?.labels).toEqual(captured.controls.at(-1)?.labels);
        expect(captured.addGrantee.at(-1)?.labels).toEqual([
            { id: "lbl.primary", label: "Id", kind: "primary", locked: true },
            { id: "lbl.name", label: "Name", kind: undefined, locked: false },
        ]);
    });

    it("locks a label the grantee only inherits, leaving the rest editable", () => {
        // The label is in scope (checked, as the granting workspace shows it) but this
        // workspace holds no grant on it — unchecking it could only pretend to revoke.
        const labels = [
            { ref: idRef("lbl.primary"), id: "lbl.primary", title: "Id", isPrimary: true, isDefault: false },
            { ref: idRef("lbl.name"), id: "lbl.name", title: "Name", isPrimary: false, isDefault: true },
            {
                ref: idRef("lbl.email"),
                id: "lbl.email",
                title: "Email",
                isPrimary: false,
                isDefault: false,
            },
        ];
        renderDialog(
            makeController({
                labels,
                inheritedLabelIdsByGrantee: { "user:u1": ["lbl.email"] },
            }),
        );

        const rendered = captured.controls.at(-1)?.labels;
        expect(rendered?.find((l) => l.id === "lbl.email")?.locked).toBe(true);
        expect(rendered?.find((l) => l.id === "lbl.name")?.locked).toBe(false);
        expect(rendered?.find((l) => l.id === "lbl.primary")?.locked).toBe(true);
    });

    it("stands skeletons in until the list AND the first label resolution load", () => {
        renderDialog(makeController({ status: "loading", grantees: [] }));
        expect(captured.isLoading.at(-1)).toBe(true);

        // List loaded but the session's first label probe still out — reveal only
        // once controls are actionable, not as a disabled-looking intermediate.
        renderDialog(makeController({ labelsInitializing: true, labelsResolved: false }));
        expect(captured.isLoading.at(-1)).toBe(true);

        renderDialog(makeController({}));
        expect(captured.isLoading.at(-1)).toBe(false);
    });
});

describe("ObjectShareDialog self row", () => {
    it("suffixes the signed-in user's own row name with (you)", () => {
        renderDialog(makeController({ grantees: [SELF_GRANTEE, OTHER_GRANTEE] }));

        expect(captured.rows.map((r) => r.name)).toEqual(["Marek Stránský (you)", "Jane Good"]);
    });

    it("forwards the controller's self-managed disabled levels with the shared warning tooltip", () => {
        renderDialog(
            makeController({
                grantees: [SELF_GRANTEE],
                selfManagedGranteeId: SELF_GRANTEE.id,
                selfManagedDisabledLevels: ["EDIT", "SHARE"],
            }),
        );

        const controls = captured.controls.at(-1)!;
        expect(controls.disabledLevels).toEqual(["EDIT", "SHARE"]);
        expect(controls.disabledTooltip).toBe(SELF_RESTRICT_WARNING);
    });

    it("applies the disabled levels only to the self-managed row", () => {
        renderDialog(
            makeController({
                grantees: [{ ...SELF_GRANTEE, level: "SHARE" as const }],
                selfManagedGranteeId: SELF_GRANTEE.id,
                selfManagedDisabledLevels: ["EDIT"],
            }),
        );

        expect(captured.controls.at(-1)!.disabledLevels).toEqual(["EDIT"]);
    });

    it("keeps normal controls when the controller classifies no self-managed row", () => {
        // No self-managed row → no level disabling on any row.
        renderDialog(makeController({ grantees: [SELF_GRANTEE, OTHER_GRANTEE] }));

        expect(captured.controls.every((c) => c.disabledLevels === undefined)).toBe(true);
    });

    it("leaves other grantees' rows unconstrained (no level disabling — backend is the authority)", () => {
        // Per the design there is no frontend grant-ceiling for granting to
        // others; only the self-managed row disables levels (self-restriction).
        renderDialog(makeController({ grantees: [{ ...OTHER_GRANTEE, level: "EDIT" as const }] }));

        expect(captured.controls.at(-1)?.disabledLevels).toBeUndefined();
        expect(captured.controls.at(-1)?.disabledTooltip).toBeUndefined();
    });

    it("locks only user rows while the caller's identity is unresolved", () => {
        // A group row can never be the caller, so it stays usable.
        renderDialog(
            makeController({
                granteeControlsLocked: true,
                grantees: [
                    OTHER_GRANTEE,
                    {
                        id: "group:g1",
                        kind: "group" as const,
                        granteeRef: idRef("g1"),
                        name: "Marketing",
                        level: "SHARE" as const,
                    },
                ],
            }),
        );

        const byLevel = new Map(captured.controls.map((c) => [c.permissionLevel, c.isDisabled]));
        expect(byLevel.get("VIEW")).toBe(true); // the user row
        expect(byLevel.get("SHARE")).toBe(false); // the group row
    });

    it("disables the picks an inherited grant covers, with their own reason", () => {
        renderDialog(
            makeController({
                grantees: [
                    {
                        ...OTHER_GRANTEE,
                        level: "EDIT" as const,
                        directLevel: "VIEW" as const,
                        inheritedLevel: "EDIT" as const,
                    },
                ],
            }),
        );

        const controls = captured.controls.at(-1)!;
        // EDIT is displayed so it stays enabled; SHARE and VIEW cannot move anything.
        expect(controls.disabledLevels?.slice().sort()).toEqual(["SHARE", "VIEW"]);
        expect(controls.disabledTooltip).toBeUndefined(); // not the self row
        expect(controls.disabledLevelTooltips?.SHARE).toMatch(/inherited/);
        expect(controls.disabledLevelTooltips?.VIEW).toMatch(/inherited/);
    });

    it("disables levels the caller may not grant, in the rows and in the add step", () => {
        // Reported case: a caller holding "Can view & share" was offered "Can edit &
        // share" for someone else, and the server refused the write.
        renderDialog(
            makeController({
                grantees: [OTHER_GRANTEE, { ...SELF_GRANTEE, level: "SHARE" as const }],
                grantableDisabledLevels: ["EDIT"],
                subview: "addGrantee",
                pendingGrantees: [
                    { id: "user:u9", ref: idRef("u9"), kind: "user", name: "Jane", permissionLevel: "VIEW" },
                ],
            }),
        );

        expect(captured.addGrantee.at(-1)?.disabledLevels).toEqual(["EDIT"]);
        expect(captured.addGrantee.at(-1)?.disabledTooltip).toMatch(/only grant permissions/i);
        // Other grantees' rows carry the same limit, with the same reason.
        const other = captured.controls.find((c) => c.permissionLevel === "VIEW");
        expect(other?.disabledLevels).toContain("EDIT");
        expect(other?.disabledLevelTooltips?.EDIT).toMatch(/only grant permissions/i);
    });

    it("caps the workspace rule at the caller's own level too", () => {
        renderDialog(
            makeController({
                generalAccess: "WORKSPACE",
                workspaceLevel: "VIEW",
                grantableDisabledLevels: ["EDIT"],
            }),
        );

        const rule = captured.controls.at(-1)!;
        expect(rule.disabledLevels).toContain("EDIT");
        expect(rule.disabledLevelTooltips?.EDIT).toMatch(/only grant permissions/i);
    });

    it("disables nothing when the caller's own level is unknown", () => {
        // No own row means the access may come from a group, which the list does not
        // report. Capping then would block a real holder, so the backend decides.
        renderDialog(makeController({ grantees: [OTHER_GRANTEE], grantableDisabledLevels: undefined }));

        expect(captured.controls.at(-1)?.disabledLevels).toBeUndefined();
    });

    it("keeps lowering enabled while the direct grant sits above what is inherited", () => {
        renderDialog(
            makeController({
                grantees: [
                    {
                        ...OTHER_GRANTEE,
                        level: "EDIT" as const,
                        directLevel: "EDIT" as const,
                        inheritedLevel: "SHARE" as const,
                    },
                ],
            }),
        );

        // Both lower picks still move the effective level (EDIT drops to SHARE).
        expect(captured.controls.at(-1)?.disabledLevels).toBeUndefined();
    });

    it("confirms before lowering the signed-in user's own level, then commits", () => {
        const controller = makeController({
            grantees: [{ ...SELF_GRANTEE, level: "SHARE" as const }],
            selfManagedGranteeId: SELF_GRANTEE.id,
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

    it("stages no self-restrict confirm for a pick an inherited floor makes a no-op", () => {
        // Own grant VIEW under an inherited EDIT: the row displays EDIT, and no pick can
        // lower what the user effectively holds. Comparing the pick against the DISPLAYED
        // level opened "Restrict your access?" anyway, and the controller then refused the
        // write — the user confirmed a restriction that never happened.
        const controller = makeController({
            grantees: [
                {
                    ...SELF_GRANTEE,
                    level: "EDIT" as const,
                    directLevel: "VIEW" as const,
                    inheritedLevel: "EDIT" as const,
                },
            ],
            selfManagedGranteeId: SELF_GRANTEE.id,
        });
        renderDialog(controller);
        const controls = captured.controls.at(-1)!;

        // Neither a "lower" pick nor the weakest one can move the effective level.
        for (const level of ["SHARE", "VIEW"] as const) {
            act(() => {
                controls.onPermissionChange!(level);
            });
            expect(lastSelfConfirm()?.isOpen).toBe(false);
        }
        expect(controller.actions.changePermissionLevel).not.toHaveBeenCalled();
    });

    it("still confirms a self-restriction that does move the effective level", () => {
        // Own grant EDIT under an inherited SHARE: dropping to VIEW lowers the effective
        // level from EDIT to SHARE, so it is a real restriction and must be confirmed.
        const controller = makeController({
            grantees: [
                {
                    ...SELF_GRANTEE,
                    level: "EDIT" as const,
                    directLevel: "EDIT" as const,
                    inheritedLevel: "SHARE" as const,
                },
            ],
            selfManagedGranteeId: SELF_GRANTEE.id,
        });
        renderDialog(controller);

        act(() => {
            captured.controls.at(-1)!.onPermissionChange!("VIEW");
        });
        expect(lastSelfConfirm()?.isOpen).toBe(true);
        act(() => {
            lastSelfConfirm()!.onConfirm();
        });
        expect(controller.actions.changePermissionLevel).toHaveBeenCalledWith("user:self", "VIEW");
    });

    it("discards the staged self-restriction on cancel", () => {
        const controller = makeController({
            grantees: [{ ...SELF_GRANTEE, level: "SHARE" as const }],
            selfManagedGranteeId: SELF_GRANTEE.id,
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
        const controller = makeController({
            grantees: [SELF_GRANTEE],
            selfManagedGranteeId: SELF_GRANTEE.id,
        });
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

    it("skips the confirm for a self-removal an inherited floor makes a no-restriction", () => {
        // Own grant VIEW under an inherited EDIT: the revoke removes the local grant
        // but the effective level stays EDIT — "Restrict your access?" would promise
        // a restriction that never happens (the rule the level picks above follow).
        // The removal itself still runs: the local grant is real and revocable.
        const controller = makeController({
            grantees: [
                {
                    ...SELF_GRANTEE,
                    level: "EDIT" as const,
                    directLevel: "VIEW" as const,
                    inheritedLevel: "EDIT" as const,
                },
            ],
            selfManagedGranteeId: SELF_GRANTEE.id,
        });
        renderDialog(controller);

        act(() => {
            captured.controls.at(-1)!.onRemoveAccess!();
        });

        expect(lastSelfConfirm()?.isOpen).toBe(false);
        expect(controller.actions.removeGrantee).toHaveBeenCalledWith("user:self");
    });
});

describe("ObjectShareDialog administrator empty state", () => {
    // WHEN the synthesized row applies is the controller's concern (see the
    // row-classification tests on useObjectShareController) — these only cover
    // rendering the classification.
    it("renders the admin self row with the (you) suffix and the Admin tag", () => {
        renderDialog(
            makeController({
                grantees: [],
                adminSelfRow: { name: "Marek Stránský", email: "marek@example.com" },
            }),
        );

        expect(captured.rows).toEqual([
            { id: "self-admin", name: "Marek Stránský (you)", email: "marek@example.com" },
        ]);
        // The Admin tag is a real UiTag rendered into the row's controls slot.
        expect(screen.getByText(MESSAGES["objectShare.adminTag.label"]!)).toBeInTheDocument();
    });

    it("renders no rows when the controller classifies no admin row", () => {
        renderDialog(makeController({ grantees: [], adminSelfRow: undefined }));

        expect(captured.rows).toEqual([]);
    });

    it("prepends the admin self row above added grantees rather than replacing them", () => {
        // A caller with no grant of their own keeps the Admin badge even after
        // adding grantees for others — the badge is not a zero-grantees empty state.
        renderDialog(
            makeController({
                grantees: [OTHER_GRANTEE],
                adminSelfRow: { name: "Marek Stránský", email: "marek@example.com" },
            }),
        );

        expect(captured.rows.map((r) => r.id)).toEqual(["self-admin", "user:u1"]);
    });
});

describe("ObjectShareDialog sole-row identity guard", () => {
    it("disables grantee-row controls while the controller reports them locked", () => {
        // An unidentified sole row may be the caller's own grant — mutating it
        // would bypass the self-restriction confirm.
        renderDialog(
            makeController({
                grantees: [{ ...SELF_GRANTEE, isSelf: undefined }],
                granteeControlsLocked: true,
            }),
        );

        expect(captured.controls.at(-1)?.isDisabled).toBe(true);
        // Locked, but not self-managed — no self-restrict level disabling.
        expect(captured.controls.at(-1)?.disabledLevels).toBeUndefined();
    });

    it("leaves grantee-row controls enabled when not locked", () => {
        renderDialog(
            makeController({
                grantees: [SELF_GRANTEE, OTHER_GRANTEE],
            }),
        );

        expect(captured.controls.every((c) => !c.isDisabled)).toBe(true);
    });
});

describe("ObjectShareDialog summary synchronization", () => {
    it("emits onSummaryChange when the displayed access changes", () => {
        const summaryA = {
            generalAccess: "RESTRICTED" as const,
            workspaceLevel: "VIEW" as const,
            granteeCount: 1,
        };
        const summaryB = {
            generalAccess: "RESTRICTED" as const,
            workspaceLevel: "VIEW" as const,
            granteeCount: 2,
        };
        const onSummaryChange = vi.fn();
        const controller = makeController({ summary: summaryA });
        injected.controller = controller;
        const view = () => (
            <IntlProvider locale="en-US" messages={MESSAGES}>
                <BackendProvider backend={dummyBackendEmptyData()}>
                    <WorkspaceProvider workspace="ws">
                        <ObjectShareDialog
                            target={TARGET}
                            objectTitle="Country"
                            isOpen
                            onClose={noop}
                            onSummaryChange={onSummaryChange}
                        />
                    </WorkspaceProvider>
                </BackendProvider>
            </IntlProvider>
        );
        const { rerender } = render(view());
        expect(onSummaryChange).toHaveBeenLastCalledWith(summaryA);

        // A summary-affecting mutation produces a new summary → one more emission.
        injected.controller = makeController({ summary: summaryB });
        rerender(view());
        expect(onSummaryChange).toHaveBeenLastCalledWith(summaryB);
        expect(onSummaryChange).toHaveBeenCalledTimes(2);
    });

    it("does not emit before the access list has loaded", () => {
        const onSummaryChange = vi.fn();
        renderDialog(makeController({ status: "loading", summary: undefined }), onSummaryChange);
        expect(onSummaryChange).not.toHaveBeenCalled();
    });
});
