// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { act, renderHook, waitFor as rtlWaitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { type Mock, afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import {
    type IAnalyticalBackend,
    type IObjectPermissionsObject,
    type IWorkspaceObjectPermissionsService,
    PermissionEscalationRefused,
    UnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import {
    type AccessGranteeDetail,
    type AccessGranularPermission,
    type IAvailableAccessGrantee,
    type IGranularAccessGrantee,
    type IUser,
    type IWorkspacePermissions,
    idRef,
    uriRef,
} from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { createTightWaitFor } from "@gooddata/util";

import { objectShareMessages } from "./messages.js";
import type {
    IObjectShareController,
    IUseObjectShareOptions,
    ObjectSharePermissionLevel,
} from "./objectShareController.types.js";
import type { IObjectShareLabel } from "./types.js";

// Toast is a side-effect, not the logic under test — stub it so the controller's
// addSuccess/addError calls are observable no-ops without a ToastsCenter provider.
const addSuccess = vi.fn();
const addError = vi.fn();
const addWarning = vi.fn();
vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => {
    const actual = (await importOriginal()) as Record<string, unknown>;
    return {
        ...actual,
        useToastMessage: () => ({ addSuccess, addError, addProgress: vi.fn(), addWarning }),
    };
});

/*
 * Test isolation is disabled for this package, so the module cache is shared between test files:
 * useObjectShareController.js may already have been evaluated - bound to another file's useToastMessage
 * stub - elsewhere, and the mocked graph this file builds must not outlive it. Re-import it up front so the
 * toast spies above are the ones the controller calls, and drop the mocked graph again on the way out.
 *
 * This runs while the file is still being imported, not from a `beforeAll`: the re-import pulls the whole
 * ui-kit graph behind the controller through the mock above, and whichever file loads it first in a worker
 * pays seconds for it - more than the 10s `hookTimeout` allows on a loaded CI machine, which is what made
 * this suite flake. Module loading carries no such budget, and there is nothing cheaper to move off it:
 * the reset is what the mock wiring depends on.
 */
vi.resetModules();
const { useObjectShareController } = await import("./useObjectShareController.js");

afterAll(() => {
    vi.resetModules();
});

/**
 * `renderHook` mounts a component that renders nothing, so a controller state change
 * mutates no DOM. waitFor's MutationObserver therefore never fires and every await
 * falls through to its default polling interval — a flat tax per call, even though
 * the controller settles on the next microtask. Poll tightly instead.
 */
const waitFor = createTightWaitFor(rtlWaitFor);

const WORKSPACE = "ws";
const TARGET: IObjectPermissionsObject = { kind: "label", ref: idRef("label.country") };

// A definitive 404 — the backend's signal that a label isn't independently
// permissionable. Distinct from a transient error (which must NOT drop the label).
const notFound = () => new UnexpectedResponseError("Not Found", 404, {});

// The refusal the backend reports for granting more than the caller holds. The tiger
// converter builds it from the 400 (see its own tests); here it arrives already typed.
const escalationRefused = () => new PermissionEscalationRefused("refused");

const USER_GRANT: AccessGranteeDetail = {
    type: "granularUser",
    user: { ref: idRef("u1"), uri: "/u1", login: "jane", email: "jane@example.com", fullName: "Jane Good" },
    permissions: ["VIEW"],
    inheritedPermissions: [],
} as AccessGranteeDetail;

const ASSIGNEES: IAvailableAccessGrantee[] = [
    { type: "user", ref: idRef("u2"), name: "Marek", email: "marek@example.com", status: "ENABLED" },
    { type: "group", ref: idRef("g1"), name: "Marketing" },
];

/** How the mocked backend answers the caller's workspace permissions. */
type ManagePermission = false | "reject" | { canManageProject: boolean };

interface IMockService {
    getAccessList: Mock;
    manageObjectPermissions: Mock;
    getAvailableAssignees: Mock;
}

// The ref the signed-in user's own grant rows carry in the access list.
const CURRENT_USER_REF = idRef("self");

// The profile resolved for the signed-in user. Its shape mirrors tiger: `ref` is a
// uriRef (never comparable to the access list's idRefs), the user id lives in
// `login` — the controller must resolve the current user from `login`, or nothing
// self-related matches. A spy so tests can anchor on the profile having actually
// resolved (an unmarked row is also just its unresolved default).
const getUserMock = vi.fn(
    async (): Promise<Pick<IUser, "ref" | "login" | "fullName" | "email">> => ({
        ref: uriRef("/api/v1/profile"),
        login: "self",
    }),
);

// Only `canManageProject` is read; the interface has ~20 required members, so this is
// a genuine partial mock.
const workspacePermissionsFor = (canManageProject: boolean) =>
    ({ canManageProject }) as IWorkspacePermissions;

function makeBackend(svc: IMockService, manage: ManagePermission = false): IAnalyticalBackend {
    const base = dummyBackendEmptyData();
    return {
        ...base,
        // Self-row identity resolves from the profile; the dummy backend doesn't
        // implement currentUser, so stub getUser here.
        currentUser: () => ({ getUser: getUserMock }),
        workspace: (id: string) => ({
            ...base.workspace(id),
            objectPermissions: () => svc as unknown as IWorkspaceObjectPermissionsService,
            // The dummy backend throws NotSupported here; answer deterministically.
            permissions: () => ({
                getPermissionsForCurrentUser: async () => {
                    if (manage === "reject") {
                        throw new Error("workspace permissions unavailable");
                    }
                    return workspacePermissionsFor(manage === false ? false : manage.canManageProject);
                },
            }),
        }),
    } as unknown as IAnalyticalBackend;
}

function makeService(grants: AccessGranteeDetail[] = [USER_GRANT]): IMockService {
    return {
        getAccessList: vi.fn(async () => ({ grants })),
        manageObjectPermissions: vi.fn(async () => undefined),
        getAvailableAssignees: vi.fn(async () => ASSIGNEES),
    };
}

function renderController(
    svc: IMockService,
    target: IObjectPermissionsObject | undefined,
    options?: IUseObjectShareOptions,
    manage: ManagePermission = false,
) {
    const backend = makeBackend(svc, manage);
    const wrapper = ({ children }: PropsWithChildren) => (
        <IntlProvider locale="en-US" messages={{}}>
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={WORKSPACE}>{children}</WorkspaceProvider>
            </BackendProvider>
        </IntlProvider>
    );
    return renderHook(() => useObjectShareController(target, options), { wrapper });
}

const PRIMARY_LABEL: IObjectShareLabel = {
    ref: idRef("lbl.primary"),
    id: "lbl.primary",
    title: "Id",
    isPrimary: true,
    isDefault: false,
};
const NAME_LABEL: IObjectShareLabel = {
    ref: idRef("lbl.name"),
    id: "lbl.name",
    title: "Name",
    isPrimary: false,
    isDefault: true,
};
const EMAIL_LABEL: IObjectShareLabel = {
    ref: idRef("lbl.email"),
    id: "lbl.email",
    title: "Email",
    isPrimary: false,
    isDefault: false,
};
const LABELS = [PRIMARY_LABEL, NAME_LABEL, EMAIL_LABEL];

/**
 * Mock service whose getAccessList answers per target: the attribute target and a
 * configurable set of labels each return USER_GRANT (so u1 is "granted" there);
 * any other label returns no grants. Lets tests assert per-label scope resolution.
 */
function makeLabelAwareService(
    grantedLabelIds: string[] = ["lbl.primary", "lbl.name", "lbl.email"],
): IMockService {
    return {
        getAccessList: vi.fn(async (t: IObjectPermissionsObject) => {
            const id = (t.ref as { identifier: string }).identifier;
            // Attribute target + any granted label returns the user grant.
            const granted = id === "label.country" || grantedLabelIds.includes(id);
            return { grants: granted ? [USER_GRANT] : [] };
        }),
        manageObjectPermissions: vi.fn(async () => undefined),
        getAvailableAssignees: vi.fn(async () => ASSIGNEES),
    };
}

/**
 * Mock service for the child-workspace shape: u1 holds the object and `lbl.name`
 * directly, while `lbl.email` reports them with permissions [] and inheritedPermissions
 * ["EDIT","VIEW"] — a grant that lives in a parent workspace (source "indirect").
 */
function makeInheritedLabelService(): IMockService {
    const INHERITED_GRANT = {
        ...USER_GRANT,
        permissions: [],
        inheritedPermissions: ["EDIT", "VIEW"],
    } as unknown as AccessGranteeDetail;
    return {
        getAccessList: vi.fn(async (t: IObjectPermissionsObject) => {
            const id = (t.ref as { identifier: string }).identifier;
            if (id === "lbl.email") {
                return { grants: [INHERITED_GRANT] };
            }
            return {
                grants: ["label.country", "lbl.primary", "lbl.name"].includes(id) ? [USER_GRANT] : [],
            };
        }),
        manageObjectPermissions: vi.fn(async () => undefined),
        getAvailableAssignees: vi.fn(async () => ASSIGNEES),
    };
}

/**
 * Mock service where `lbl.name` carries BOTH a grant made here and an inherited one —
 * the shape that made a dual-granted label read as inaccessible once the local grant was
 * revoked.
 */
function makeDualGrantLabelService(): IMockService {
    const DUAL_GRANT = {
        ...USER_GRANT,
        permissions: ["VIEW"],
        inheritedPermissions: ["EDIT", "VIEW"],
    } as unknown as AccessGranteeDetail;
    return {
        getAccessList: vi.fn(async (t: IObjectPermissionsObject) => {
            const id = (t.ref as { identifier: string }).identifier;
            if (id === "lbl.name") {
                return { grants: [DUAL_GRANT] };
            }
            return {
                grants: ["label.country", "lbl.primary"].includes(id) ? [USER_GRANT] : [],
            };
        }),
        manageObjectPermissions: vi.fn(async () => undefined),
        getAvailableAssignees: vi.fn(async () => ASSIGNEES),
    };
}

