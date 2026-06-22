// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { act, renderHook, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import {
    type IAnalyticalBackend,
    type IObjectPermissionsObject,
    type IWorkspaceObjectPermissionsService,
    UnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import {
    type AccessGranteeDetail,
    type IAvailableAccessGrantee,
    type IGranularAccessGrantee,
    idRef,
} from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import type { IObjectShareLabel } from "../types.js";
import { useObjectShareController } from "../useObjectShareController.js";

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

const WORKSPACE = "ws";
const TARGET: IObjectPermissionsObject = { kind: "label", ref: idRef("label.country") };

// A definitive 404 — the backend's signal that a label isn't independently
// permissionable. Distinct from a transient error (which must NOT drop the label).
const notFound = () => new UnexpectedResponseError("Not Found", 404, {});

const USER_GRANT: AccessGranteeDetail = {
    type: "granularUser",
    user: { ref: idRef("u1"), uri: "/u1", login: "jane", email: "jane@x.com", fullName: "Jane Good" },
    permissions: ["VIEW"],
    inheritedPermissions: [],
} as AccessGranteeDetail;

const ASSIGNEES: IAvailableAccessGrantee[] = [
    { type: "user", ref: idRef("u2"), name: "Marek", email: "marek@x.com", status: "ENABLED" },
    { type: "group", ref: idRef("g1"), name: "Marketing" },
];

interface IMockService {
    getAccessList: Mock;
    manageObjectPermissions: Mock;
    getAvailableAssignees: Mock;
}