describe("useObjectShareController", () => {
    beforeEach(() => {
        addSuccess.mockClear();
        addError.mockClear();
        addWarning.mockClear();
        // Not just hygiene: the gate tests anchor on getUserMock having resolved,
        // which would trivially hold from a previous test's call.
        getUserMock.mockClear();
    });

    it("derives grantee rows and summary from the fetched access list", async () => {
        const { result } = renderController(makeService(), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        expect(result.current.state.grantees).toEqual([
            expect.objectContaining({ id: "user:u1", kind: "user", name: "Jane Good", level: "VIEW" }),
        ]);
        expect(result.current.state.summary?.granteeCount).toBe(1);
        expect(result.current.state.generalAccess).toBe("RESTRICTED");
    });

    it("surfaces an EDIT grant as level EDIT without collapsing it to VIEW", async () => {
        const EDIT_GRANT: AccessGranteeDetail = {
            type: "granularUser",
            user: {
                ref: idRef("u1"),
                uri: "/u1",
                login: "jane",
                email: "jane@example.com",
                fullName: "Jane Good",
            },
            permissions: ["EDIT", "VIEW"],
            inheritedPermissions: [],
        } as AccessGranteeDetail;
        const { result } = renderController(makeService([EDIT_GRANT]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        const row = result.current.state.grantees.find((g) => g.id === "user:u1");
        expect(row?.level).toBe("EDIT");
        // A direct EDIT already outranks any inherited SHARE — no "effective above" badge.
        expect(row?.effectivePermission).toBeUndefined();
    });

    it("does not warn about inherited SHARE when the direct grant is EDIT", async () => {
        const EDIT_INHERITS_SHARE: AccessGranteeDetail = {
            type: "granularUser",
            user: {
                ref: idRef("u1"),
                uri: "/u1",
                login: "jane",
                email: "jane@example.com",
                fullName: "Jane Good",
            },
            permissions: ["EDIT", "VIEW"],
            inheritedPermissions: ["SHARE", "VIEW"],
        } as AccessGranteeDetail;
        const { result } = renderController(makeService([EDIT_INHERITS_SHARE]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        const row = result.current.state.grantees.find((g) => g.id === "user:u1");
        expect(row?.level).toBe("EDIT");
        expect(row?.effectivePermission).toBeUndefined();
    });

    it("flags effectivePermission when inherited access exceeds the direct grant", async () => {
        // Direct VIEW, but inherits SHARE (e.g. via a group) → effective is SHARE.
        const INHERITED: AccessGranteeDetail = {
            type: "granularUser",
            user: {
                ref: idRef("u1"),
                uri: "/u1",
                login: "jane",
                email: "jane@example.com",
                fullName: "Jane Good",
            },
            permissions: ["VIEW"],
            inheritedPermissions: ["SHARE", "VIEW"],
        } as AccessGranteeDetail;
        const { result } = renderController(makeService([INHERITED]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        const row = result.current.state.grantees.find((g) => g.id === "user:u1");
        // The row shows the EFFECTIVE level, not the direct grant — an inherited
        // permission must never be understated (F1-2723). `directLevel` keeps what
        // this workspace granted, and the badge marks the level as inherited.
        expect(row?.level).toBe("SHARE");
        expect(row?.directLevel).toBe("VIEW");
        expect(row?.effectivePermission).toBe("SHARE");
    });

    it("shows an inherited-only grantee at the inherited level instead of falling back to VIEW", async () => {
        // The child-workspace case: no grant here, EDIT inherited from the parent.
        // Falling back to VIEW is what F1-2723 reported.
        const INHERITED_ONLY: AccessGranteeDetail = {
            type: "granularUser",
            user: {
                ref: idRef("u1"),
                uri: "/u1",
                login: "jane",
                email: "jane@example.com",
                fullName: "Jane Good",
            },
            permissions: [],
            inheritedPermissions: ["EDIT", "VIEW"],
        } as AccessGranteeDetail;
        const { result } = renderController(makeService([INHERITED_ONLY]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        const row = result.current.state.grantees.find((g) => g.id === "user:u1");
        expect(row?.level).toBe("EDIT");
        expect(row?.directLevel).toBeUndefined();
        expect(row?.effectivePermission).toBe("EDIT");
    });

    it("refuses to remove a grantee whose access is inherited-only", async () => {
        // Nothing was granted here, so there is nothing to revoke: the write would be
        // an empty-permissions no-op that the row then reported as removed (F1-2726).
        const INHERITED_ONLY: AccessGranteeDetail = {
            type: "granularUser",
            user: {
                ref: idRef("u1"),
                uri: "/u1",
                login: "jane",
                email: "jane@example.com",
                fullName: "Jane Good",
            },
            permissions: [],
            inheritedPermissions: ["VIEW"],
        } as AccessGranteeDetail;
        const svc = makeService([INHERITED_ONLY]);
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });
        expect(svc.manageObjectPermissions).not.toHaveBeenCalled();
        expect(result.current.state.grantees.map((g) => g.id)).toEqual(["user:u1"]);
    });

    it("removes the direct grant of a grantee who also inherits, keeping the row inherited-only", async () => {
        // A user present in the parent workspace's list must still be removable here —
        // the removal takes the local grant away and the inherited access remains
        // (F1-2726).
        const DIRECT_AND_INHERITED: AccessGranteeDetail = {
            type: "granularUser",
            user: {
                ref: idRef("u1"),
                uri: "/u1",
                login: "jane",
                email: "jane@example.com",
                fullName: "Jane Good",
            },
            permissions: ["EDIT", "VIEW"],
            inheritedPermissions: ["VIEW"],
        } as AccessGranteeDetail;
        const svc = makeService([DIRECT_AND_INHERITED]);
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.grantees[0]?.level).toBe("EDIT");

        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });
        expect(svc.manageObjectPermissions).toHaveBeenCalled();
        const row = result.current.state.grantees.find((g) => g.id === "user:u1");
        expect(row).toMatchObject({ level: "VIEW", directLevel: undefined });
    });

    it("leaves effectivePermission unset when the direct grant already covers it", async () => {
        // USER_GRANT is plain VIEW with no inherited SHARE.
        const { result } = renderController(makeService(), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.grantees[0]?.effectivePermission).toBeUndefined();
    });

    it("recomposes the displayed level and badge when the direct level changes", async () => {
        // u1 is directly granted EDIT and inherits SHARE → EDIT covers the inherited
        // level, so no badge. Lowering the direct grant to VIEW still reduces the
        // effective level, but only down to the inherited SHARE floor — and the badge
        // returns to say the remaining level is inherited. No refetch recomputes this.
        const INHERITED: AccessGranteeDetail = {
            type: "granularUser",
            user: {
                ref: idRef("u1"),
                uri: "/u1",
                login: "jane",
                email: "jane@example.com",
                fullName: "Jane Good",
            },
            permissions: ["EDIT", "VIEW"],
            inheritedPermissions: ["SHARE", "VIEW"],
        } as AccessGranteeDetail;
        const { result } = renderController(makeService([INHERITED]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.grantees[0]).toMatchObject({
            level: "EDIT",
            directLevel: "EDIT",
            effectivePermission: undefined,
        });

        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "VIEW");
        });
        expect(result.current.state.grantees[0]).toMatchObject({
            level: "SHARE",
            directLevel: "VIEW",
            effectivePermission: "SHARE",
        });
    });

    it("ignores picking the level the row already displays because of inheritance", async () => {
        // Direct VIEW under an inherited SHARE displays SHARE. Picking SHARE is the
        // displayed value, so it must not silently escalate the persisted direct grant
        // — the same rule the workspace rule follows.
        const INHERITED: AccessGranteeDetail = {
            type: "granularUser",
            user: {
                ref: idRef("u1"),
                uri: "/u1",
                login: "jane",
                email: "jane@example.com",
                fullName: "Jane Good",
            },
            permissions: ["VIEW"],
            inheritedPermissions: ["SHARE", "VIEW"],
        } as AccessGranteeDetail;
        const svc = makeService([INHERITED]);
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "SHARE");
        });
        expect(svc.manageObjectPermissions).not.toHaveBeenCalled();
        expect(result.current.state.grantees[0]).toMatchObject({
            level: "SHARE",
            directLevel: "VIEW",
        });
    });

    it("does not fetch and stays idle when there is no target", async () => {
        const svc = makeService();
        const { result } = renderController(svc, undefined);
        expect(svc.getAccessList).not.toHaveBeenCalled();
        expect(result.current.state.grantees).toEqual([]);
        expect(result.current.state.status).toBe("idle"); // settled, not a perpetual "loading"
    });

    it("reports error status when the access list fails to load", async () => {
        // The dialog keys its error notice off status==="error", so a failed load
        // must surface as error (not a silent empty "restricted" placeholder).
        const svc: IMockService = {
            getAccessList: vi.fn(async () => {
                throw new Error("boom");
            }),
            manageObjectPermissions: vi.fn(async () => undefined),
            getAvailableAssignees: vi.fn(async () => ASSIGNEES),
        };
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("error"));
        expect(result.current.state.error).toBeInstanceOf(Error);
        expect(result.current.state.grantees).toEqual([]);
    });

    it("loadOptions excludes already-granted ids and filters by query", async () => {
        const { result } = renderController(makeService(), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        const all = await result.current.actions.loadOptions("");
        expect(all.users.map((u) => u.id)).toEqual(["user:u2"]); // u1 already granted, excluded
        expect(all.groups.map((g) => g.id)).toEqual(["group:g1"]);

        const filtered = await result.current.actions.loadOptions("market");
        expect(filtered.users).toHaveLength(0);
        expect(filtered.groups.map((g) => g.id)).toEqual(["group:g1"]);
    });

    it("keeps loadOptions identity stable across calls (no refetch loop)", async () => {
        // The async picker re-fires its fetch whenever the loader's identity changes.
        // loadOptions caches assignee names as a side effect; if that write fed back
        // into its own dependencies, every call would produce a new loader and refetch
        // forever. Guard: calling it (and the resulting state updates) must not change
        // the loadOptions reference.
        const { result } = renderController(makeService(), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        const before = result.current.actions.loadOptions;
        await act(async () => {
            await result.current.actions.loadOptions("");
        });
        expect(result.current.actions.loadOptions).toBe(before);
    });

    it("confirmAddGrantees sends granular grants without refetching", async () => {
        const svc = makeService();
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                {
                    id: "group:g1",
                    ref: idRef("g1"),
                    kind: "group",
                    name: "Marketing",
                    permissionLevel: "SHARE",
                },
            ]),
        );
        await act(async () => {
            await result.current.actions.confirmAddGrantees();
        });

        expect(svc.manageObjectPermissions).toHaveBeenCalledTimes(1);
        const [, grantees] = svc.manageObjectPermissions.mock.calls[0] as [unknown, IGranularAccessGrantee[]];
        expect(grantees).toEqual([
            expect.objectContaining({ type: "granularGroup", permissions: ["SHARE", "VIEW"] }),
        ]);
        // Local state is authoritative — no post-write refetch of the object list.
        expect(svc.getAccessList).toHaveBeenCalledTimes(1);
        expect(addSuccess).toHaveBeenCalledTimes(1);
        // The grantee is now in local state (written through from the add).
        expect(result.current.state.grantees.some((g) => g.id === "group:g1")).toBe(true);
        expect(result.current.state.subview).toBe("main"); // closes add-grantee on success
    });

    it("shows an added grantee optimistically with its picker name while saving", async () => {
        const svc = makeService();
        // Hold manageObjectPermissions open so we can observe the in-flight state.
        let resolveSave: () => void = () => {};
        svc.manageObjectPermissions.mockImplementationOnce(
            () => new Promise<void>((res) => (resolveSave = () => res(undefined))),
        );
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        // Prime the identity cache deterministically (the on-open fetch also does this).
        await act(async () => {
            await result.current.actions.loadOptions("");
        });
        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                {
                    id: "group:g1",
                    ref: idRef("g1"),
                    kind: "group",
                    name: "Marketing",
                    permissionLevel: "VIEW",
                },
            ]),
        );
        let savePromise: Promise<void>;
        act(() => {
            savePromise = result.current.actions.confirmAddGrantees();
        });

        // Before the backend resolves: row is already visible, named, and pending —
        // and the pre-existing grantee is still there (the list never blanks).
        const optimistic = result.current.state.grantees.find((g) => g.id === "group:g1");
        expect(optimistic).toMatchObject({ name: "Marketing", level: "VIEW", pending: "saving" });
        expect(result.current.state.grantees.some((g) => g.id === "user:u1")).toBe(true);

        await act(async () => {
            resolveSave();
            await savePromise;
        });
        // Once the write resolves the saving marker clears from local state.
        expect(result.current.state.grantees.find((g) => g.id === "group:g1")?.pending).toBeUndefined();
    });

    it("keeps the existing grantee visible (no blank) during a permission change", async () => {
        const svc = makeService();
        let resolveSave: () => void = () => {};
        svc.manageObjectPermissions.mockImplementationOnce(
            () => new Promise<void>((res) => (resolveSave = () => res(undefined))),
        );
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        let changePromise: Promise<void>;
        act(() => {
            changePromise = result.current.actions.changePermissionLevel("user:u1", "SHARE");
        });
        // Mid-flight: row stays present and is marked saving — never removed/blanked.
        const row = result.current.state.grantees.find((g) => g.id === "user:u1");
        expect(row).toMatchObject({ name: "Jane Good", pending: "saving" });

        await act(async () => {
            resolveSave();
            await changePromise;
        });
        expect(result.current.state.grantees.find((g) => g.id === "user:u1")?.pending).toBeUndefined();
    });

    it("fetches available assignees on demand when the Add picker opens", async () => {
        // No eager on-open fetch — the picker's loadOptions hits the listing only
        // when the user actually opens Add, and each option carries its backend ref.
        const svc = makeService([USER_GRANT]);
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(svc.getAvailableAssignees).not.toHaveBeenCalled();

        await act(async () => {
            await result.current.actions.loadOptions("");
        });
        expect(svc.getAvailableAssignees).toHaveBeenCalledTimes(1);
    });

    it("displays a grant with only a raw id by its id, without any assignee fetch", async () => {
        // The permissions response is the single source of names now (F1-2721). If a
        // grant still arrives id-only, the row shows the id via the name→email→id
        // fallback — there is no eager backfill fetch to resolve it.
        const RAW: AccessGranteeDetail = {
            type: "granularUser",
            user: { ref: idRef("u2"), uri: "u2", login: "u2", email: "u2", fullName: "u2" },
            permissions: ["VIEW"],
            inheritedPermissions: [],
        } as AccessGranteeDetail;
        const svc = makeService([RAW]);
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        // Row present, no assignee listing fetched, name fact absent (id-only grant).
        expect(result.current.state.grantees.find((g) => g.id === "user:u2")?.name).toBeUndefined();
        expect(svc.getAvailableAssignees).not.toHaveBeenCalled();
    });

    it("resolves the current user's own row identity from the profile, not the assignee listing", async () => {
        // The assignee listing excludes the signed-in user, so a self row's facts
        // can only come from the profile (the F1-2607 reload case).
        const RAW_SELF: AccessGranteeDetail = {
            type: "granularUser",
            user: { ref: idRef("self"), uri: "/self", login: "self", email: "self", fullName: "self" },
            permissions: ["SHARE", "VIEW"],
            inheritedPermissions: [],
        } as AccessGranteeDetail;
        getUserMock.mockResolvedValueOnce({
            ref: uriRef("/api/v1/profile"),
            login: "self",
            fullName: "Sam Self",
            email: "sam@example.com",
        });
        const svc = makeService([RAW_SELF]);
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        await waitFor(() => {
            const row = result.current.state.grantees.find((g) => g.id === "user:self");
            expect(row?.name).toBe("Sam Self");
            expect(row?.email).toBe("sam@example.com");
        });
    });

    it("does not fabricate an email fact when the current user's email is their user id", async () => {
        // On tiger the user id is often the email itself (profile email === login);
        // it must de-collapse, or the row would show the same string twice.
        const RAW_SELF: AccessGranteeDetail = {
            type: "granularUser",
            user: {
                ref: idRef("sam@example.com"),
                uri: "/self",
                login: "sam@example.com",
                email: "sam@example.com",
                fullName: "sam@example.com",
            },
            permissions: ["SHARE", "VIEW"],
            inheritedPermissions: [],
        } as AccessGranteeDetail;
        getUserMock.mockResolvedValueOnce({
            ref: uriRef("/api/v1/profile"),
            login: "sam@example.com",
            email: "sam@example.com",
        });
        const svc = makeService([RAW_SELF]);
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(getUserMock).toHaveResolved());
        await act(async () => {});

        const row = result.current.state.grantees.find((g) => g.id === "user:sam@example.com");
        expect(row).toBeDefined();
        // No name and no email fact — the row displays the bare userID alone.
        expect(row?.name).toBeUndefined();
        expect(row?.email).toBeUndefined();
    });

    it("writes the new level through to local state and keeps it", async () => {
        // The initial fetch reports VIEW. After committing SHARE, the row reflects
        // SHARE from local state (which is authoritative) and is no longer pending —
        // there is no refetch that could revert it to the fetched VIEW.
        const svc = makeService();
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "SHARE");
        });

        const row = result.current.state.grantees.find((g) => g.id === "user:u1");
        expect(row?.level).toBe("SHARE");
        expect(row?.pending).toBeUndefined();
    });

    it("rolls back the optimistic row when an add fails", async () => {
        const svc = makeService();
        svc.manageObjectPermissions.mockRejectedValueOnce(new Error("nope"));
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                {
                    id: "group:g1",
                    ref: idRef("g1"),
                    kind: "group",
                    name: "Marketing",
                    permissionLevel: "VIEW",
                },
            ]),
        );
        await act(async () => {
            await result.current.actions.confirmAddGrantees();
        });

        expect(addError).toHaveBeenCalledTimes(1);
        // The optimistic row is gone; only the committed grantee remains.
        expect(result.current.state.grantees.some((g) => g.id === "group:g1")).toBe(false);
        expect(result.current.state.grantees.map((g) => g.id)).toEqual(["user:u1"]);
    });

    it("changePermissionLevel sends the new permissions for the grantee", async () => {
        const svc = makeService();
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "SHARE");
        });
        const [, grantees] = svc.manageObjectPermissions.mock.calls[0] as [unknown, IGranularAccessGrantee[]];
        expect(grantees).toEqual([
            expect.objectContaining({ type: "granularUser", permissions: ["SHARE", "VIEW"] }),
        ]);
    });

    it("changePermissionLevel writes an EDIT grant for the grantee", async () => {
        const svc = makeService();
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "EDIT");
        });
        const [, grantees] = svc.manageObjectPermissions.mock.calls[0] as [unknown, IGranularAccessGrantee[]];
        expect(grantees).toEqual([
            expect.objectContaining({ type: "granularUser", permissions: ["EDIT", "VIEW"] }),
        ]);
        expect(result.current.state.grantees.find((g) => g.id === "user:u1")?.level).toBe("EDIT");
    });

    it("re-grades the grantee's in-scope labels to the new level", async () => {
        // A label grant carries its own level, so re-grading the object alone left the
        // labels at the level they were granted at (F1-2623). Raising the object to
        // EDIT must rewrite every in-scope label at EDIT too.
        const svc = makeLabelAwareService();
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.labelsResolved).toBe(true));

        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "EDIT");
        });

        const written = svc.manageObjectPermissions.mock.calls.map(
            ([t, grantees]) =>
                [
                    (t as IObjectPermissionsObject & { ref: { identifier: string } }).ref.identifier,
                    (grantees as IGranularAccessGrantee[])[0]!.permissions,
                ] as const,
        );
        // The object grant, then each in-scope NON-PRIMARY label at the same level.
        expect(written).toEqual(
            expect.arrayContaining([
                ["label.country", ["EDIT", "VIEW"]],
                ["lbl.name", ["EDIT", "VIEW"]],
                ["lbl.email", ["EDIT", "VIEW"]],
            ]),
        );
        // The primary label is left alone: its access is implicit and the removal diff
        // never revokes it, so a grant written here would outlive the grantee's access.
        expect(written.map(([id]) => id)).not.toContain("lbl.primary");
    });

    it("lowers the labels before the object so a label grant is never left above it", async () => {
        // Order matters on a downgrade: writing the object first would leave the
        // labels transiently broader than the object they belong to.
        const svc = makeLabelAwareService();
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.labelsResolved).toBe(true));
        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "EDIT");
        });
        svc.manageObjectPermissions.mockClear();

        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "VIEW");
        });
        const targets = svc.manageObjectPermissions.mock.calls.map(
            ([t]) => (t as IObjectPermissionsObject & { ref: { identifier: string } }).ref.identifier,
        );
        // Every label precedes the object write.
        expect(targets.indexOf("label.country")).toBe(targets.length - 1);
    });

    it("grants a newly scoped label at the level the grantee holds on the object", async () => {
        // The labels picker adds a label: its grant must mirror the object level
        // rather than always landing on VIEW.
        const svc = makeLabelAwareService(["lbl.primary"]);
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.labelsResolved).toBe(true));
        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "SHARE");
        });
        svc.manageObjectPermissions.mockClear();

        await act(async () => {
            await result.current.actions.changeGranteeLabels("user:u1", ["lbl.primary", "lbl.name"]);
        });
        const [target, grantees] = svc.manageObjectPermissions.mock.calls[0] as [
            IObjectPermissionsObject & { ref: { identifier: string } },
            IGranularAccessGrantee[],
        ];
        expect(target.ref.identifier).toBe("lbl.name");
        expect(grantees[0]!.permissions).toEqual(["SHARE", "VIEW"]);
    });

    it("settles the row from local state after a write (no refetch)", async () => {
        // The object list is fetched exactly once. After a successful write the row
        // reflects the new level and drops its pending flag from local state alone —
        // there is no post-write refetch to reconcile against.
        const svc = makeService();
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "SHARE");
        });

        expect(addSuccess).toHaveBeenCalled();
        const row = result.current.state.grantees.find((g) => g.id === "user:u1");
        expect(row?.level).toBe("SHARE");
        expect(row?.pending).toBeUndefined();
        // The list is never re-read — local state is authoritative.
        expect(svc.getAccessList).toHaveBeenCalledTimes(1);
    });

    it("reverts the level to its prior value when a permission change fails", async () => {
        // Single-field rollback: the failed write must restore exactly the level
        // that was there before — and clear the saving marker.
        const svc = makeService();
        svc.manageObjectPermissions.mockRejectedValueOnce(new Error("nope"));
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.grantees.find((g) => g.id === "user:u1")?.level).toBe("VIEW");

        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "SHARE");
        });

        const row = result.current.state.grantees.find((g) => g.id === "user:u1");
        expect(row?.level).toBe("VIEW"); // rolled back
        expect(row?.pending).toBeUndefined();
        expect(addError).toHaveBeenCalledTimes(1);
    });

    // Successive edits compose on the same row with no refetch in between, so the
    // fetched base doesn't hold the row's last-committed state — the overlay must.
    describe("edit composition on the same row (no refetch)", () => {
        const addGrantee = async (
            result: { current: IObjectShareController },
            level: ObjectSharePermissionLevel,
        ) => {
            act(() => result.current.actions.openAddGrantee());
            act(() =>
                result.current.actions.setPendingGrantees([
                    {
                        id: "group:g1",
                        ref: idRef("g1"),
                        kind: "group",
                        name: "Marketing",
                        permissionLevel: level,
                    },
                ]),
            );
            await act(async () => {
                await result.current.actions.confirmAddGrantees();
            });
        };

        it("keeps a freshly added grantee visible after changing its level", async () => {
            // Regression (found in browser): the added row exists only in the overlay,
            // and the level change used to replace its entry — vanishing the row.
            const svc = makeService();
            const { result } = renderController(svc, TARGET);
            await waitFor(() => expect(result.current.state.status).toBe("success"));
            await addGrantee(result, "SHARE");

            await act(async () => {
                await result.current.actions.changePermissionLevel("group:g1", "VIEW");
            });

            const row = result.current.state.grantees.find((g) => g.id === "group:g1");
            expect(row).toMatchObject({ name: "Marketing", level: "VIEW" });
            expect(row?.pending).toBeUndefined();
            expect(result.current.state.summary?.granteeCount).toBe(2); // u1 + g1
        });

        it("restores a freshly added grantee's committed level when the follow-up change fails", async () => {
            const svc = makeService();
            const { result } = renderController(svc, TARGET);
            await waitFor(() => expect(result.current.state.status).toBe("success"));
            await addGrantee(result, "SHARE");

            svc.manageObjectPermissions.mockRejectedValueOnce(new Error("nope"));
            await act(async () => {
                await result.current.actions.changePermissionLevel("group:g1", "VIEW");
            });

            const row = result.current.state.grantees.find((g) => g.id === "group:g1");
            expect(row).toMatchObject({ name: "Marketing", level: "SHARE" }); // committed add, not gone
            expect(row?.pending).toBeUndefined();
        });

        it("restores a freshly added grantee when its removal fails", async () => {
            const svc = makeService();
            const { result } = renderController(svc, TARGET);
            await waitFor(() => expect(result.current.state.status).toBe("success"));
            await addGrantee(result, "SHARE");

            svc.manageObjectPermissions.mockRejectedValueOnce(new Error("nope"));
            await act(async () => {
                await result.current.actions.removeGrantee("group:g1");
            });

            const row = result.current.state.grantees.find((g) => g.id === "group:g1");
            expect(row).toMatchObject({ name: "Marketing", level: "SHARE" });
            expect(row?.pending).toBeUndefined();
        });

        it("rolls a repeated level change back to the last committed level, not the fetched one", async () => {
            const svc = makeService();
            const { result } = renderController(svc, TARGET);
            await waitFor(() => expect(result.current.state.status).toBe("success"));

            // First change commits (backend now holds SHARE)...
            await act(async () => {
                await result.current.actions.changePermissionLevel("user:u1", "SHARE");
            });
            // ...so a failed second change must revert to SHARE, not the fetched VIEW.
            svc.manageObjectPermissions.mockRejectedValueOnce(new Error("nope"));
            await act(async () => {
                await result.current.actions.changePermissionLevel("user:u1", "EDIT");
            });

            const row = result.current.state.grantees.find((g) => g.id === "user:u1");
            expect(row?.level).toBe("SHARE");
            expect(row?.pending).toBeUndefined();
        });

        it("keeps the committed workspace rule when a later general-access toggle fails", async () => {
            const svc = makeService();
            const { result } = renderController(svc, TARGET);
            await waitFor(() => expect(result.current.state.status).toBe("success"));

            // Grant workspace access and re-grade the rule to EDIT — both commit.
            act(() => result.current.actions.requestGeneralAccessChange("WORKSPACE"));
            await act(async () => {
                await result.current.actions.confirmGeneralAccessChange();
            });
            await act(async () => {
                await result.current.actions.changeWorkspaceLevel("EDIT");
            });
            expect(result.current.state.workspaceLevel).toBe("EDIT");

            // A failed Restricted toggle must revert to the committed WORKSPACE/EDIT
            // rule, not to the fetched (restricted) state.
            svc.manageObjectPermissions.mockRejectedValueOnce(new Error("nope"));
            act(() => result.current.actions.requestGeneralAccessChange("RESTRICTED"));
            await act(async () => {
                await result.current.actions.confirmGeneralAccessChange();
            });

            expect(result.current.state.generalAccess).toBe("WORKSPACE");
            expect(result.current.state.workspaceLevel).toBe("EDIT");
        });
    });

    it("removeGrantee sends empty permissions", async () => {
        const svc = makeService();
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });
        const [, grantees] = svc.manageObjectPermissions.mock.calls[0] as [unknown, IGranularAccessGrantee[]];
        expect(grantees).toEqual([expect.objectContaining({ type: "granularUser", permissions: [] })]);
    });

    it("drops the grantee from the summary count on remove", async () => {
        const svc = makeService();
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.summary?.granteeCount).toBe(1);

        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });
        // The inline access row reads summary.granteeCount; the removal drops the row
        // from local state, so the count reflects it immediately (no refetch).
        expect(result.current.state.grantees).toEqual([]);
        expect(result.current.state.summary?.granteeCount).toBe(0);
    });

    it("general access change is staged, then optimistically applied on confirm", async () => {
        const svc = makeService();
        // Hold the write open to observe the optimistic state before it resolves.
        let resolveSave: () => void = () => {};
        svc.manageObjectPermissions.mockImplementationOnce(
            () => new Promise<void>((res) => (resolveSave = () => res(undefined))),
        );
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.generalAccess).toBe("RESTRICTED");

        // Request opens the confirm (pendingGeneralAccess set); nothing sent yet.
        act(() => result.current.actions.requestGeneralAccessChange("WORKSPACE"));
        expect(result.current.state.pendingGeneralAccess).toBe("WORKSPACE");
        expect(svc.manageObjectPermissions).not.toHaveBeenCalled();

        let confirmPromise: Promise<void>;
        act(() => {
            confirmPromise = result.current.actions.confirmGeneralAccessChange();
        });
        // Before the backend resolves: confirm is closed and the value already
        // reflects the change — no waiting, no missing feedback.
        expect(result.current.state.pendingGeneralAccess).toBeUndefined();
        expect(result.current.state.generalAccess).toBe("WORKSPACE");

        // The write is async (label reconcile precedes the object commit); wait for
        // it to fire before releasing the held mock.
        await waitFor(() => expect(svc.manageObjectPermissions).toHaveBeenCalled());
        await act(async () => {
            resolveSave();
            await confirmPromise;
        });
        const [, grantees] = svc.manageObjectPermissions.mock.calls[0] as [unknown, IGranularAccessGrantee[]];
        expect(grantees).toEqual([
            expect.objectContaining({ type: "allWorkspaceUsers", permissions: ["VIEW"] }),
        ]);
        expect(result.current.state.generalAccess).toBe("WORKSPACE");
    });

    it("reverts the optimistic general access when the change fails", async () => {
        const svc = makeService();
        svc.manageObjectPermissions.mockRejectedValueOnce(new Error("nope"));
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        act(() => result.current.actions.requestGeneralAccessChange("WORKSPACE"));
        await act(async () => {
            await result.current.actions.confirmGeneralAccessChange();
        });

        expect(addError).toHaveBeenCalledTimes(1);
        // Failed write rolls the radio back to its prior value.
        expect(result.current.state.generalAccess).toBe("RESTRICTED");
    });

    it("cancelling a general access change sends nothing", async () => {
        const svc = makeService();
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        act(() => result.current.actions.requestGeneralAccessChange("WORKSPACE"));
        act(() => result.current.actions.cancelGeneralAccessChange());
        expect(result.current.state.pendingGeneralAccess).toBeUndefined();
        expect(svc.manageObjectPermissions).not.toHaveBeenCalled();
    });

    it("reports workspace VIEW in the summary after re-enabling workspace access", async () => {
        // The backend initially returns an all-workspace SHARE rule. A general-access
        // write always grants workspace VIEW, so once the user restricts and re-enables
        // workspace access, the summary must report VIEW — not the SHARE the initial
        // fetch carried (there's no refetch to correct it).
        const WORKSPACE_SHARE: AccessGranteeDetail = {
            type: "allWorkspaceUsers",
            permissions: ["SHARE", "VIEW"],
            inheritedPermissions: [],
        };
        const { result } = renderController(makeService([WORKSPACE_SHARE]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        // Initial state from the fetch: workspace-wide SHARE.
        expect(result.current.state.summary).toMatchObject({
            generalAccess: "WORKSPACE",
            workspaceLevel: "SHARE",
        });

        // Restrict, then re-enable workspace access.
        act(() => result.current.actions.requestGeneralAccessChange("RESTRICTED"));
        await act(async () => {
            await result.current.actions.confirmGeneralAccessChange();
        });
        act(() => result.current.actions.requestGeneralAccessChange("WORKSPACE"));
        await act(async () => {
            await result.current.actions.confirmGeneralAccessChange();
        });

        // We wrote workspace VIEW, so the summary must read VIEW, not the stale SHARE.
        expect(result.current.state.summary).toMatchObject({
            generalAccess: "WORKSPACE",
            workspaceLevel: "VIEW",
        });
    });

    it("exposes the fetched workspace level and re-grades it to SHARE on demand", async () => {
        const WORKSPACE_VIEW: AccessGranteeDetail = {
            type: "allWorkspaceUsers",
            permissions: ["VIEW"],
            inheritedPermissions: [],
        };
        const svc = makeService([WORKSPACE_VIEW]);
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.generalAccess).toBe("WORKSPACE");
        expect(result.current.state.workspaceLevel).toBe("VIEW");

        await act(async () => {
            await result.current.actions.changeWorkspaceLevel("SHARE");
        });
        // Optimistically reflects SHARE and writes the rule with SHARE+VIEW.
        expect(result.current.state.workspaceLevel).toBe("SHARE");
        expect(result.current.state.summary).toMatchObject({ workspaceLevel: "SHARE" });
        const [, grantees] = svc.manageObjectPermissions.mock.calls[0] as [unknown, IGranularAccessGrantee[]];
        expect(grantees).toEqual([
            expect.objectContaining({ type: "allWorkspaceUsers", permissions: ["SHARE", "VIEW"] }),
        ]);
    });

    it("derives workspace access from any rule entry when the hierarchy returns several", async () => {
        // With workspace hierarchy the backend returns one allWorkspaceUsers entry per
        // granting workspace, in unspecified order — a parent's inherited-only entry
        // must not shadow this workspace's own grant (the post-refresh repro).
        const PARENT_RULE: AccessGranteeDetail = {
            type: "allWorkspaceUsers",
            permissions: [],
            inheritedPermissions: ["VIEW"],
        };
        const OWN_RULE: AccessGranteeDetail = {
            type: "allWorkspaceUsers",
            permissions: ["VIEW"],
            inheritedPermissions: [],
        };
        const { result } = renderController(makeService([PARENT_RULE, OWN_RULE]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.generalAccess).toBe("WORKSPACE");
        expect(result.current.state.workspaceInheritedLevel).toBe("VIEW");
        // A direct rule exists and only VIEW is inherited — re-grading stays possible.
        expect(result.current.state.workspaceLevelLocked).toBe(false);
    });

    it("shows inherited-only workspace access as WORKSPACE and refuses Restricted", async () => {
        const PARENT_RULE: AccessGranteeDetail = {
            type: "allWorkspaceUsers",
            permissions: [],
            inheritedPermissions: ["VIEW"],
        };
        const svc = makeService([PARENT_RULE]);
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        // The parent's rule grants every user of this workspace view access, so the
        // effective state is WORKSPACE even though this workspace holds no rule.
        expect(result.current.state.generalAccess).toBe("WORKSPACE");
        expect(result.current.state.summary).toMatchObject({
            generalAccess: "WORKSPACE",
            workspaceLevel: "VIEW",
        });
        expect(result.current.state.workspaceInheritedLevel).toBe("VIEW");
        // No direct rule to re-grade.
        expect(result.current.state.workspaceLevelLocked).toBe(true);

        // Restricted can't be honored here (the parent's rule persists) — not stageable.
        act(() => result.current.actions.requestGeneralAccessChange("RESTRICTED"));
        expect(result.current.state.pendingGeneralAccess).toBeUndefined();

        // The level guard likewise refuses re-grades: there is no rule to write.
        await act(async () => {
            await result.current.actions.changeWorkspaceLevel("SHARE");
        });
        expect(svc.manageObjectPermissions).not.toHaveBeenCalled();
    });

    it("pins the workspace level to an inherited SHARE over a direct VIEW but allows raising to EDIT", async () => {
        const PARENT_SHARE: AccessGranteeDetail = {
            type: "allWorkspaceUsers",
            permissions: [],
            inheritedPermissions: ["SHARE", "VIEW"],
        };
        const OWN_VIEW: AccessGranteeDetail = {
            type: "allWorkspaceUsers",
            permissions: ["VIEW"],
            inheritedPermissions: [],
        };
        const svc = makeService([PARENT_SHARE, OWN_VIEW]);
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.workspaceLevel).toBe("SHARE");
        expect(result.current.state.workspaceInheritedLevel).toBe("SHARE");
        // A direct EDIT would still raise the effective level, so the dropdown stays usable.
        expect(result.current.state.workspaceLevelLocked).toBe(false);
        // Policy travels with the classification: levels below the inherited SHARE.
        expect(result.current.state.workspaceDisabledLevels).toEqual(["VIEW"]);

        // A direct downgrade below the inherited level couldn't take effect — refused.
        await act(async () => {
            await result.current.actions.changeWorkspaceLevel("VIEW");
        });
        expect(svc.manageObjectPermissions).not.toHaveBeenCalled();

        // Re-picking the displayed (inherited) level is a no-op — it must NOT
        // silently escalate the persisted direct rule from VIEW to SHARE.
        await act(async () => {
            await result.current.actions.changeWorkspaceLevel("SHARE");
        });
        expect(svc.manageObjectPermissions).not.toHaveBeenCalled();

        // Raising above the inherited level is a real re-grade — written through.
        await act(async () => {
            await result.current.actions.changeWorkspaceLevel("EDIT");
        });
        expect(svc.manageObjectPermissions).toHaveBeenCalledWith(TARGET, [
            expect.objectContaining({ type: "allWorkspaceUsers", permissions: ["EDIT", "VIEW"] }),
        ]);
        expect(result.current.state.workspaceLevel).toBe("EDIT");
    });

    it("raises the workspace rule above an inherited SHARE with no self row present", async () => {
        const PARENT_SHARE: AccessGranteeDetail = {
            type: "allWorkspaceUsers",
            permissions: [],
            inheritedPermissions: ["SHARE", "VIEW"],
        };
        const OWN_VIEW: AccessGranteeDetail = {
            type: "allWorkspaceUsers",
            permissions: ["VIEW"],
            inheritedPermissions: [],
        };
        const svc = makeService([PARENT_SHARE, OWN_VIEW]);
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        await act(async () => {
            await result.current.actions.changeWorkspaceLevel("EDIT");
        });
        expect(svc.manageObjectPermissions).toHaveBeenCalledWith(TARGET, [
            expect.objectContaining({ type: "allWorkspaceUsers", permissions: ["EDIT", "VIEW"] }),
        ]);
    });

    it("locks the workspace level entirely under an inherited EDIT", async () => {
        const PARENT_EDIT: AccessGranteeDetail = {
            type: "allWorkspaceUsers",
            permissions: [],
            inheritedPermissions: ["EDIT", "VIEW"],
        };
        const OWN_VIEW: AccessGranteeDetail = {
            type: "allWorkspaceUsers",
            permissions: ["VIEW"],
            inheritedPermissions: [],
        };
        const svc = makeService([PARENT_EDIT, OWN_VIEW]);
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.workspaceLevel).toBe("EDIT");
        // Nothing can outrank an inherited EDIT — no re-grade could change the
        // effective level, so the dropdown is read-only.
        expect(result.current.state.workspaceLevelLocked).toBe(true);
    });

    it("blocks overlapping workspace-level writes while one is in flight", async () => {
        const WORKSPACE_VIEW: AccessGranteeDetail = {
            type: "allWorkspaceUsers",
            permissions: ["VIEW"],
            inheritedPermissions: [],
        };
        const svc = makeService([WORKSPACE_VIEW]);
        // Hold the first write open so a second toggle lands while it's pending.
        let resolveSave: () => void = () => {};
        svc.manageObjectPermissions.mockImplementationOnce(
            () => new Promise<void>((res) => (resolveSave = () => res(undefined))),
        );
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        let first: Promise<void>;
        act(() => {
            first = result.current.actions.changeWorkspaceLevel("SHARE");
        });
        // The write is in flight: flag is set and the optimistic level shows SHARE.
        expect(result.current.state.workspaceLevelSaving).toBe(true);
        expect(result.current.state.workspaceLevel).toBe("SHARE");

        // A second toggle while saving is a no-op — no extra write queued.
        await act(async () => {
            await result.current.actions.changeWorkspaceLevel("VIEW");
        });
        expect(svc.manageObjectPermissions).toHaveBeenCalledTimes(1);
        expect(result.current.state.workspaceLevel).toBe("SHARE");

        // Release the first write; the flag clears and the level sticks.
        await act(async () => {
            resolveSave();
            await first;
        });
        expect(result.current.state.workspaceLevelSaving).toBe(false);
        expect(result.current.state.workspaceLevel).toBe("SHARE");
        expect(svc.manageObjectPermissions).toHaveBeenCalledTimes(1);
    });

    it("blocks restricting general access while a workspace re-grade is in flight", async () => {
        // A late re-grade landing after a switch to Restricted would re-create the
        // allWorkspaceUsers rule; block the toggle until the re-grade settles.
        const WORKSPACE_VIEW_GRANT: AccessGranteeDetail = {
            type: "allWorkspaceUsers",
            permissions: ["VIEW"],
            inheritedPermissions: [],
        };
        const svc = makeService([WORKSPACE_VIEW_GRANT]);
        let resolveSave: () => void = () => {};
        svc.manageObjectPermissions.mockImplementationOnce(
            () => new Promise<void>((res) => (resolveSave = () => res(undefined))),
        );
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        let regrade: Promise<void>;
        act(() => {
            regrade = result.current.actions.changeWorkspaceLevel("SHARE");
        });
        expect(result.current.state.workspaceLevelSaving).toBe(true);

        // Try to restrict while the re-grade is pending — must be a no-op.
        act(() => result.current.actions.requestGeneralAccessChange("RESTRICTED"));
        await act(async () => {
            await result.current.actions.confirmGeneralAccessChange();
        });
        expect(result.current.state.generalAccess).toBe("WORKSPACE");
        expect(svc.manageObjectPermissions).toHaveBeenCalledTimes(1); // only the re-grade

        await act(async () => {
            resolveSave();
            await regrade;
        });
        expect(result.current.state.workspaceLevelSaving).toBe(false);
        expect(result.current.state.generalAccess).toBe("WORKSPACE");
    });

    it("blocks a workspace re-grade while the general-access save is in flight", async () => {
        // The mirror of the guard above: enabling workspace access is one logical
        // save (labels + the VIEW grant). Until it settles, the rule must stay
        // pending, or a re-grade started meanwhile would race it on the same
        // allWorkspaceUsers rule and the delayed VIEW write could land last.
        const svc = makeService();
        let resolveSave: () => void = () => {};
        svc.manageObjectPermissions.mockImplementationOnce(
            () => new Promise<void>((res) => (resolveSave = () => res(undefined))),
        );
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        act(() => result.current.actions.requestGeneralAccessChange("WORKSPACE"));
        let grant: Promise<void>;
        act(() => {
            grant = result.current.actions.confirmGeneralAccessChange();
        });
        // The save is in flight: the rule is pending so the level menu stays locked.
        expect(result.current.state.generalAccess).toBe("WORKSPACE"); // optimistic
        expect(result.current.state.workspaceLevelSaving).toBe(true);

        // A re-grade attempt in this window must be a no-op — no second write.
        await act(async () => {
            await result.current.actions.changeWorkspaceLevel("EDIT");
        });
        expect(svc.manageObjectPermissions).toHaveBeenCalledTimes(1);
        expect(result.current.state.workspaceLevel).toBe("VIEW");

        await act(async () => {
            resolveSave();
            await grant;
        });
        expect(result.current.state.workspaceLevelSaving).toBe(false);
        expect(result.current.state.generalAccess).toBe("WORKSPACE");
    });

    it("rolls the workspace level back when the re-grade write fails", async () => {
        const WORKSPACE_VIEW: AccessGranteeDetail = {
            type: "allWorkspaceUsers",
            permissions: ["VIEW"],
            inheritedPermissions: [],
        };
        const svc = makeService([WORKSPACE_VIEW]);
        svc.manageObjectPermissions.mockRejectedValueOnce(new Error("nope"));
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        await act(async () => {
            await result.current.actions.changeWorkspaceLevel("SHARE");
        });
        expect(addError).toHaveBeenCalledTimes(1);
        expect(result.current.state.workspaceLevel).toBe("VIEW");
    });

    it("ignores a workspace-level change while access is restricted", async () => {
        const svc = makeService(); // RESTRICTED — no workspace rule
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.generalAccess).toBe("RESTRICTED");

        await act(async () => {
            await result.current.actions.changeWorkspaceLevel("SHARE");
        });
        expect(svc.manageObjectPermissions).not.toHaveBeenCalled();
        expect(result.current.state.workspaceLevel).toBe("VIEW");
    });

    it("surfaces an error toast and does not refetch when a mutation fails", async () => {
        const svc = makeService();
        svc.manageObjectPermissions.mockRejectedValueOnce(new Error("nope"));
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "SHARE");
        });
        expect(addError).toHaveBeenCalledTimes(1);
        expect(addSuccess).not.toHaveBeenCalled();
        expect(svc.getAccessList).toHaveBeenCalledTimes(1); // no refetch on failure
    });

    it("says why when the backend refuses a write as an escalation", async () => {
        // Levels above the caller's own stay enabled on OTHER rows, so a refusal must
        // explain itself instead of reading like a transient failure.
        const svc = makeService();
        svc.manageObjectPermissions.mockRejectedValueOnce(escalationRefused());
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "EDIT");
        });

        expect(addError).toHaveBeenCalledWith(objectShareMessages.toastEscalationRefused);
        expect(result.current.state.grantees.find((g) => g.id === "user:u1")?.level).toBe("VIEW");
    });

    it("keeps the generic message for a failure that is not an escalation", async () => {
        const svc = makeService();
        svc.manageObjectPermissions.mockRejectedValueOnce(
            new UnexpectedResponseError("Boom", 400, {
                detail: "Something else entirely",
            }),
        );
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "SHARE");
        });

        expect(addError).toHaveBeenCalledWith(objectShareMessages.toastError);
    });

    it("exposes the passed labels in state", async () => {
        const { result } = renderController(makeLabelAwareService(), TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.labels).toEqual(LABELS);
    });

    it("stays label-unresolved when label metadata failed to load", async () => {
        // Labels couldn't be fetched (labelsError), so the per-label scope is
        // unknowable. Even once the access list loads, labelsResolved must stay
        // false — otherwise remove / general-access would reconcile against an empty
        // label set and silently orphan real per-label grants. Consumers gate every
        // access-changing control on this flag.
        const { result } = renderController(makeLabelAwareService(), TARGET, {
            labels: LABELS,
            labelsError: true,
        });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.labelsResolved).toBe(false);

        // Control case: same setup, no error → scope resolves and editing is allowed.
        const { result: ok } = renderController(makeLabelAwareService(), TARGET, { labels: LABELS });
        await waitFor(() => expect(ok.current.state.labelsResolved).toBe(true));
    });

    it("stays label-unresolved while labels are still loading", async () => {
        // While labels load, the consumer passes an empty list with labelsLoading
        // true — the labels just aren't known yet. That empty list must NOT be read
        // as a label-free object (which would resolve and enable row controls): a
        // remove would then reconcile against an empty label set and orphan the real
        // per-label grants. So labelsResolved stays false even once the access list
        // loads. Distinguished from a genuine fact (empty list, not loading).
        const { result: loading } = renderController(makeService(), TARGET, {
            labels: [],
            labelsLoading: true,
        });
        await waitFor(() => expect(loading.current.state.status).toBe("success"));
        expect(loading.current.state.labelsResolved).toBe(false);

        // Control case: a real label-free object (no labels, not loading) resolves.
        const { result: fact } = renderController(makeService(), TARGET, { labels: [] });
        await waitFor(() => expect(fact.current.state.status).toBe("success"));
        expect(fact.current.state.labelsResolved).toBe(true);
    });

    it("resolves once labels finish loading (loading → loaded)", async () => {
        // Labels arrive after an initial loading render: labelsLoading flips false
        // and the real list is passed. Resolution must then complete and unblock the
        // controls — the loading gate is transient, not sticky.
        const backend = makeBackend(makeLabelAwareService());
        const wrapper = ({ children }: PropsWithChildren) => (
            <IntlProvider locale="en-US" messages={{}}>
                <BackendProvider backend={backend}>
                    <WorkspaceProvider workspace={WORKSPACE}>{children}</WorkspaceProvider>
                </BackendProvider>
            </IntlProvider>
        );
        const { result, rerender } = renderHook(
            ({ labels, labelsLoading }: { labels: IObjectShareLabel[]; labelsLoading: boolean }) =>
                useObjectShareController(TARGET, { labels, labelsLoading }),
            { wrapper, initialProps: { labels: [] as IObjectShareLabel[], labelsLoading: true } },
        );
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.labelsResolved).toBe(false);

        rerender({ labels: LABELS, labelsLoading: false });
        await waitFor(() => expect(result.current.state.labelsResolved).toBe(true));
        expect(result.current.state.labels).toEqual(LABELS);
    });

    it("re-resolves the permissionable set when the label set changes under one target", async () => {
        // The label set can change while the target stays the same (e.g. labels
        // finish loading). The previous probe's permissionable set must not linger:
        // it would filter the NEW labels against stale ids and mark scope resolved
        // with an incomplete set, so add/share would skip expected per-label grants.
        // The newly-added label's probe is held in-flight to make the window
        // observable: while it's pending, scope must read UNresolved (not stale-true).
        let releaseEmail: (list: { grants: AccessGranteeDetail[] }) => void = () => {};
        const svc: IMockService = {
            getAccessList: vi.fn((t: IObjectPermissionsObject) => {
                const id = (t.ref as { identifier: string }).identifier;
                if (id === "lbl.email") {
                    return new Promise((resolve) => {
                        releaseEmail = resolve;
                    });
                }
                return Promise.resolve({ grants: [USER_GRANT] });
            }),
            manageObjectPermissions: vi.fn(async () => undefined),
            getAvailableAssignees: vi.fn(async () => ASSIGNEES),
        };
        const backend = makeBackend(svc);
        const wrapper = ({ children }: PropsWithChildren) => (
            <IntlProvider locale="en-US" messages={{}}>
                <BackendProvider backend={backend}>
                    <WorkspaceProvider workspace={WORKSPACE}>{children}</WorkspaceProvider>
                </BackendProvider>
            </IntlProvider>
        );
        const { result, rerender } = renderHook(
            ({ labels }: { labels: IObjectShareLabel[] }) => useObjectShareController(TARGET, { labels }),
            { wrapper, initialProps: { labels: [PRIMARY_LABEL, NAME_LABEL] } },
        );
        // First set resolves (both labels permissionable).
        await waitFor(() => expect(result.current.state.labelsResolved).toBe(true));
        expect(result.current.state.labels.map((l) => l.id).sort()).toEqual(["lbl.name", "lbl.primary"]);

        // Add a third label whose probe is still pending. The stale {primary,name}
        // permissionable set must be dropped, so scope reads unresolved and the new
        // labels aren't filtered against stale ids.
        await act(async () => {
            rerender({ labels: LABELS });
        });
        expect(result.current.state.labelsResolved).toBe(false);
        // ...but NOT initializing: the session's first resolution already happened,
        // so an open dialog re-disables controls without flashing back to skeletons.
        expect(result.current.state.labelsInitializing).toBe(false);

        // Once the new label's probe lands, scope re-resolves to all three.
        await act(async () => {
            releaseEmail({ grants: [USER_GRANT] });
        });
        await waitFor(() => expect(result.current.state.labelsResolved).toBe(true));
        expect(result.current.state.labels.map((l) => l.id).sort()).toEqual([
            "lbl.email",
            "lbl.name",
            "lbl.primary",
        ]);
    });

    it("re-resolves a grantee's scope when a label is added under the same target", async () => {
        // u1 is granted on every label that exists. Starting with {primary,name}, u1's
        // scope resolves to both. When a third label (email) is added under the same
        // target — and the backend grants u1 on it — u1's scope must widen to include
        // email. A stale per-grantee scope kept across the label-set change would
        // leave email out even though the grantee can reach it.
        const svc = makeLabelAwareService(); // grants u1 on every label by default
        const backend = makeBackend(svc);
        const wrapper = ({ children }: PropsWithChildren) => (
            <IntlProvider locale="en-US" messages={{}}>
                <BackendProvider backend={backend}>
                    <WorkspaceProvider workspace={WORKSPACE}>{children}</WorkspaceProvider>
                </BackendProvider>
            </IntlProvider>
        );
        const { result, rerender } = renderHook(
            ({ labels }: { labels: IObjectShareLabel[] }) => useObjectShareController(TARGET, { labels }),
            { wrapper, initialProps: { labels: [PRIMARY_LABEL, NAME_LABEL] } },
        );
        await waitFor(() =>
            expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]?.sort()).toEqual([
                "lbl.name",
                "lbl.primary",
            ]),
        );

        // Add the email label under the same target; u1's scope must include it.
        await act(async () => {
            rerender({ labels: LABELS });
        });
        await waitFor(() =>
            expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]?.sort()).toEqual([
                "lbl.email",
                "lbl.name",
                "lbl.primary",
            ]),
        );
    });

    it("holds labelsInitializing exactly through the session's first probe", async () => {
        let release: () => void = () => {};
        const held = new Promise<void>((res) => (release = () => res(undefined)));
        const svc: IMockService = {
            getAccessList: vi.fn(async (t: IObjectPermissionsObject) => {
                if ((t.ref as { identifier: string }).identifier.startsWith("lbl.")) {
                    await held;
                }
                return { grants: [USER_GRANT] };
            }),
            manageObjectPermissions: vi.fn(async () => undefined),
            getAvailableAssignees: vi.fn(async () => ASSIGNEES),
        };
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        // List loaded but the first probe is still out — the dialog must keep its
        // skeletons rather than reveal disabled controls.
        expect(result.current.state.labelsInitializing).toBe(true);
        expect(result.current.state.labelsResolved).toBe(false);

        await act(async () => {
            release();
        });
        await waitFor(() => expect(result.current.state.labelsInitializing).toBe(false));
        expect(result.current.state.labelsResolved).toBe(true);
    });

    it("resolves permissionable labels even when the object has no grantees", async () => {
        // Object access list is empty (no named grantees) and lbl.email 404s (not
        // permissionable). Resolution must still run and drop lbl.email from the
        // usable set — otherwise a first add would write to a non-permissionable label.
        const svc: IMockService = {
            getAccessList: vi.fn(async (t: IObjectPermissionsObject) => {
                const id = (t.ref as { identifier: string }).identifier;
                if (id === "lbl.email") {
                    throw notFound(); // not independently permissionable
                }
                return { grants: [] }; // object + other labels: no grantees
            }),
            manageObjectPermissions: vi.fn(async () => undefined),
            getAvailableAssignees: vi.fn(async () => ASSIGNEES),
        };
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        // Even with zero grantees, the permissionable set resolves and filters 404s.
        await waitFor(() =>
            expect(result.current.state.labels.map((l) => l.id).sort()).toEqual(["lbl.name", "lbl.primary"]),
        );
    });

    it("resolves each grantee's label scope from per-label access lists", async () => {
        // u1 is granted on primary + name, but NOT email.
        const svc = makeLabelAwareService(["lbl.primary", "lbl.name"]);
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());

        expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]!.sort()).toEqual([
            "lbl.name",
            "lbl.primary",
        ]);
        // A per-label access list was fetched for each of the 3 labels.
        const labelFetches = svc.getAccessList.mock.calls.filter(
            ([t]) => (t as IObjectPermissionsObject).kind === "label",
        );
        const labelIds = labelFetches.map(
            ([t]) => ((t as IObjectPermissionsObject).ref as { identifier: string }).identifier,
        );
        expect(new Set(labelIds)).toEqual(new Set(["lbl.primary", "lbl.name", "lbl.email", "label.country"]));
    });

    it("excludes a label whose grant lists the grantee with empty permissions", async () => {
        // lbl.email's access list contains u1 but with NO permissions (revoked /
        // stale entry). That must NOT count as scoped — the checkbox would otherwise
        // claim access the grantee doesn't have. Only primary + name are in scope.
        const EMPTY_GRANT = { ...USER_GRANT, permissions: [] } as AccessGranteeDetail;
        const svc: IMockService = {
            getAccessList: vi.fn(async (t: IObjectPermissionsObject) => {
                const id = (t.ref as { identifier: string }).identifier;
                if (id === "lbl.email") {
                    return { grants: [EMPTY_GRANT] }; // listed but no permissions
                }
                // object + primary + name grant u1 normally
                const granted = ["label.country", "lbl.primary", "lbl.name"].includes(id);
                return { grants: granted ? [USER_GRANT] : [] };
            }),
            manageObjectPermissions: vi.fn(async () => undefined),
            getAvailableAssignees: vi.fn(async () => ASSIGNEES),
        };
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());

        expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]!.sort()).toEqual([
            "lbl.name",
            "lbl.primary",
        ]);
    });

    it("does not lower the object when a label downgrade fails, and puts the labels back", async () => {
        // Lowering writes labels first precisely so a label can never sit above the
        // object. A partial label failure must therefore abort the whole change, not
        // proceed and warn — otherwise the failed label keeps EDIT while the object
        // drops to VIEW.
        const svc = makeLabelAwareService();
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        // The level change is refused until the per-label probe settles, so wait for
        // the scope — not just the access list — or the whole test races the probe.
        await waitFor(() => expect(result.current.state.labelsResolved).toBe(true));
        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "EDIT");
        });
        svc.manageObjectPermissions.mockClear();
        addError.mockClear();

        // Now lower EDIT → VIEW with one label write failing.
        svc.manageObjectPermissions.mockImplementation(async (t: IObjectPermissionsObject) => {
            if ((t.ref as { identifier: string }).identifier === "lbl.email") {
                throw new Error("label write failed");
            }
            return undefined;
        });
        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "VIEW");
        });

        const targets = (
            svc.manageObjectPermissions.mock.calls as Array<[IObjectPermissionsObject, unknown]>
        ).map(([t]) => (t.ref as { identifier: string }).identifier);
        // The object was never written, so label access cannot exceed it.
        expect(targets).not.toContain("label.country");
        // The labels that did land were restored to the previous level.
        const restored = (
            svc.manageObjectPermissions.mock.calls as Array<
                [IObjectPermissionsObject, IGranularAccessGrantee[]]
            >
        ).filter(([t]) => (t.ref as { identifier: string }).identifier === "lbl.name");
        expect(restored.at(-1)![1][0]!.permissions).toEqual(["EDIT", "VIEW"]);
        expect(addError).toHaveBeenCalled();
        // The row keeps the level it actually holds.
        expect(result.current.state.grantees.find((g) => g.id === "user:u1")!.level).toBe("EDIT");
    });

    it("re-grants labels at the grantee's own level when the object revoke fails", async () => {
        // The compensation must not default to VIEW: that would silently downgrade an
        // EDIT grantee we just failed to remove.
        const svc = makeLabelAwareService();
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        // Both the level change and the removal below are refused until the per-label
        // probe settles, so wait for the scope rather than just the access list.
        await waitFor(() => expect(result.current.state.labelsResolved).toBe(true));
        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "EDIT");
        });
        svc.manageObjectPermissions.mockClear();
        // Label revokes succeed; the object revoke fails.
        svc.manageObjectPermissions.mockImplementation(async (t: IObjectPermissionsObject) => {
            if ((t.ref as { identifier: string }).identifier === "label.country") {
                throw new Error("object revoke failed");
            }
            return undefined;
        });
        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });

        const nameWrites = (
            svc.manageObjectPermissions.mock.calls as Array<
                [IObjectPermissionsObject, IGranularAccessGrantee[]]
            >
        ).filter(([t]) => (t.ref as { identifier: string }).identifier === "lbl.name");
        // Revoked, then re-granted at EDIT — not at the VIEW default.
        expect(nameWrites[0]![1][0]!.permissions).toEqual([]);
        expect(nameWrites.at(-1)![1][0]!.permissions).toEqual(["EDIT", "VIEW"]);
        expect(result.current.state.grantees.find((g) => g.id === "user:u1")).toBeDefined();
    });

    it("counts a label the grantee only inherits as in scope, and reports it as inherited", async () => {
        // Verified against staging: a label's access list reports a parent-workspace
        // grantee with source "indirect", i.e. permissions [] + inheritedPermissions
        // ["EDIT","VIEW"]. Reading only the direct array showed every non-primary label
        // unchecked in a child workspace while the parent showed them checked.
        const svc = makeInheritedLabelService();
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());

        // In scope: primary + the directly granted name + the inherited email.
        expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]!.sort()).toEqual([
            "lbl.email",
            "lbl.name",
            "lbl.primary",
        ]);
        // Only the inherited one is flagged, so the row can lock just that checkbox.
        expect(result.current.state.inheritedLabelIdsByGrantee["user:u1"]).toEqual(["lbl.email"]);
    });

    it("keeps a surviving inherited-only row scoped to what the removal could not revoke", async () => {
        // The row survives a removal when access is also inherited. Dropping its scope
        // would fall back to "all labels" (the probe does not re-run for grantee changes),
        // and a later level change would then grant labels the grantee never held.
        // The OBJECT is both granted here and inherited (so the row survives the
        // removal); lbl.name is granted here only, lbl.email is inherited only.
        const OBJECT_DUAL = {
            ...USER_GRANT,
            permissions: ["VIEW"],
            inheritedPermissions: ["SHARE", "VIEW"],
        } as unknown as AccessGranteeDetail;
        const LABEL_INHERITED = {
            ...USER_GRANT,
            permissions: [],
            inheritedPermissions: ["SHARE", "VIEW"],
        } as unknown as AccessGranteeDetail;
        const svc: IMockService = {
            getAccessList: vi.fn(async (t: IObjectPermissionsObject) => {
                const id = (t.ref as { identifier: string }).identifier;
                if (id === "label.country") return { grants: [OBJECT_DUAL] };
                if (id === "lbl.email") return { grants: [LABEL_INHERITED] };
                return { grants: ["lbl.primary", "lbl.name"].includes(id) ? [USER_GRANT] : [] };
            }),
            manageObjectPermissions: vi.fn(async () => undefined),
            getAvailableAssignees: vi.fn(async () => ASSIGNEES),
        };
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());

        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });

        // Still listed — the inherited grant remains.
        expect(result.current.state.grantees.find((g) => g.id === "user:u1")).toBeDefined();
        // Scope narrowed to primary + the inherited label; the directly-granted lbl.name is gone.
        expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]!.sort()).toEqual([
            "lbl.email",
            "lbl.primary",
        ]);
    });

    it("keeps a removal survivor inherited-only while its labels are being written", async () => {
        // Sequence: remove a grantee who also inherits (row survives as inherited-only),
        // then edit that row's labels. The lock must not re-arm the settled removal — that
        // read as a revoke in flight and rendered the row as removing at its pre-removal
        // direct level, resurrecting access it had just lost.
        const OBJECT_DUAL = {
            ...USER_GRANT,
            permissions: ["EDIT", "VIEW"],
            inheritedPermissions: ["SHARE", "VIEW"],
        } as unknown as AccessGranteeDetail;
        const svc: IMockService = {
            getAccessList: vi.fn(async (t: IObjectPermissionsObject) => {
                const id = (t.ref as { identifier: string }).identifier;
                if (id === "label.country") return { grants: [OBJECT_DUAL] };
                return { grants: ["lbl.primary"].includes(id) ? [USER_GRANT] : [] };
            }),
            manageObjectPermissions: vi.fn(async () => undefined),
            getAvailableAssignees: vi.fn(async () => ASSIGNEES),
        };
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());

        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });
        const survivor = result.current.state.grantees.find((g) => g.id === "user:u1")!;
        expect(survivor.directLevel).toBeUndefined(); // inherited-only
        expect(survivor.level).toBe("SHARE");

        // Hold the label write open so the locked row can be inspected mid-flight.
        let release: () => void = () => {};
        svc.manageObjectPermissions.mockImplementation(
            () => new Promise<void>((resolve) => (release = () => resolve())),
        );
        let pendingEdit: Promise<void> = Promise.resolve();
        await act(async () => {
            pendingEdit = result.current.actions.changeGranteeLabels("user:u1", ["lbl.primary", "lbl.name"]);
        });

        const locked = result.current.state.grantees.find((g) => g.id === "user:u1")!;
        expect(locked.pending).toBe("saving"); // not "removing"
        expect(locked.directLevel).toBeUndefined(); // still inherited-only
        expect(locked.level).toBe("SHARE");

        await act(async () => {
            release();
            await pendingEdit;
        });

        // Settling the lock unwraps to the committed removal — the row stays a survivor.
        const settled = result.current.state.grantees.find((g) => g.id === "user:u1")!;
        expect(settled.pending).toBeUndefined();
        expect(settled.directLevel).toBeUndefined();
        expect(settled.level).toBe("SHARE");
    });

    it("does not turn the effective level into a direct grant when editing labels", async () => {
        // The row lock must not reuse the level overlay: `level` is the EFFECTIVE level, so
        // settling it would record an inherited EDIT as this workspace's own grant — the
        // badge would vanish and later writes would use the wrong level.
        const OBJECT_INHERITED_HIGHER = {
            ...USER_GRANT,
            permissions: ["VIEW"],
            inheritedPermissions: ["EDIT", "VIEW"],
        } as unknown as AccessGranteeDetail;
        const svc: IMockService = {
            getAccessList: vi.fn(async (t: IObjectPermissionsObject) => {
                const id = (t.ref as { identifier: string }).identifier;
                if (id === "label.country") return { grants: [OBJECT_INHERITED_HIGHER] };
                return { grants: ["lbl.primary"].includes(id) ? [USER_GRANT] : [] };
            }),
            manageObjectPermissions: vi.fn(async () => undefined),
            getAvailableAssignees: vi.fn(async () => ASSIGNEES),
        };
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());
        const before = result.current.state.grantees.find((g) => g.id === "user:u1")!;
        expect(before.level).toBe("EDIT"); // effective
        expect(before.directLevel).toBe("VIEW"); // granted here

        await act(async () => {
            await result.current.actions.changeGranteeLabels("user:u1", ["lbl.primary", "lbl.name"]);
        });

        const after = result.current.state.grantees.find((g) => g.id === "user:u1")!;
        expect(after.directLevel).toBe("VIEW"); // unchanged by a label edit
        expect(after.level).toBe("EDIT");
        expect(after.effectivePermission).toBe("EDIT"); // badge survives
        expect(after.pending).toBeUndefined();
    });

    it("refuses a level pick that cannot move the effective level", async () => {
        // Direct VIEW under inherited EDIT: picking SHARE reads as lowering but would
        // silently strengthen the local grant, with the row still showing EDIT.
        const OBJECT_INHERITED_HIGHER = {
            ...USER_GRANT,
            permissions: ["VIEW"],
            inheritedPermissions: ["EDIT", "VIEW"],
        } as unknown as AccessGranteeDetail;
        const svc = makeService([OBJECT_INHERITED_HIGHER]);
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        svc.manageObjectPermissions.mockClear();

        // With EDIT inherited, NO pick can change what the grantee effectively has, so
        // every one is refused rather than quietly rewriting the local grant.
        for (const level of ["SHARE", "EDIT", "VIEW"] as const) {
            await act(async () => {
                await result.current.actions.changePermissionLevel("user:u1", level);
            });
        }
        expect(svc.manageObjectPermissions).not.toHaveBeenCalled();
        expect(result.current.state.grantees[0]!.directLevel).toBe("VIEW");
    });

    it("still allows a reduction that does move the effective level", async () => {
        // Direct EDIT under inherited SHARE: picking VIEW drops the effective level from
        // EDIT to SHARE, so it must go through — this is why levels below an inherited one
        // are not simply disabled.
        const DIRECT_ABOVE_INHERITED = {
            ...USER_GRANT,
            permissions: ["EDIT", "VIEW"],
            inheritedPermissions: ["SHARE", "VIEW"],
        } as unknown as AccessGranteeDetail;
        const svc = makeService([DIRECT_ABOVE_INHERITED]);
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        svc.manageObjectPermissions.mockClear();

        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "VIEW");
        });

        expect(svc.manageObjectPermissions).toHaveBeenCalled();
        const row = result.current.state.grantees[0]!;
        expect(row.directLevel).toBe("VIEW");
        expect(row.level).toBe("SHARE"); // recomposed against the inherited grant
    });

    it("keeps a revoked-but-still-listed grantee removable, without claiming inheritance", async () => {
        // Neither permissions nor inheritedPermissions: the historical VIEW placeholder is
        // a DIRECT level, or the row would read as inherited-only and refuse removal.
        const EMPTY_GRANT = {
            ...USER_GRANT,
            permissions: [],
            inheritedPermissions: [],
        } as unknown as AccessGranteeDetail;
        const svc = makeService([EMPTY_GRANT]);
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        const row = result.current.state.grantees[0]!;
        expect(row.level).toBe("VIEW");
        expect(row.directLevel).toBe("VIEW");
        expect(row.inheritedLevel).toBeUndefined();
        expect(row.effectivePermission).toBeUndefined(); // no badge — nothing is inherited

        // And the removal is not refused by the controller.
        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });
        expect(svc.manageObjectPermissions).toHaveBeenCalled();
        expect(result.current.state.grantees).toHaveLength(0);
    });

    it("still revokes the local grant on a dual-granted label when removing the grantee", async () => {
        // Locking the checkbox and skipping the write are different things. A label that is
        // both granted here and inherited must still have ITS OWN grant revoked, or the
        // stale local permission becomes effective the moment the inherited one goes away.
        const svc = makeDualGrantLabelService();
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());
        svc.manageObjectPermissions.mockClear();

        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });

        const revoked = (
            svc.manageObjectPermissions.mock.calls as Array<
                [IObjectPermissionsObject, IGranularAccessGrantee[]]
            >
        ).filter(([, g]) => g[0]!.permissions.length === 0);
        const revokedIds = revoked.map(([t]) => (t.ref as { identifier: string }).identifier);
        expect(revokedIds).toContain("lbl.name"); // dual-granted — the local grant still goes
        expect(revokedIds).toContain("label.country"); // the object
    });

    it("re-grades a dual-granted label when the grantee's level changes", async () => {
        const svc = makeDualGrantLabelService();
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());
        svc.manageObjectPermissions.mockClear();

        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "EDIT");
        });

        const targets = (
            svc.manageObjectPermissions.mock.calls as Array<[IObjectPermissionsObject, unknown]>
        ).map(([t]) => (t.ref as { identifier: string }).identifier);
        // Its local grant is ours to keep in step with the object.
        expect(targets).toContain("lbl.name");
    });

    it("keeps a label whose revoke failed in a surviving row's scope", async () => {
        // The row survives (access is also inherited) and the backend still grants the
        // label whose revoke failed — so the scope must keep it, or the checklist would
        // show it unchecked and a later deselection would diff against a lie.
        const OBJECT_DUAL = {
            ...USER_GRANT,
            permissions: ["VIEW"],
            inheritedPermissions: ["SHARE", "VIEW"],
        } as unknown as AccessGranteeDetail;
        const svc: IMockService = {
            getAccessList: vi.fn(async (t: IObjectPermissionsObject) => {
                const id = (t.ref as { identifier: string }).identifier;
                if (id === "label.country") return { grants: [OBJECT_DUAL] };
                return { grants: ["lbl.primary", "lbl.name"].includes(id) ? [USER_GRANT] : [] };
            }),
            // Only the lbl.name revoke fails; the object revoke lands.
            manageObjectPermissions: vi.fn(async (t: IObjectPermissionsObject) => {
                if ((t.ref as { identifier: string }).identifier === "lbl.name") {
                    throw new Error("label revoke failed");
                }
                return undefined;
            }),
            getAvailableAssignees: vi.fn(async () => ASSIGNEES),
        };
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());

        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });

        expect(result.current.state.grantees.find((g) => g.id === "user:u1")).toBeDefined();
        expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]!.sort()).toEqual([
            "lbl.name", // revoke failed — still granted, so still in scope
            "lbl.primary",
        ]);
        expect(addWarning).toHaveBeenCalled();
    });

    it("keeps a dual-granted label in scope after its local grant is revoked", async () => {
        // A label can be granted here AND inherited. Reporting only "direct" made the
        // checklist show it unchecked once the local grant went, claiming the grantee lost
        // access they still have.
        const svc = makeDualGrantLabelService();
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());

        // lbl.name carries both a local and an inherited grant, so it counts as inherited:
        // in scope, and locked because revoking the local grant changes nothing.
        expect(result.current.state.inheritedLabelIdsByGrantee["user:u1"]).toContain("lbl.name");
        expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toContain("lbl.name");
    });

    it("keeps an inherited label out of every write when removing the grantee", async () => {
        // Revoking a label the grantee only inherits is a no-op the failure
        // compensation would then "restore" as a real local grant.
        const svc = makeInheritedLabelService();
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());
        svc.manageObjectPermissions.mockClear();

        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });

        const targets = (
            svc.manageObjectPermissions.mock.calls as Array<[IObjectPermissionsObject, unknown]>
        ).map(([t]) => (t.ref as { identifier: string }).identifier);
        expect(targets).toContain("label.country"); // the object revoke
        expect(targets).toContain("lbl.name"); // the direct label grant is revoked
        expect(targets).not.toContain("lbl.email"); // inherited — nothing here to revoke
    });

    it("keeps an inherited label out of a permission-level re-grade", async () => {
        const svc = makeInheritedLabelService();
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());
        svc.manageObjectPermissions.mockClear();

        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "EDIT");
        });

        const targets = (
            svc.manageObjectPermissions.mock.calls as Array<[IObjectPermissionsObject, unknown]>
        ).map(([t]) => (t.ref as { identifier: string }).identifier);
        expect(targets).toContain("label.country");
        expect(targets).toContain("lbl.name");
        // Re-grading an inherited label would invent a local grant that never existed.
        expect(targets).not.toContain("lbl.email");
    });

    it("changeGranteeLabels grants/revokes only the changed labels (primary always kept)", async () => {
        // Currently scoped to primary + name; request primary + email.
        const svc = makeLabelAwareService(["lbl.primary", "lbl.name"]);
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());
        svc.manageObjectPermissions.mockClear();

        await act(async () => {
            // Drop name, add email — and try to drop primary (must be ignored).
            await result.current.actions.changeGranteeLabels("user:u1", ["lbl.email"]);
        });

        // Two label mutations: revoke name, grant email. Primary untouched.
        const calls = svc.manageObjectPermissions.mock.calls as Array<
            [IObjectPermissionsObject, IGranularAccessGrantee[]]
        >;
        const byLabel = new Map(
            calls.map(([t, g]) => [(t.ref as { identifier: string }).identifier, g[0]!.permissions]),
        );
        expect(byLabel.get("lbl.email")).toEqual(["VIEW"]); // granted
        expect(byLabel.get("lbl.name")).toEqual([]); // revoked
        expect(byLabel.has("lbl.primary")).toBe(false); // never touched
        // Optimistic scope reflects the request + forced primary.
        expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]!.sort()).toEqual([
            "lbl.email",
            "lbl.primary",
        ]);
        expect(addSuccess).toHaveBeenCalled();
    });

    it("re-adding a removed grantee renders one row, not a duplicate of the base row", async () => {
        // After a settled removal the base row is hidden by its overlay entry and
        // the picker offers the grantee again. The re-add must supersede the
        // removal — not coexist with the hidden base row as a second row.
        const svc = makeService();
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });
        expect(result.current.state.grantees).toHaveLength(0);

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                { id: "user:u1", ref: idRef("u1"), kind: "user", name: "Jane Good", permissionLevel: "EDIT" },
            ]),
        );
        await act(async () => {
            await result.current.actions.confirmAddGrantees();
        });

        const rows = result.current.state.grantees.filter((g) => g.id === "user:u1");
        expect(rows).toHaveLength(1);
        expect(rows[0]!.level).toBe("EDIT");
    });

    it("keeps a removed grantee hidden when their re-add fails", async () => {
        const svc = makeService();
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });

        svc.manageObjectPermissions.mockRejectedValueOnce(new Error("nope"));
        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                { id: "user:u1", ref: idRef("u1"), kind: "user", name: "Jane Good", permissionLevel: "EDIT" },
            ]),
        );
        await act(async () => {
            await result.current.actions.confirmAddGrantees();
        });

        // The re-add failed — the committed removal must stand, not the fetched
        // pre-removal row.
        expect(result.current.state.grantees).toHaveLength(0);
    });

    it("keeps a removed re-added grantee removed after removing them again", async () => {
        // remove → re-add → remove, all settled: the id lives in base, so the final
        // removal must keep hiding the base row rather than dropping the overlay.
        const svc = makeService();
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });
        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                { id: "user:u1", ref: idRef("u1"), kind: "user", name: "Jane Good", permissionLevel: "VIEW" },
            ]),
        );
        await act(async () => {
            await result.current.actions.confirmAddGrantees();
        });
        expect(result.current.state.grantees).toHaveLength(1);

        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });
        expect(result.current.state.grantees).toHaveLength(0);
    });

    it("keeps a grantee out of the picker while their removal is in flight", async () => {
        // Offering an in-flight-removal id would let a re-add overlap the pending
        // revoke on one id — and the settle/fail finalizers act on the id's CURRENT
        // overlay entry, not the write that started them. The id becomes offerable
        // exactly when the revoke settles.
        const svc = makeService();
        svc.getAvailableAssignees = vi.fn(async () => [
            { type: "user", ref: idRef("u1"), name: "Jane Good", email: "jane@example.com" },
            ...ASSIGNEES,
        ]);
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        let release: () => void = () => {};
        const held = new Promise<void>((r) => (release = r));
        svc.manageObjectPermissions.mockImplementationOnce(() => held);
        let removePromise: Promise<void>;
        act(() => {
            removePromise = result.current.actions.removeGrantee("user:u1");
        });
        await waitFor(() => expect(result.current.state.grantees[0]?.pending).toBe("removing"));

        const during = await result.current.actions.loadOptions("");
        expect(during.users.map((u) => u.id)).not.toContain("user:u1");

        await act(async () => {
            release();
            await removePromise;
        });
        const after = await result.current.actions.loadOptions("");
        expect(after.users.map((u) => u.id)).toContain("user:u1");
    });

    it("renders one muted row while re-removing a re-added grantee", async () => {
        // remove → re-add (settled) → remove again with the revoke held open: the
        // base row and the superseded added entry describe the same id — exactly
        // one muted row may render, at the re-added level, not the base one.
        const svc = makeService();
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });
        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                { id: "user:u1", ref: idRef("u1"), kind: "user", name: "Jane Good", permissionLevel: "EDIT" },
            ]),
        );
        await act(async () => {
            await result.current.actions.confirmAddGrantees();
        });

        let release: () => void = () => {};
        const held = new Promise<void>((r) => (release = r));
        svc.manageObjectPermissions.mockImplementationOnce(() => held);
        let removePromise: Promise<void>;
        act(() => {
            removePromise = result.current.actions.removeGrantee("user:u1");
        });
        await waitFor(() =>
            expect(
                result.current.state.grantees.some((g) => g.id === "user:u1" && g.pending === "removing"),
            ).toBe(true),
        );
        const rows = result.current.state.grantees.filter((g) => g.id === "user:u1");
        expect(rows).toHaveLength(1);
        expect(rows[0]!.level).toBe("EDIT");

        await act(async () => {
            release();
            await removePromise;
        });
        expect(result.current.state.grantees).toHaveLength(0);
    });

    it("keeps a saved level on the muted row while its removal is in flight", async () => {
        const svc = makeService();
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "EDIT");
        });
        expect(result.current.state.grantees[0]!.level).toBe("EDIT");

        let release: () => void = () => {};
        const held = new Promise<void>((r) => (release = r));
        svc.manageObjectPermissions.mockImplementationOnce(() => held);
        let removePromise: Promise<void>;
        act(() => {
            removePromise = result.current.actions.removeGrantee("user:u1");
        });
        await waitFor(() =>
            expect(result.current.state.grantees.find((g) => g.id === "user:u1")?.pending).toBe("removing"),
        );
        // The muted row shows the LAST COMMITTED level (the settled edit), not the
        // stale fetched one.
        expect(result.current.state.grantees.find((g) => g.id === "user:u1")?.level).toBe("EDIT");
        await act(async () => {
            release();
            await removePromise;
        });
    });

    it("locks the row while a label edit is in flight", async () => {
        // A label edit issues independent per-label writes; a second edit or a
        // removal started meanwhile would race them on the same labels. The row is
        // pending for the duration, and mutations on a pending row are refused.
        const svc = makeLabelAwareService(["lbl.primary", "lbl.name"]);
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());
        let releaseLabels: () => void = () => {};
        const heldLabels = new Promise<void>((res) => (releaseLabels = () => res(undefined)));
        svc.manageObjectPermissions.mockClear();
        svc.manageObjectPermissions.mockImplementation(async () => {
            await heldLabels;
            return undefined;
        });

        let editPromise: Promise<void>;
        act(() => {
            editPromise = result.current.actions.changeGranteeLabels("user:u1", ["lbl.email"]);
        });
        expect(result.current.state.grantees.find((g) => g.id === "user:u1")?.pending).toBe("saving");
        const writesInFlight = svc.manageObjectPermissions.mock.calls.length;

        await act(async () => {
            await result.current.actions.changeGranteeLabels("user:u1", ["lbl.name"]);
            await result.current.actions.removeGrantee("user:u1");
            await result.current.actions.changePermissionLevel("user:u1", "EDIT");
        });
        expect(svc.manageObjectPermissions.mock.calls.length).toBe(writesInFlight);

        await act(async () => {
            releaseLabels();
            await editPromise;
        });
        const row = result.current.state.grantees.find((g) => g.id === "user:u1");
        expect(row?.pending).toBeUndefined();
        // The lock rode on the level overlay at the unchanged level — nothing moved.
        expect(row?.level).toBe("VIEW");
        expect(addSuccess).toHaveBeenCalled();
    });

    it("keeps the landed label writes when a label edit partially fails", async () => {
        // Scope primary + name; the edit requests primary + email (revoke name,
        // grant email). The email grant fails, the name revoke lands: local scope
        // must track exactly what the backend now holds — primary only — not
        // restore the whole previous scope past the revoke that succeeded.
        const svc = makeLabelAwareService(["lbl.primary", "lbl.name"]);
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());
        svc.manageObjectPermissions.mockImplementation(async (t: IObjectPermissionsObject) => {
            if ((t.ref as { identifier: string }).identifier === "lbl.email") {
                throw new Error("label write failed");
            }
            return undefined;
        });

        await act(async () => {
            await result.current.actions.changeGranteeLabels("user:u1", ["lbl.email"]);
        });

        expect(addWarning).toHaveBeenCalledTimes(1);
        expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toEqual(["lbl.primary"]);
        expect(result.current.state.grantees.find((g) => g.id === "user:u1")?.pending).toBeUndefined();
    });

    it("does not re-probe label access lists when a grantee is added or removed", async () => {
        // The probe seeds only ids it doesn't already know, and adds/removes write
        // their scope optimistically — a per-grantee-change re-probe would issue one
        // request per label just to discard the results, while flipping
        // labelsResolved false and disabling every control for the round trip.
        const svc = makeLabelAwareService();
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.labelsResolved).toBe(true));
        const labelProbes = () =>
            svc.getAccessList.mock.calls.filter(([t]) => (t as IObjectPermissionsObject).kind === "label")
                .length;
        const before = labelProbes();

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                { id: "user:u2", ref: idRef("u2"), kind: "user", name: "Marek", permissionLevel: "VIEW" },
            ]),
        );
        await act(async () => {
            await result.current.actions.confirmAddGrantees();
        });
        await act(async () => {
            await result.current.actions.removeGrantee("user:u2");
        });

        expect(labelProbes()).toBe(before);
        expect(result.current.state.labelsResolved).toBe(true);
    });

    it("does nothing when the applied label scope equals the current one", async () => {
        // Applying the checklist unchanged produces zero writes — it must not toast
        // success or lock the row for a no-op.
        const svc = makeLabelAwareService(["lbl.primary", "lbl.name"]);
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());
        svc.manageObjectPermissions.mockClear();

        await act(async () => {
            await result.current.actions.changeGranteeLabels("user:u1", ["lbl.name"]);
        });

        expect(svc.manageObjectPermissions).not.toHaveBeenCalled();
        expect(addSuccess).not.toHaveBeenCalled();
        expect(result.current.state.grantees.find((g) => g.id === "user:u1")?.pending).toBeUndefined();
    });

    it("restores the previous scope with an error when no label write lands", async () => {
        const svc = makeLabelAwareService(["lbl.primary", "lbl.name"]);
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());
        svc.manageObjectPermissions.mockRejectedValue(new Error("nope"));

        await act(async () => {
            await result.current.actions.changeGranteeLabels("user:u1", ["lbl.email"]);
        });

        expect(addError).toHaveBeenCalledTimes(1);
        expect(addWarning).not.toHaveBeenCalled();
        expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]!.sort()).toEqual([
            "lbl.name",
            "lbl.primary",
        ]);
    });

    it("re-grants only the grantee's actual scope when the object revoke fails", async () => {
        // u1 holds primary + name, NOT email. Removal revokes over the KNOWN scope,
        // so when the object revoke fails, the compensation restores exactly that
        // scope — never granting email, which u1 never had.
        const svc = makeLabelAwareService(["lbl.primary", "lbl.name"]);
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());
        svc.manageObjectPermissions.mockClear();
        svc.manageObjectPermissions.mockImplementation(async (t: IObjectPermissionsObject) => {
            if ((t.ref as { identifier: string }).identifier === "label.country") {
                throw new Error("object revoke failed");
            }
            return undefined;
        });

        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });

        const idOf = (t: IObjectPermissionsObject) => (t.ref as { identifier: string }).identifier;
        const calls = svc.manageObjectPermissions.mock.calls as Array<
            [IObjectPermissionsObject, IGranularAccessGrantee[]]
        >;
        // email was never in u1's scope — no write may touch it, in either direction.
        expect(calls.some(([t]) => idOf(t) === "lbl.email")).toBe(false);
        // name: revoked with the removal, re-granted by the compensation.
        const nameWrites = calls.filter(([t]) => idOf(t) === "lbl.name").map(([, g]) => g[0]!.permissions);
        expect(nameWrites).toEqual([[], ["VIEW"]]);
        // The row is restored, unlocked, with its scope intact.
        expect(result.current.state.grantees.find((g) => g.id === "user:u1")?.pending).toBeUndefined();
        await waitFor(() =>
            expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]?.sort()).toEqual([
                "lbl.name",
                "lbl.primary",
            ]),
        );
    });

    it("grants every non-primary label when adding a grantee (all labels by default)", async () => {
        const svc = makeLabelAwareService();
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        svc.manageObjectPermissions.mockClear();

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                { id: "user:u2", ref: idRef("u2"), kind: "user", name: "New User", permissionLevel: "VIEW" },
            ]),
        );
        await act(async () => {
            await result.current.actions.confirmAddGrantees();
        });

        const calls = svc.manageObjectPermissions.mock.calls as Array<
            [IObjectPermissionsObject, IGranularAccessGrantee[]]
        >;
        const byTarget = new Map(
            calls.map(([t, g]) => [(t.ref as { identifier: string }).identifier, g[0]!]),
        );
        // Object-level grant written (the share TARGET).
        expect(byTarget.get("label.country")).toBeDefined();
        // Every non-primary label gets an explicit VIEW grant; primary is not written.
        expect(byTarget.get("lbl.name")?.permissions).toEqual(["VIEW"]);
        expect(byTarget.get("lbl.email")?.permissions).toEqual(["VIEW"]);
        expect(byTarget.has("lbl.primary")).toBe(false);
        // The new grantee's scope optimistically reflects all labels.
        expect(result.current.state.selectedLabelIdsByGrantee["user:u2"]!.sort()).toEqual([
            "lbl.email",
            "lbl.name",
            "lbl.primary",
        ]);
    });

    it("adds several grantees with one label write per label (not per grantee)", async () => {
        const svc = makeLabelAwareService();
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        svc.manageObjectPermissions.mockClear();

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                { id: "user:u2", ref: idRef("u2"), kind: "user", name: "Marek", permissionLevel: "VIEW" },
                {
                    id: "group:g1",
                    ref: idRef("g1"),
                    kind: "group",
                    name: "Marketing",
                    permissionLevel: "VIEW",
                },
            ]),
        );
        await act(async () => {
            await result.current.actions.confirmAddGrantees();
        });

        const calls = svc.manageObjectPermissions.mock.calls as Array<
            [IObjectPermissionsObject, IGranularAccessGrantee[]]
        >;
        const idOf = (t: IObjectPermissionsObject) => (t.ref as { identifier: string }).identifier;
        const objectCalls = calls.filter(([t]) => idOf(t) === "label.country");
        expect(objectCalls).toHaveLength(1);
        expect(objectCalls[0]![1]).toHaveLength(2);
        // Two labels, not two labels × two grantees.
        const labelCalls = calls.filter(([t]) => idOf(t).startsWith("lbl."));
        expect(labelCalls).toHaveLength(2);
        const byLabel = new Map(labelCalls.map(([t, g]) => [idOf(t), g]));
        expect(byLabel.has("lbl.primary")).toBe(false);
        for (const id of ["lbl.name", "lbl.email"]) {
            const grantees = byLabel.get(id)!;
            expect(grantees.map((g) => g.type).sort()).toEqual(["granularGroup", "granularUser"]);
            expect(grantees.every((g) => g.permissions.includes("VIEW"))).toBe(true);
        }
        expect(result.current.state.selectedLabelIdsByGrantee["user:u2"]!.sort()).toEqual([
            "lbl.email",
            "lbl.name",
            "lbl.primary",
        ]);
        expect(result.current.state.selectedLabelIdsByGrantee["group:g1"]!.sort()).toEqual([
            "lbl.email",
            "lbl.name",
            "lbl.primary",
        ]);
    });

    it("grants only the labels picked for the grantee in the add dialog", async () => {
        const svc = makeLabelAwareService();
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        svc.manageObjectPermissions.mockClear();

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                {
                    id: "user:u2",
                    ref: idRef("u2"),
                    kind: "user",
                    name: "New User",
                    permissionLevel: "VIEW",
                    // Scope narrowed in the add dialog — email left out.
                    labelIds: ["lbl.name"],
                },
            ]),
        );
        await act(async () => {
            await result.current.actions.confirmAddGrantees();
        });

        const calls = svc.manageObjectPermissions.mock.calls as Array<
            [IObjectPermissionsObject, IGranularAccessGrantee[]]
        >;
        const byTarget = new Map(
            calls.map(([t, g]) => [(t.ref as { identifier: string }).identifier, g[0]!]),
        );
        expect(byTarget.get("label.country")).toBeDefined();
        expect(byTarget.get("lbl.name")?.permissions).toEqual(["VIEW"]);
        // The label left out of the scope is never granted...
        expect(byTarget.has("lbl.email")).toBe(false);
        // ...and the primary label needs no write (always in scope).
        expect(byTarget.has("lbl.primary")).toBe(false);
        // The optimistic scope is the picked one plus the forced primary.
        expect(result.current.state.selectedLabelIdsByGrantee["user:u2"]!.sort()).toEqual([
            "lbl.name",
            "lbl.primary",
        ]);
    });

    it("adds grantees with different label scopes, still one write per label", async () => {
        const svc = makeLabelAwareService();
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        svc.manageObjectPermissions.mockClear();

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                {
                    id: "user:u2",
                    ref: idRef("u2"),
                    kind: "user",
                    name: "Marek",
                    permissionLevel: "VIEW",
                    labelIds: ["lbl.name", "lbl.email"],
                },
                {
                    id: "group:g1",
                    ref: idRef("g1"),
                    kind: "group",
                    name: "Marketing",
                    permissionLevel: "EDIT",
                    labelIds: ["lbl.name"],
                },
            ]),
        );
        await act(async () => {
            await result.current.actions.confirmAddGrantees();
        });

        const calls = svc.manageObjectPermissions.mock.calls as Array<
            [IObjectPermissionsObject, IGranularAccessGrantee[]]
        >;
        const idOf = (t: IObjectPermissionsObject) => (t.ref as { identifier: string }).identifier;
        const byLabel = new Map(
            calls.filter(([t]) => idOf(t).startsWith("lbl.")).map(([t, g]) => [idOf(t), g]),
        );
        expect([...byLabel.keys()].sort()).toEqual(["lbl.email", "lbl.name"]);
        // A label both scopes cover stays a single write carrying both principals,
        // each at its own level.
        const nameGrantees = byLabel.get("lbl.name")!;
        expect(nameGrantees).toHaveLength(2);
        expect(nameGrantees.find((g) => g.type === "granularUser")!.permissions).toEqual(["VIEW"]);
        expect(nameGrantees.find((g) => g.type === "granularGroup")!.permissions).toEqual(["EDIT", "VIEW"]);
        // A label only one scope covers carries only that principal.
        const emailGrantees = byLabel.get("lbl.email")!;
        expect(emailGrantees).toHaveLength(1);
        expect(emailGrantees[0]!.type).toBe("granularUser");

        expect(result.current.state.selectedLabelIdsByGrantee["user:u2"]!.sort()).toEqual([
            "lbl.email",
            "lbl.name",
            "lbl.primary",
        ]);
        expect(result.current.state.selectedLabelIdsByGrantee["group:g1"]!.sort()).toEqual([
            "lbl.name",
            "lbl.primary",
        ]);
    });

    it("drops only the failed label from every added grantee on a partial batch failure", async () => {
        const svc = makeLabelAwareService();
        // Only the lbl.email write fails; the object grant and lbl.name succeed.
        svc.manageObjectPermissions.mockImplementation(async (t: IObjectPermissionsObject) => {
            if ((t.ref as { identifier: string }).identifier === "lbl.email") {
                throw new Error("label write failed");
            }
            return undefined;
        });
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                { id: "user:u2", ref: idRef("u2"), kind: "user", name: "Marek", permissionLevel: "VIEW" },
                {
                    id: "group:g1",
                    ref: idRef("g1"),
                    kind: "group",
                    name: "Marketing",
                    permissionLevel: "VIEW",
                },
            ]),
        );
        await act(async () => {
            await result.current.actions.confirmAddGrantees();
        });

        // lbl.email dropped, lbl.name + primary kept.
        expect(addWarning).toHaveBeenCalledTimes(1);
        expect(result.current.state.selectedLabelIdsByGrantee["user:u2"]!.sort()).toEqual([
            "lbl.name",
            "lbl.primary",
        ]);
        expect(result.current.state.selectedLabelIdsByGrantee["group:g1"]!.sort()).toEqual([
            "lbl.name",
            "lbl.primary",
        ]);
    });

    it("warns and drops the optimistic scope if a label grant fails on add (#E)", async () => {
        const svc = makeLabelAwareService();
        // The object add succeeds; a per-label write then fails.
        svc.manageObjectPermissions.mockImplementation(async (t: IObjectPermissionsObject) => {
            if ((t.ref as { identifier: string }).identifier === "lbl.email") {
                throw new Error("label write failed");
            }
            return undefined;
        });
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                { id: "user:u2", ref: idRef("u2"), kind: "user", name: "New User", permissionLevel: "VIEW" },
            ]),
        );
        await act(async () => {
            await result.current.actions.confirmAddGrantees();
        });

        // Failure surfaces; only the failed lbl.email is dropped, lbl.name + primary stay.
        expect(addWarning).toHaveBeenCalledTimes(1);
        expect(result.current.state.selectedLabelIdsByGrantee["user:u2"]!.sort()).toEqual([
            "lbl.name",
            "lbl.primary",
        ]);
    });

    it("keeps the new grantee's full label scope after the add re-resolves", async () => {
        // Per-label lists never report u2 (the backend's read lags the add-time label
        // grants). Adding u2 changes the committed grantee set, which re-runs the
        // resolution probe — but u2 already has a local scope, so the probe seeds
        // only unknown grantees and the optimistic full scope survives.
        const svc = makeLabelAwareService(["lbl.primary", "lbl.name", "lbl.email"]); // only u1 granted
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                { id: "user:u2", ref: idRef("u2"), kind: "user", name: "New User", permissionLevel: "VIEW" },
            ]),
        );
        await act(async () => {
            await result.current.actions.confirmAddGrantees();
        });

        // u2 shows all labels even though the per-label lists (resolving u1 only)
        // would otherwise have reset it to primary-only.
        expect(result.current.state.selectedLabelIdsByGrantee["user:u2"]!.sort()).toEqual([
            "lbl.email",
            "lbl.name",
            "lbl.primary",
        ]);
    });

    it("revokes the grantee from every label when removing them", async () => {
        const svc = makeLabelAwareService();
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());
        svc.manageObjectPermissions.mockClear();

        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });

        const calls = svc.manageObjectPermissions.mock.calls as Array<
            [IObjectPermissionsObject, IGranularAccessGrantee[]]
        >;
        const byTarget = new Map(
            calls.map(([t, g]) => [(t.ref as { identifier: string }).identifier, g[0]!]),
        );
        // Object-level revoke (empty permissions).
        expect(byTarget.get("label.country")?.permissions).toEqual([]);
        // Non-primary labels are revoked too (no orphaned label access). The
        // primary label is never written independently — its access follows the
        // object grant — so it is not in the per-label revokes.
        expect(byTarget.get("lbl.name")?.permissions).toEqual([]);
        expect(byTarget.get("lbl.email")?.permissions).toEqual([]);
        expect(byTarget.has("lbl.primary")).toBe(false);
    });

    it("re-grants the revoked labels when the object revoke fails on remove", async () => {
        const svc = makeLabelAwareService();
        // Object revoke fails; per-label writes succeed. The grantee row is restored
        // AND the labels we revoked must be granted back (no orphaned revoke).
        svc.manageObjectPermissions.mockImplementation(async (t: IObjectPermissionsObject): Promise<void> => {
            if ((t.ref as { identifier: string }).identifier === "label.country") {
                throw new Error("object revoke failed");
            }
        });
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());
        svc.manageObjectPermissions.mockClear();

        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });

        const labelWrites = (
            svc.manageObjectPermissions.mock.calls as Array<
                [IObjectPermissionsObject, IGranularAccessGrantee[]]
            >
        ).filter(([t]) => (t.ref as { identifier: string }).identifier.startsWith("lbl."));
        // Each affected label is written twice: revoke (empty) then re-grant (VIEW).
        const nameWrites = labelWrites.filter(
            ([t]) => (t.ref as { identifier: string }).identifier === "lbl.name",
        );
        expect(nameWrites.map(([, g]) => g[0]!.permissions)).toEqual([[], ["VIEW"]]);
        // The grantee row is restored (the removal was rolled back).
        expect(result.current.state.grantees.some((g) => g.id === "user:u1")).toBe(true);
    });

    it("mirrors the all-workspace-members rule onto every label", async () => {
        const svc = makeLabelAwareService();
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        svc.manageObjectPermissions.mockClear();

        // Stage then confirm in separate acts so pendingGeneralAccess flushes first.
        act(() => result.current.actions.requestGeneralAccessChange("WORKSPACE"));
        await act(async () => {
            await result.current.actions.confirmGeneralAccessChange();
        });

        const calls = svc.manageObjectPermissions.mock.calls as Array<
            [IObjectPermissionsObject, IGranularAccessGrantee[]]
        >;
        // The allWorkspaceUsers VIEW rule is written on the object AND every
        // non-primary label. Primary is never written independently (its access
        // follows the object grant).
        for (const id of ["label.country", "lbl.name", "lbl.email"]) {
            const g = calls.find(([t]) => (t.ref as { identifier: string }).identifier === id)?.[1][0];
            expect(g?.type).toBe("allWorkspaceUsers");
            expect(g?.permissions).toEqual(["VIEW"]);
        }
        expect(calls.some(([t]) => (t.ref as { identifier: string }).identifier === "lbl.primary")).toBe(
            false,
        );
    });

    it("rolls back the label mirror when the object write fails on general access (#D)", async () => {
        const svc = makeLabelAwareService();
        // Label writes succeed; the object-level write (the share TARGET) fails.
        svc.manageObjectPermissions.mockImplementation(async (t: IObjectPermissionsObject) => {
            if ((t.ref as { identifier: string }).identifier === "label.country") {
                throw new Error("object write failed");
            }
            return undefined;
        });
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        svc.manageObjectPermissions.mockClear();

        act(() => result.current.actions.requestGeneralAccessChange("WORKSPACE"));
        await act(async () => {
            await result.current.actions.confirmGeneralAccessChange();
        });

        // Optimistic general access reverts to the prior value on object-write failure.
        expect(result.current.state.generalAccess).toBe("RESTRICTED");
        // The label mirror is undone: each non-primary label is written twice —
        // the VIEW grant, then the rollback revoke (so labels don't drift from the object).
        const perms = (id: string) =>
            svc.manageObjectPermissions.mock.calls
                .filter(([t]) => (t.ref as { identifier: string }).identifier === id)
                .map(([, g]) => (g as IGranularAccessGrantee[])[0]!.permissions);
        expect(perms("lbl.name")).toEqual([["VIEW"], []]);
        expect(perms("lbl.email")).toEqual([["VIEW"], []]);
    });

    it("excludes labels whose permissions endpoint is unavailable (404)", async () => {
        // name label's permission endpoint rejects (not independently permissionable).
        const svc: IMockService = {
            getAccessList: vi.fn(async (t: IObjectPermissionsObject) => {
                const id = (t.ref as { identifier: string }).identifier;
                if (id === "lbl.name") {
                    throw notFound();
                }
                return { grants: [USER_GRANT] };
            }),
            manageObjectPermissions: vi.fn(async () => undefined),
            getAvailableAssignees: vi.fn(async () => ASSIGNEES),
        };
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        // After resolution, the name label is dropped; only the permissionable ones remain.
        await waitFor(() => expect(result.current.state.labels.map((l) => l.id)).not.toContain("lbl.name"));
        expect(result.current.state.labels.map((l) => l.id).sort()).toEqual(["lbl.email", "lbl.primary"]);
    });

    it("keeps a label whose permissions endpoint fails transiently (5xx)", async () => {
        // A transient server error must NOT drop a real label (unlike a 404).
        const svc: IMockService = {
            getAccessList: vi.fn(async (t: IObjectPermissionsObject) => {
                const id = (t.ref as { identifier: string }).identifier;
                if (id === "lbl.name") {
                    throw new UnexpectedResponseError("Server Error", 500, {});
                }
                return { grants: [USER_GRANT] };
            }),
            manageObjectPermissions: vi.fn(async () => undefined),
            getAvailableAssignees: vi.fn(async () => ASSIGNEES),
        };
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        // lbl.name is kept (transient), so all three labels stay available.
        await waitFor(() =>
            expect(result.current.state.labels.map((l) => l.id).sort()).toEqual([
                "lbl.email",
                "lbl.name",
                "lbl.primary",
            ]),
        );
        // But its per-grantee grants are UNKNOWN — the scope must not read as
        // resolved, or edits would diff against an invented current for lbl.name.
        expect(result.current.state.labelsResolved).toBe(false);
    });

    it("keeps an added row pending until its label grants finish", async () => {
        // The add is one logical operation: object grant + all-label grants. The row
        // must stay locked through BOTH, or a remove/label edit started in between
        // would race the in-flight label grants and could leave grants behind.
        const svc = makeLabelAwareService();
        let releaseLabels: () => void = () => {};
        const heldLabels = new Promise<void>((res) => (releaseLabels = () => res(undefined)));
        svc.manageObjectPermissions.mockImplementation(async (t: IObjectPermissionsObject) => {
            const id = (t.ref as { identifier: string }).identifier;
            if (id.startsWith("lbl.")) {
                await heldLabels; // label grants held open; the object grant resolves at once
            }
            return undefined;
        });
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.labelsResolved).toBe(true));

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                {
                    id: "group:g1",
                    ref: idRef("g1"),
                    kind: "group",
                    name: "Marketing",
                    permissionLevel: "VIEW",
                },
            ]),
        );
        let addPromise: Promise<void>;
        act(() => {
            addPromise = result.current.actions.confirmAddGrantees();
        });

        // The object grant has landed (label writes fired after it) — the row is
        // visible but must still be marked saving while the label grants run.
        await waitFor(() => expect(svc.manageObjectPermissions.mock.calls.length).toBeGreaterThan(1));
        expect(result.current.state.grantees.find((g) => g.id === "group:g1")?.pending).toBe("saving");

        await act(async () => {
            releaseLabels();
            await addPromise;
        });
        expect(result.current.state.grantees.find((g) => g.id === "group:g1")?.pending).toBeUndefined();
    });

    it("has no labels and never fetches per-label lists when none are passed", async () => {
        const svc = makeLabelAwareService();
        const { result } = renderController(svc, TARGET); // no labels
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.labels).toEqual([]);
        // No fetch for any of the lbl.* label refs — the label-scope effect is skipped.
        const labelFetches = svc.getAccessList.mock.calls.filter(([t]) =>
            ((t as IObjectPermissionsObject).ref as { identifier: string }).identifier.startsWith("lbl."),
        );
        expect(labelFetches).toHaveLength(0);
    });

    // Self identity feeds the single-viewer empty state: rows are marked isSelf
    // by matching the resolved profile, and selfIdentity carries the profile
    // facts + login for the synthesized administrator row.
    describe("self identity (isSelf / selfIdentity)", () => {
        // A grant for the signed-in user (resolved to CURRENT_USER_REF) at the given level.
        const selfGrant = (permissions: AccessGranularPermission[]): AccessGranteeDetail => ({
            type: "granularUser",
            user: {
                ref: CURRENT_USER_REF,
                uri: "/self",
                login: "me",
                email: "me@example.com",
                fullName: "Me",
            },
            permissions,
            inheritedPermissions: [],
        });

        it("marks the signed-in user's own grant row with isSelf", async () => {
            const { result } = renderController(makeService([selfGrant(["EDIT", "VIEW"])]), TARGET);
            await waitFor(() => expect(getUserMock).toHaveResolved());
            await waitFor(() =>
                expect(result.current.state.grantees.find((g) => g.id === "user:self")?.isSelf).toBe(true),
            );
        });

        it("identifies the current user in a multi-grantee list", async () => {
            // The profile resolves once per dialog session, so self identification
            // works regardless of how many grantees the list holds.
            const { result } = renderController(
                makeService([USER_GRANT, selfGrant(["SHARE", "VIEW"])]),
                TARGET,
            );
            await waitFor(() =>
                expect(result.current.state.grantees.find((g) => g.id === "user:self")?.isSelf).toBe(true),
            );
            expect(result.current.state.grantees.find((g) => g.id === "user:u1")?.isSelf).toBe(false);
        });

        it("does not mark other grantees' rows with isSelf", async () => {
            const { result } = renderController(makeService([USER_GRANT]), TARGET);
            await waitFor(() => expect(result.current.state.status).toBe("success"));
            await waitFor(() => expect(getUserMock).toHaveResolved());
            await act(async () => {});
            expect(result.current.state.grantees.length).toBeGreaterThan(0);
            expect(result.current.state.grantees.every((g) => !g.isSelf)).toBe(true);
        });
    });
});

describe("useObjectShareController row classification", () => {
    const SELF_GRANT: AccessGranteeDetail = {
        type: "granularUser",
        user: { ref: idRef("self"), uri: "/self", login: "self", email: "self", fullName: "self" },
        permissions: ["SHARE", "VIEW"],
        inheritedPermissions: [],
    } as AccessGranteeDetail;

    it("classifies a sole self grant as the self-managed row with its disabled levels", async () => {
        const { result } = renderController(makeService([SELF_GRANT]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selfManagedGranteeId).toBe("user:self"));
        expect(result.current.state.granteeControlsLocked).toBe(false);
        // Policy travels with the classification: SHARE self grant → EDIT disabled.
        expect(result.current.state.selfManagedDisabledLevels).toEqual(["EDIT"]);
    });

    it("classifies the caller's own row as self-managed alongside other grantees", async () => {
        // With another grantee present the caller could previously raise themselves
        // and drop their own access with no confirm.
        const { result } = renderController(makeService([SELF_GRANT, USER_GRANT]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selfManagedGranteeId).toBe("user:self"));
        expect(result.current.state.selfManagedDisabledLevels).toEqual(["EDIT"]);
        // Policy reads the SELF row's level, not the first row's.
        expect(result.current.state.grantees[0]!.id).toBe("user:self");
    });

    it("limits the levels the caller can grant to their own level", async () => {
        // SELF_GRANT holds SHARE, so EDIT is not theirs to give. The server refuses it,
        // and the dialog now shows it disabled instead.
        const { result } = renderController(makeService([SELF_GRANT, USER_GRANT]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.grantableDisabledLevels).toEqual(["EDIT"]));
    });

    it("sets no grant limit when the caller has no row of their own", async () => {
        // Their access can come from a group, which the access list does not report, so
        // any limit here would be a guess that blocks a real holder.
        const { result } = renderController(makeService([USER_GRANT]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(getUserMock).toHaveResolved());
        await act(async () => {});
        expect(result.current.state.grantableDisabledLevels).toBeUndefined();
    });

    it("sets no grant limit while the caller's manager status is unknown", async () => {
        // A limit that guesses wrong blocks a grant the server would accept, and a failed
        // permission read would make that permanent. The confirm can default to the safe
        // side; a limit cannot.
        const { result } = renderController(
            makeService([SELF_GRANT, USER_GRANT]),
            TARGET,
            undefined,
            "reject",
        );
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selfManagedGranteeId).toBe("user:self"));
        // The self row still carries its own confirm and cap, only the global limit is off.
        expect(result.current.state.grantableDisabledLevels).toBeUndefined();
        expect(result.current.state.selfManagedDisabledLevels).toEqual(["EDIT"]);
    });

    it("sets no grant limit for a workspace manager", async () => {
        const { result } = renderController(makeService([SELF_GRANT]), TARGET, undefined, {
            canManageProject: true,
        });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(getUserMock).toHaveResolved());
        await act(async () => {});
        expect(result.current.state.grantableDisabledLevels).toBeUndefined();
    });

    it("exempts a workspace manager's own row from the self-restriction policy", async () => {
        // A manager has no ceiling to cap and no lockout to confirm. A SOLE self
        // grant, the shape that always engaged the policy before.
        const { result } = renderController(makeService([SELF_GRANT]), TARGET, undefined, {
            canManageProject: true,
        });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(getUserMock).toHaveResolved());
        await act(async () => {});
        expect(result.current.state.selfManagedGranteeId).toBeUndefined();
        expect(result.current.state.selfManagedDisabledLevels).toBeUndefined();
    });

    it("applies the policy when the workspace permission cannot be read", async () => {
        // Fail-safe: an unread MANAGE permission must not read as "is a manager".
        const { result } = renderController(makeService([SELF_GRANT]), TARGET, undefined, "reject");
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selfManagedGranteeId).toBe("user:self"));
    });

    it("locks a sole user row's controls while the profile cannot resolve", async () => {
        // Profile errors are swallowed (selfIdentityResolved stays false) — an
        // unidentified sole user row may be the caller's own grant, so mutating
        // it would bypass the self-restriction confirm.
        getUserMock.mockRejectedValueOnce(new Error("profile down"));
        const { result } = renderController(makeService([USER_GRANT]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.granteeControlsLocked).toBe(true);
        expect(result.current.state.selfManagedGranteeId).toBeUndefined();
    });

    it("locks user rows in a longer list while the profile cannot resolve", async () => {
        // The self-restriction policy now follows the caller's row however many are
        // listed, so its precondition must too: with no identity, any user row could be
        // theirs, and an unguarded change can lose their access for good.
        getUserMock.mockRejectedValueOnce(new Error("profile down"));
        const { result } = renderController(makeService([USER_GRANT, SELF_GRANT]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.granteeControlsLocked).toBe(true);
        expect(result.current.state.selfManagedGranteeId).toBeUndefined();
    });

    it("does not lock rows for a known workspace manager", async () => {
        // A manager's own row carries no confirm, so there is nothing to protect.
        getUserMock.mockRejectedValueOnce(new Error("profile down"));
        const { result } = renderController(makeService([USER_GRANT, SELF_GRANT]), TARGET, undefined, {
            canManageProject: true,
        });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.granteeControlsLocked).toBe(false));
    });

    it("does not lock a sole group row on profile resolution", async () => {
        const GROUP_GRANT: AccessGranteeDetail = {
            type: "granularGroup",
            userGroup: { ref: idRef("g1"), name: "Marketing" },
            permissions: ["VIEW"],
            inheritedPermissions: [],
        } as AccessGranteeDetail;
        getUserMock.mockRejectedValueOnce(new Error("profile down"));
        const { result } = renderController(makeService([GROUP_GRANT]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.granteeControlsLocked).toBe(false);
    });

    it("synthesizes the admin self row when the list loaded empty", async () => {
        const { result } = renderController(makeService([]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        // The default profile mock knows only the login — the display pair falls
        // back to the user id, mirroring grantee rows.
        await waitFor(() => expect(result.current.state.adminSelfRow).toEqual({ name: "self" }));
    });

    it("shows the admin self row only while no other permissions are set", async () => {
        // Per the design the synthesized "(you)" row is an EMPTY-STATE row: adding a
        // grantee hides it, and removing that grantee brings it back (the caller is
        // still an admin whose access is grant-independent).
        const { result } = renderController(makeService([]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.adminSelfRow).toEqual({ name: "self" }));

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                {
                    id: "group:g1",
                    ref: idRef("g1"),
                    kind: "group",
                    name: "Marketing",
                    permissionLevel: "VIEW",
                },
            ]),
        );
        await act(async () => {
            await result.current.actions.confirmAddGrantees();
        });
        expect(result.current.state.grantees.some((g) => g.id === "group:g1")).toBe(true);
        expect(result.current.state.adminSelfRow).toBeUndefined();

        await act(async () => {
            await result.current.actions.removeGrantee("group:g1");
        });
        expect(result.current.state.grantees).toEqual([]);
        expect(result.current.state.adminSelfRow).toEqual({ name: "self" });
    });

    it("suppresses the admin row when a workspace-wide SHARE rule explains the access", async () => {
        const RULE: AccessGranteeDetail = {
            type: "allWorkspaceUsers",
            permissions: ["SHARE", "VIEW"],
            inheritedPermissions: [],
        };
        const { result } = renderController(makeService([RULE]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.adminSelfRow).toBeUndefined();
    });

    it("suppresses the admin row when a workspace-wide EDIT rule explains the access", async () => {
        // EDIT includes share capability, so it passes the manage gate like SHARE.
        const RULE: AccessGranteeDetail = {
            type: "allWorkspaceUsers",
            permissions: ["EDIT", "VIEW"],
            inheritedPermissions: [],
        };
        const { result } = renderController(makeService([RULE]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.adminSelfRow).toBeUndefined();
    });

    it("keeps the admin row under a view-only workspace rule (not share-capable)", async () => {
        const RULE: AccessGranteeDetail = {
            type: "allWorkspaceUsers",
            permissions: ["VIEW"],
            inheritedPermissions: [],
        };
        const { result } = renderController(makeService([RULE]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.adminSelfRow).toEqual({ name: "self" }));
    });

    it("shows no admin row when the caller's own grant was the way in (removed locally)", async () => {
        // A grant-holder who removes their own sole grant empties the list, but the
        // SEED held their grant — they have no grant-independent access to badge.
        const { result } = renderController(makeService([SELF_GRANT]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await act(async () => {
            await result.current.actions.removeGrantee("user:self");
        });
        expect(result.current.state.grantees).toEqual([]);
        expect(result.current.state.adminSelfRow).toBeUndefined();
    });

    it("shows the admin row after removing the last grantee from an others-only seed", async () => {
        // Regression (found in browser): an admin opened a list holding only OTHER
        // people's grants and removed the last one — the empty-state "(you)" row must
        // appear in the SAME session, not only after a fresh reopen.
        const { result } = renderController(makeService([USER_GRANT]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(getUserMock).toHaveResolved());
        expect(result.current.state.adminSelfRow).toBeUndefined(); // list non-empty

        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });

        expect(result.current.state.grantees).toEqual([]);
        expect(result.current.state.adminSelfRow).toEqual({ name: "self" });
    });

    it("does not brand the caller Admin after they restrict workspace access in-session", async () => {
        // Reproduced in browser: a caller whose way in was a share-capable rule and
        // who then restricts access must not be rebranded as an Admin.
        const SHARE_RULE: AccessGranteeDetail = {
            type: "allWorkspaceUsers",
            permissions: ["SHARE", "VIEW"],
            inheritedPermissions: [],
        };
        const { result } = renderController(makeService([SHARE_RULE]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(getUserMock).toHaveResolved());
        expect(result.current.state.adminSelfRow).toBeUndefined(); // rule was the way in

        act(() => result.current.actions.requestGeneralAccessChange("RESTRICTED"));
        await act(async () => {
            await result.current.actions.confirmGeneralAccessChange();
        });

        expect(result.current.state.generalAccess).toBe("RESTRICTED");
        expect(result.current.state.grantees).toEqual([]);
        // Still no badge: the SEED said the rule was share-capable.
        expect(result.current.state.adminSelfRow).toBeUndefined();
    });
});

describe("useObjectShareController write-path scope integrity", () => {
    beforeEach(() => {
        addSuccess.mockClear();
        addError.mockClear();
        addWarning.mockClear();
    });

    it("does not grant an inherited label when a fresh add's checklist is applied unchanged", async () => {
        // u2 holds no object grant (so they are addable) but inherits lbl.email. The
        // add-path scope seed cannot know that yet — inheritance resolves only once the
        // row is committed — so the label diff must count inherited labels as already
        // current, or an untouched Apply (the checklist always reports locked ids as
        // selected) would mint a local grant on a label this workspace never granted.
        const U2_INHERITED: AccessGranteeDetail = {
            type: "granularUser",
            user: {
                ref: idRef("u2"),
                uri: "/u2",
                login: "marek",
                email: "marek@example.com",
                fullName: "Marek",
            },
            permissions: [],
            inheritedPermissions: ["VIEW"],
        };
        const svc: IMockService = {
            getAccessList: vi.fn(async (t: IObjectPermissionsObject) => {
                const id = (t.ref as { identifier: string }).identifier;
                if (id === "lbl.email") return { grants: [U2_INHERITED] };
                return { grants: id === "label.country" ? [USER_GRANT] : [] };
            }),
            manageObjectPermissions: vi.fn(async () => undefined),
            getAvailableAssignees: vi.fn(async () => ASSIGNEES),
        };
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.labelsResolved).toBe(true));

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                {
                    id: "user:u2",
                    ref: idRef("u2"),
                    kind: "user",
                    name: "Marek",
                    permissionLevel: "VIEW",
                    labelIds: ["lbl.name"],
                },
            ]),
        );
        await act(async () => {
            await result.current.actions.confirmAddGrantees();
        });
        // Inheritance for the new row resolves from the cached probe once committed.
        await waitFor(() =>
            expect(result.current.state.inheritedLabelIdsByGrantee["user:u2"]).toContain("lbl.email"),
        );
        svc.manageObjectPermissions.mockClear();

        // Apply with nothing changed: the checklist reports the picked label plus the
        // locked primary and inherited ones.
        await act(async () => {
            await result.current.actions.changeGranteeLabels("user:u2", [
                "lbl.primary",
                "lbl.name",
                "lbl.email",
            ]);
        });

        // A full no-op — in particular no write on lbl.email, which would be a real
        // local grant on a label u2 only inherits.
        expect(svc.manageObjectPermissions).not.toHaveBeenCalled();
    });

    it("revokes a label whose earlier revoke failed when the grantee is removed after a re-add", async () => {
        // Remove u1: the object revoke lands but the lbl.name revoke fails — the direct
        // set is then the ONLY record that the label is still granted, and it must
        // survive the removal's bookkeeping cleanup. Re-add u1 WITHOUT lbl.name in
        // scope and remove them again: the second removal must revoke the leftover
        // grant, or it outlives the grantee's object access for good.
        let nameRevokeFailed = false;
        const svc: IMockService = {
            getAccessList: vi.fn(async (t: IObjectPermissionsObject) => {
                const id = (t.ref as { identifier: string }).identifier;
                return {
                    grants: ["label.country", "lbl.primary", "lbl.name"].includes(id) ? [USER_GRANT] : [],
                };
            }),
            manageObjectPermissions: vi.fn(async (t: IObjectPermissionsObject) => {
                const id = (t.ref as { identifier: string }).identifier;
                if (id === "lbl.name" && !nameRevokeFailed) {
                    nameRevokeFailed = true;
                    throw new Error("label revoke failed");
                }
                return undefined;
            }),
            getAvailableAssignees: vi.fn(async () => ASSIGNEES),
        };
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());

        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });
        expect(addWarning).toHaveBeenCalled(); // partial: lbl.name is still granted

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                {
                    id: "user:u1",
                    ref: idRef("u1"),
                    kind: "user",
                    name: "Jane Good",
                    permissionLevel: "VIEW",
                    labelIds: ["lbl.email"],
                },
            ]),
        );
        await act(async () => {
            await result.current.actions.confirmAddGrantees();
        });
        svc.manageObjectPermissions.mockClear();

        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });

        const byTarget = new Map(
            (
                svc.manageObjectPermissions.mock.calls as Array<
                    [IObjectPermissionsObject, IGranularAccessGrantee[]]
                >
            ).map(([t, g]) => [(t.ref as { identifier: string }).identifier, g[0]!.permissions]),
        );
        expect(byTarget.get("lbl.name")).toEqual([]); // the leftover grant is revoked
        expect(byTarget.get("lbl.email")).toEqual([]); // the re-add's grant too
        expect(byTarget.has("lbl.primary")).toBe(false); // primary stays implicit
    });

    it("refuses level changes and removals while the label scope is unresolved", async () => {
        // Before the per-label probe settles, the direct scope falls back to "all
        // labels" — a write would re-grade or revoke grants that never existed. The UI
        // disables the controls (isMutable); the controller must refuse on its own.
        const svc = makeLabelAwareService();
        svc.getAccessList.mockImplementation(async (t: IObjectPermissionsObject) => {
            const id = (t.ref as { identifier: string }).identifier;
            if (id === "label.country") return { grants: [USER_GRANT] };
            return new Promise(() => {}); // label probe never settles
        });
        const { result } = renderController(svc, TARGET, { labels: LABELS });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.labelsResolved).toBe(false);
        svc.manageObjectPermissions.mockClear();

        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "EDIT");
        });
        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });

        expect(svc.manageObjectPermissions).not.toHaveBeenCalled();
        // No optimistic edit was applied either — the rows stayed untouched.
        expect(result.current.state.grantees.find((g) => g.id === "user:u1")?.level).toBe("VIEW");
    });
});