function makeBackend(svc: IMockService): IAnalyticalBackend {
    const base = dummyBackendEmptyData();
    return {
        ...base,
        workspace: (id: string) => ({
            ...base.workspace(id),
            objectPermissions: () => svc as unknown as IWorkspaceObjectPermissionsService,
        }),
    } as IAnalyticalBackend;
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
    labels?: IObjectShareLabel[],
    labelsError = false,
    labelsLoading = false,
) {
    const backend = makeBackend(svc);
    const wrapper = ({ children }: PropsWithChildren) => (
        <IntlProvider locale="en-US" messages={{}}>
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={WORKSPACE}>{children}</WorkspaceProvider>
            </BackendProvider>
        </IntlProvider>
    );
    return renderHook(() => useObjectShareController(target, undefined, labels, labelsError, labelsLoading), {
        wrapper,
    });
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

describe("useObjectShareController", () => {
    beforeEach(() => {
        addSuccess.mockClear();
        addError.mockClear();
        addWarning.mockClear();
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

    it("flags effectivePermission when inherited access exceeds the direct grant", async () => {
        // Direct VIEW, but inherits SHARE (e.g. via a group) → effective is SHARE.
        const INHERITED: AccessGranteeDetail = {
            type: "granularUser",
            user: { ref: idRef("u1"), uri: "/u1", login: "jane", email: "jane@x.com", fullName: "Jane Good" },
            permissions: ["VIEW"],
            inheritedPermissions: ["SHARE", "VIEW"],
        } as AccessGranteeDetail;
        const { result } = renderController(makeService([INHERITED]), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        const row = result.current.state.grantees.find((g) => g.id === "user:u1");
        expect(row?.level).toBe("VIEW");
        expect(row?.effectivePermission).toBe("SHARE");
    });

    it("leaves effectivePermission unset when the direct grant already covers it", async () => {
        // USER_GRANT is plain VIEW with no inherited SHARE.
        const { result } = renderController(makeService(), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.grantees[0]?.effectivePermission).toBeUndefined();
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

    it("reset returns to the main subview and clears pending buffers", async () => {
        const { result } = renderController(makeService(), TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                { id: "user:u2", kind: "user", name: "Marek", permissionLevel: "VIEW" },
            ]),
        );
        expect(result.current.state.subview).toBe("addGrantee");
        expect(result.current.state.pendingGrantees).toHaveLength(1);

        act(() => result.current.actions.reset());
        expect(result.current.state.subview).toBe("main");
        expect(result.current.state.pendingGrantees).toHaveLength(0);
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

    it("confirmAddGrantees sends granular grants and refetches", async () => {
        const svc = makeService();
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                { id: "group:g1", kind: "group", name: "Marketing", permissionLevel: "SHARE" },
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
        expect(svc.getAccessList).toHaveBeenCalledTimes(2); // initial + post-save refresh
        expect(addSuccess).toHaveBeenCalledTimes(1);
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

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                { id: "group:g1", kind: "group", name: "Marketing", permissionLevel: "VIEW" },
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
        // After refresh the optimistic marker is gone (reconciled with server truth).
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

    it("backfills a granted row's name from the picker when the grant has only a raw id", async () => {
        // u2 is granted but the access-list grant carries only the raw id as its name.
        const RAW: AccessGranteeDetail = {
            type: "granularUser",
            user: { ref: idRef("u2"), uri: "/u2", login: "u2", email: "u2", fullName: "u2" },
            permissions: ["VIEW"],
            inheritedPermissions: [],
        } as AccessGranteeDetail;
        const svc = makeService([RAW]);
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        // Before the picker is consulted, the row shows the raw id (no better source).
        expect(result.current.state.grantees.find((g) => g.id === "user:u2")?.name).toBe("u2");

        // Loading picker options teaches the controller u2's real name ("Marek").
        await act(async () => {
            await result.current.actions.loadOptions("");
        });
        expect(result.current.state.grantees.find((g) => g.id === "user:u2")?.name).toBe("Marek");
    });

    it("keeps the intended level through backend read-after-write lag", async () => {
        // getAccessList always returns the stale VIEW grant — simulating a backend
        // whose read replica hasn't caught up to the just-committed SHARE write.
        const svc = makeService();
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "SHARE");
        });

        // Even though the post-write refetch still reports VIEW, the row shows the
        // intended SHARE (and is no longer pending) — it must not revert.
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
                { id: "group:g1", kind: "group", name: "Marketing", permissionLevel: "VIEW" },
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

    it("settles the row (not stuck pending) when the post-write refresh fails", async () => {
        // The write succeeds and a success toast fires, but the follow-up refetch
        // fails. The optimistic row must drop its pending flag — otherwise it spins
        // on "saving" forever despite the change having persisted.
        let call = 0;
        const svc: IMockService = {
            getAccessList: vi.fn(async () => {
                call += 1;
                if (call === 1) {
                    return { grants: [USER_GRANT] }; // initial load OK
                }
                throw new Error("refresh boom"); // the post-write refresh fails
            }),
            manageObjectPermissions: vi.fn(async () => undefined), // write succeeds
            getAvailableAssignees: vi.fn(async () => ASSIGNEES),
        };
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        await act(async () => {
            await result.current.actions.changePermissionLevel("user:u1", "SHARE");
        });

        // Write persisted (success toast), refresh failed — the row reflects the new
        // level and is no longer pending.
        expect(addSuccess).toHaveBeenCalled();
        const row = result.current.state.grantees.find((g) => g.id === "user:u1");
        expect(row?.level).toBe("SHARE");
        expect(row?.pending).toBeUndefined();
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

    it("drops the grantee from the summary count immediately on remove (incl. read-after-write lag)", async () => {
        // getAccessList always returns the still-granted user, mimicking a stale read
        // replica after the removal write succeeds.
        const svc = makeService();
        const { result } = renderController(svc, TARGET);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.summary?.granteeCount).toBe(1);

        await act(async () => {
            await result.current.actions.removeGrantee("user:u1");
        });
        // The inline access row reads summary.granteeCount; it must reflect the removal
        // (0) even though the backend still reports the grant — otherwise it would
        // wrongly keep saying "shared with 1 user".
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

    it("exposes the passed labels in state", async () => {
        const { result } = renderController(makeLabelAwareService(), TARGET, LABELS);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.labels).toEqual(LABELS);
    });

    it("stays label-unresolved when label metadata failed to load", async () => {
        // Labels couldn't be fetched (labelsError), so the per-label scope is
        // unknowable. Even once the access list loads, labelsResolved must stay
        // false — otherwise remove / general-access would reconcile against an empty
        // label set and silently orphan real per-label grants. Consumers gate every
        // access-changing control on this flag.
        const { result } = renderController(makeLabelAwareService(), TARGET, LABELS, true);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        expect(result.current.state.labelsResolved).toBe(false);

        // Control case: same setup, no error → scope resolves and editing is allowed.
        const { result: ok } = renderController(makeLabelAwareService(), TARGET, LABELS, false);
        await waitFor(() => expect(ok.current.state.labelsResolved).toBe(true));
    });

    it("stays label-unresolved while labels are still loading", async () => {
        // While labels load, the consumer passes an empty list with labelsLoading
        // true — the labels just aren't known yet. That empty list must NOT be read
        // as a label-free object (which would resolve and enable row controls): a
        // remove would then reconcile against an empty label set and orphan the real
        // per-label grants. So labelsResolved stays false even once the access list
        // loads. Distinguished from a genuine fact (empty list, not loading).
        const { result: loading } = renderController(makeService(), TARGET, [], false, true);
        await waitFor(() => expect(loading.current.state.status).toBe("success"));
        expect(loading.current.state.labelsResolved).toBe(false);

        // Control case: a real label-free object (no labels, not loading) resolves.
        const { result: fact } = renderController(makeService(), TARGET, [], false, false);
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
                useObjectShareController(TARGET, undefined, labels, false, labelsLoading),
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
            ({ labels }: { labels: IObjectShareLabel[] }) =>
                useObjectShareController(TARGET, undefined, labels),
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
        const { result } = renderController(svc, TARGET, LABELS);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        // Even with zero grantees, the permissionable set resolves and filters 404s.
        await waitFor(() =>
            expect(result.current.state.labels.map((l) => l.id).sort()).toEqual(["lbl.name", "lbl.primary"]),
        );
    });

    it("resolves each grantee's label scope from per-label access lists", async () => {
        // u1 is granted on primary + name, but NOT email.
        const svc = makeLabelAwareService(["lbl.primary", "lbl.name"]);
        const { result } = renderController(svc, TARGET, LABELS);
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
        const { result } = renderController(svc, TARGET, LABELS);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());

        expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]!.sort()).toEqual([
            "lbl.name",
            "lbl.primary",
        ]);
    });

    it("changeGranteeLabels grants/revokes only the changed labels (primary always kept)", async () => {
        // Currently scoped to primary + name; request primary + email.
        const svc = makeLabelAwareService(["lbl.primary", "lbl.name"]);
        const { result } = renderController(svc, TARGET, LABELS);
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

    it("grants every non-primary label when adding a grantee (all labels by default)", async () => {
        const svc = makeLabelAwareService();
        const { result } = renderController(svc, TARGET, LABELS);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        svc.manageObjectPermissions.mockClear();

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                { id: "user:u2", kind: "user", name: "New User", permissionLevel: "VIEW" },
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

    it("warns and drops the optimistic scope if a label grant fails on add (#E)", async () => {
        const svc = makeLabelAwareService();
        // The object add succeeds; a per-label write then fails.
        svc.manageObjectPermissions.mockImplementation(async (t: IObjectPermissionsObject) => {
            if ((t.ref as { identifier: string }).identifier === "lbl.email") {
                throw new Error("label write failed");
            }
            return undefined;
        });
        const { result } = renderController(svc, TARGET, LABELS);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                { id: "user:u2", kind: "user", name: "New User", permissionLevel: "VIEW" },
            ]),
        );
        await act(async () => {
            await result.current.actions.confirmAddGrantees();
        });

        // A real per-label failure surfaces (not swallowed). The grantee's scope is
        // pinned to the primary label only — the one always granted with the object
        // — rather than dropped (a missing entry would falsely render as all-selected).
        expect(addWarning).toHaveBeenCalledTimes(1);
        expect(result.current.state.selectedLabelIdsByGrantee["user:u2"]).toEqual(["lbl.primary"]);
    });

    it("keeps the new grantee's full label scope through read-after-write lag", async () => {
        // Per-label lists never report u2 (simulating a stale backend after the
        // add-time label grants). The optimistic full scope must survive the
        // resolution effect that refresh() triggers.
        const svc = makeLabelAwareService(["lbl.primary", "lbl.name", "lbl.email"]); // only u1 granted
        const { result } = renderController(svc, TARGET, LABELS);
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                { id: "user:u2", kind: "user", name: "New User", permissionLevel: "VIEW" },
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

    it("discards queued label grants when the target changes (no cross-object leak)", async () => {
        const svc = makeLabelAwareService();
        const backend = makeBackend(svc);
        const wrapper = ({ children }: PropsWithChildren) => (
            <IntlProvider locale="en-US" messages={{}}>
                <BackendProvider backend={backend}>
                    <WorkspaceProvider workspace={WORKSPACE}>{children}</WorkspaceProvider>
                </BackendProvider>
            </IntlProvider>
        );
        const TARGET_A: IObjectPermissionsObject = { kind: "attribute", ref: idRef("attr.a") };
        const TARGET_B: IObjectPermissionsObject = { kind: "attribute", ref: idRef("attr.b") };
        const { result, rerender } = renderHook(
            ({ target, labels }: { target: IObjectPermissionsObject; labels: IObjectShareLabel[] }) =>
                useObjectShareController(target, undefined, labels),
            { wrapper, initialProps: { target: TARGET_A, labels: [] as IObjectShareLabel[] } },
        );
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        // Queue a grantee on A while A's labels are still empty.
        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                { id: "user:u2", kind: "user", name: "New User", permissionLevel: "VIEW" },
            ]),
        );
        await act(async () => {
            await result.current.actions.confirmAddGrantees();
        });

        // Switch to B, then B's labels load. The queue must NOT flush onto B.
        await act(async () => {
            rerender({ target: TARGET_B, labels: [] as IObjectShareLabel[] });
        });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        svc.manageObjectPermissions.mockClear();
        await act(async () => {
            rerender({ target: TARGET_B, labels: LABELS });
        });

        // No per-label writes happened for B from A's queued grantee.
        const labelCalls = svc.manageObjectPermissions.mock.calls.filter(([t]) =>
            ((t as IObjectPermissionsObject).ref as { identifier: string }).identifier.startsWith("lbl."),
        );
        expect(labelCalls.length).toBe(0);
    });

    it("drops a prior object's optimistic label scope on target switch (same labelsKey)", async () => {
        // u1 is granted on every label on both objects. The two objects share the
        // same label set, so labelsKey is identical across the switch. After
        // optimistically narrowing u1 to primary-only on A, switching to B must show
        // B's freshly-resolved scope (all labels) — NOT A's stale optimistic scope.
        // The optimistic-scope guard must be cleared on target change, not only on
        // labelsKey change, or it would merge A's scope over B's. The service grants
        // u1 on the object and on every label, for BOTH attribute targets.
        const ATTR_IDS = new Set(["attr.a", "attr.b"]);
        const LABEL_IDS = new Set(["lbl.primary", "lbl.name", "lbl.email"]);
        const svc: IMockService = {
            getAccessList: vi.fn(async (t: IObjectPermissionsObject) => {
                const id = (t.ref as { identifier: string }).identifier;
                return { grants: ATTR_IDS.has(id) || LABEL_IDS.has(id) ? [USER_GRANT] : [] };
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
        const TARGET_A: IObjectPermissionsObject = { kind: "attribute", ref: idRef("attr.a") };
        const TARGET_B: IObjectPermissionsObject = { kind: "attribute", ref: idRef("attr.b") };
        const { result, rerender } = renderHook(
            ({ target }: { target: IObjectPermissionsObject }) =>
                useObjectShareController(target, undefined, LABELS),
            { wrapper, initialProps: { target: TARGET_A } },
        );
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]).toBeDefined());

        // Optimistically narrow u1 to primary-only on A (sets the optimistic guard).
        await act(async () => {
            await result.current.actions.changeGranteeLabels("user:u1", []);
        });
        expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]!.sort()).toEqual(["lbl.primary"]);

        // Switch to B (same labelsKey). B resolves u1 to all labels; the stale
        // primary-only optimistic scope must NOT survive the switch.
        await act(async () => {
            rerender({ target: TARGET_B });
        });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        await waitFor(() =>
            expect(result.current.state.selectedLabelIdsByGrantee["user:u1"]?.sort()).toEqual([
                "lbl.email",
                "lbl.name",
                "lbl.primary",
            ]),
        );
    });

    it("clears staged UI buffers when the target changes (no cross-object leak)", async () => {
        // A staged add-grantee subview and a pending general-access confirm must not
        // survive navigation: the detail view closes the dialog by toggling isOpen
        // alone, so without a reset they would reappear on the next object and the
        // confirm could apply to the wrong target.
        const svc = makeService();
        const backend = makeBackend(svc);
        const wrapper = ({ children }: PropsWithChildren) => (
            <IntlProvider locale="en-US" messages={{}}>
                <BackendProvider backend={backend}>
                    <WorkspaceProvider workspace={WORKSPACE}>{children}</WorkspaceProvider>
                </BackendProvider>
            </IntlProvider>
        );
        const TARGET_A: IObjectPermissionsObject = { kind: "attribute", ref: idRef("attr.a") };
        const TARGET_B: IObjectPermissionsObject = { kind: "attribute", ref: idRef("attr.b") };
        const { result, rerender } = renderHook(
            ({ target }: { target: IObjectPermissionsObject }) => useObjectShareController(target, undefined),
            { wrapper, initialProps: { target: TARGET_A } },
        );
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        // Stage an add-grantee subview, a pending grantee and a general-access confirm.
        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                { id: "user:u2", kind: "user", name: "New User", permissionLevel: "VIEW" },
            ]),
        );
        act(() => result.current.actions.requestGeneralAccessChange("WORKSPACE"));
        expect(result.current.state.subview).toBe("addGrantee");
        expect(result.current.state.pendingGrantees).toHaveLength(1);
        expect(result.current.state.pendingGeneralAccess).toBe("WORKSPACE");

        // Navigate to B — the staged buffers must be dropped.
        await act(async () => {
            rerender({ target: TARGET_B });
        });
        expect(result.current.state.subview).toBe("main");
        expect(result.current.state.pendingGrantees).toEqual([]);
        expect(result.current.state.pendingGeneralAccess).toBeUndefined();
    });

    it("reports loading (not success) until the new target's list lands", async () => {
        // After a target switch the previous list is dropped by the stamp, but the
        // load status still reads idle from the prior completed fetch until the new
        // one settles. Status must report loading in that window — not success with
        // no list, which would let the dialog enable mutations and the catalog row
        // hide both the summary and the skeleton. Gate the second fetch on a manual
        // deferral so the in-flight window is observable.
        let releaseB: (list: { grants: AccessGranteeDetail[] }) => void = () => {};
        const svc: IMockService = {
            getAccessList: vi.fn((t: IObjectPermissionsObject) => {
                const id = (t.ref as { identifier: string }).identifier;
                if (id === "attr.b") {
                    return new Promise((resolve) => {
                        releaseB = resolve;
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
        const TARGET_A: IObjectPermissionsObject = { kind: "attribute", ref: idRef("attr.a") };
        const TARGET_B: IObjectPermissionsObject = { kind: "attribute", ref: idRef("attr.b") };
        const { result, rerender } = renderHook(
            ({ target }: { target: IObjectPermissionsObject }) => useObjectShareController(target, undefined),
            { wrapper, initialProps: { target: TARGET_A } },
        );
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        // Switch to B; its fetch is still pending → status must be loading, not success.
        await act(async () => {
            rerender({ target: TARGET_B });
        });
        expect(result.current.state.status).toBe("loading");
        expect(result.current.state.summary).toBeUndefined();

        // Release B's fetch → resolves to success once the new list is stamped.
        await act(async () => {
            releaseB({ grants: [USER_GRANT] });
        });
        await waitFor(() => expect(result.current.state.status).toBe("success"));
    });

    it("ignores a stale refresh that lands after switching targets", async () => {
        // Mutate A → A's background refresh is in flight → switch to B → B's fetch
        // lands → A's refresh resolves late. The stale refresh must NOT stamp the
        // list back to A: doing so would clear B's currentAccessList and, with the
        // load-gated status, strand B "loading" forever (B's own fetch already
        // settled and won't re-stamp). B must stay success on its own list.
        let releaseRefreshA: (list: { grants: AccessGranteeDetail[] }) => void = () => {};
        const aCalls = { n: 0 };
        const svc: IMockService = {
            getAccessList: vi.fn((t: IObjectPermissionsObject) => {
                const id = (t.ref as { identifier: string }).identifier;
                if (id === "attr.a") {
                    aCalls.n += 1;
                    // 1st call = initial load (immediate); 2nd = the post-mutate
                    // refresh, which we hold so it can resolve after the B switch.
                    if (aCalls.n >= 2) {
                        return new Promise((resolve) => {
                            releaseRefreshA = resolve;
                        });
                    }
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
        const TARGET_A: IObjectPermissionsObject = { kind: "attribute", ref: idRef("attr.a") };
        const TARGET_B: IObjectPermissionsObject = { kind: "attribute", ref: idRef("attr.b") };
        const { result, rerender } = renderHook(
            ({ target }: { target: IObjectPermissionsObject }) => useObjectShareController(target, undefined),
            { wrapper, initialProps: { target: TARGET_A } },
        );
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        // Start a mutation on A; commit awaits refresh(), which is now in flight.
        let mutation: Promise<void> = Promise.resolve();
        act(() => {
            mutation = result.current.actions.changePermissionLevel("user:u1", "SHARE");
        });

        // Switch to B; B's fetch lands immediately and stamps B.
        await act(async () => {
            rerender({ target: TARGET_B });
        });
        await waitFor(() => expect(result.current.state.status).toBe("success"));

        // Now let A's stale refresh resolve — it must be ignored.
        await act(async () => {
            releaseRefreshA({ grants: [USER_GRANT] });
            await mutation;
        });

        // B is still loaded on its own list, not stranded loading by A's refresh.
        expect(result.current.state.status).toBe("success");
        expect(result.current.state.summary).toBeDefined();
    });

    it("revokes the grantee from every label when removing them", async () => {
        const svc = makeLabelAwareService();
        const { result } = renderController(svc, TARGET, LABELS);
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
        const { result } = renderController(svc, TARGET, LABELS);
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
        const { result } = renderController(svc, TARGET, LABELS);
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
        const { result } = renderController(svc, TARGET, LABELS);
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
        const { result } = renderController(svc, TARGET, LABELS);
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
        const { result } = renderController(svc, TARGET, LABELS);
        await waitFor(() => expect(result.current.state.status).toBe("success"));
        // lbl.name is kept (transient), so all three labels stay available.
        await waitFor(() =>
            expect(result.current.state.labels.map((l) => l.id).sort()).toEqual([
                "lbl.email",
                "lbl.name",
                "lbl.primary",
            ]),
        );
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
});
