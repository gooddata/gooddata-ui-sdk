// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { act, renderHook, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import {
    type IAnalyticalBackend,
    type IObjectPermissionsObject,
    type IWorkspaceObjectPermissionsService,
} from "@gooddata/sdk-backend-spi";
import { type IGranularAccessGrantee, idRef, objRefToString } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import type { IObjectShareLabel } from "../types.js";
import { useObjectShareController } from "../useObjectShareController.js";

/**
 * State-matrix coverage for per-label access provenance.
 *
 * The share dialog decides three different things about each (grantee, label) pair, and a
 * label that is BOTH granted here and inherited answers them differently:
 *
 * - **in scope** (checkbox checked) — direct OR inherited;
 * - **locked** (checkbox not editable) — inherited, because revoking what this workspace
 *   granted cannot take the access away;
 * - **writable** (a revoke/re-grade may target it) — direct, and ONLY direct.
 *
 * The invariants every operation must preserve:
 *
 * - **INV-A** no write ever targets a label held by inheritance alone (a revoke is a
 *   no-op whose compensation could mint a real grant; a re-grade would invent one);
 * - **INV-B** every local grant the dialog creates is revocable by Remove access — nothing
 *   it writes may outlive the grantee's access;
 * - **INV-C** a label grant is never left above the object grant;
 * - **INV-D** the displayed scope equals what the backend would report;
 * - **INV-E** a write that changes no access changes no displayed access;
 * - **INV-F** after the dialog's OWN writes, later decisions use up-to-date provenance —
 *   the probe runs once per session, so nothing may rely on it still being current.
 *
 * These tests assert the backend's RESULTING STATE, not the calls that were issued. Call
 * assertions cannot see a grant that outlives a removal, which is how the primary-label
 * leak and the post-removal re-grant both reached review.
 */

const WORKSPACE = "ws";
const TARGET: IObjectPermissionsObject = { kind: "attribute", ref: idRef("attr.country") };

const PRIMARY: IObjectShareLabel = {
    ref: idRef("attr.country"),
    id: "attr.country",
    title: "Country",
    isPrimary: true,
    isDefault: false,
};
const NAME: IObjectShareLabel = {
    ref: idRef("lbl.name"),
    id: "lbl.name",
    title: "Name",
    isPrimary: false,
    isDefault: true,
};
const CODE: IObjectShareLabel = {
    ref: idRef("lbl.code"),
    id: "lbl.code",
    title: "Code",
    isPrimary: false,
    isDefault: false,
};
const LABELS = [PRIMARY, NAME, CODE];

const U1 = "u1";
const U1_ROW = "user:u1";

/** Permission sources for one (object, grantee) pair, as the backend reports them. */
interface ISources {
    /** Granted in THIS workspace — what the dialog may change. */
    direct?: string[];
    /** From a group or a parent workspace — the dialog cannot touch it. */
    inherited?: string[];
}

/**
 * A STATEFUL fake permissions service: `manageObjectPermissions` mutates the direct
 * grants (an empty permission set revokes), `getAccessList` reads them back, and inherited
 * grants are immutable because no write in this workspace can reach them. Lets a test
 * assert what access actually remains after a sequence of operations.
 */
function makeStatefulService(initial: Record<string, Record<string, ISources>>) {
    // "<kind>:<id>" -> granteeId -> sources. Keyed by kind as well as id because an
    // attribute and its primary label share an identifier while being different objects —
    // collapsing them would hide a grant left on one of the two.
    const state: Record<string, Record<string, ISources>> = structuredClone(initial);
    const svc = {
        getAccessList: vi.fn(async (t: IObjectPermissionsObject) => {
            const objectId = `${t.kind}:${objRefToString(t.ref)}`;
            const perGrantee = state[objectId] ?? {};
            return {
                grants: Object.entries(perGrantee)
                    .filter(([, s]) => (s.direct?.length ?? 0) > 0 || (s.inherited?.length ?? 0) > 0)
                    .map(([granteeId, s]) => ({
                        type: "granularUser" as const,
                        user: {
                            ref: idRef(granteeId),
                            uri: `/${granteeId}`,
                            login: granteeId,
                            email: `${granteeId}@example.com`,
                            fullName: granteeId,
                        },
                        permissions: s.direct ?? [],
                        inheritedPermissions: s.inherited ?? [],
                    })),
            };
        }),
        manageObjectPermissions: vi.fn(async (t: IObjectPermissionsObject, gs: IGranularAccessGrantee[]) => {
            const objectId = `${t.kind}:${objRefToString(t.ref)}`;
            state[objectId] = state[objectId] ?? {};
            for (const g of gs) {
                if (!("granteeRef" in g)) {
                    continue; // allWorkspaceUsers rule — not part of this matrix
                }
                const granteeId = objRefToString(g.granteeRef);
                const existing = state[objectId]![granteeId] ?? {};
                // A write only ever sets what this workspace grants.
                state[objectId]![granteeId] = { ...existing, direct: [...g.permissions] };
            }
            return undefined;
        }),
        getAvailableAssignees: vi.fn(async () => [
            { type: "user" as const, ref: idRef(U1), name: U1, email: `${U1}@example.com` },
            { type: "user" as const, ref: idRef("u2"), name: "u2", email: "u2@example.com" },
        ]),
    };
    /** What this workspace grants the grantee on the shared ATTRIBUTE right now. */
    const directOnObject = (granteeId = U1) =>
        state[`attribute:${objRefToString(TARGET.ref)}`]?.[granteeId]?.direct ?? [];
    /** What this workspace grants the grantee on one LABEL right now ([] = nothing). */
    const directOnLabel = (labelId: string, granteeId = U1) =>
        state[`label:${labelId}`]?.[granteeId]?.direct ?? [];
    return { svc, directOnObject, directOnLabel, state };
}

function makeBackend(svc: unknown): IAnalyticalBackend {
    const base = dummyBackendEmptyData();
    return {
        ...base,
        workspace: (id: string) => ({
            ...base.workspace(id),
            objectPermissions: () => svc as unknown as IWorkspaceObjectPermissionsService,
        }),
    } as unknown as IAnalyticalBackend;
}

function renderController(svc: unknown) {
    const backend = makeBackend(svc);
    const wrapper = ({ children }: PropsWithChildren) => (
        <IntlProvider locale="en-US" messages={{}}>
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={WORKSPACE}>{children}</WorkspaceProvider>
            </BackendProvider>
        </IntlProvider>
    );
    return renderHook(() => useObjectShareController(TARGET, { labels: LABELS }), { wrapper });
}

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
    };
});

/** The object is granted here AND inherited; `lbl.name` likewise; `lbl.code` inherited only. */
const DUAL_EVERYWHERE = {
    "attribute:attr.country": { [U1]: { direct: ["VIEW"], inherited: ["SHARE", "VIEW"] } },
    // The primary label — same identifier as the attribute, a different object.
    "label:attr.country": { [U1]: { direct: ["VIEW"], inherited: ["SHARE", "VIEW"] } },
    "label:lbl.name": { [U1]: { direct: ["VIEW"], inherited: ["SHARE", "VIEW"] } },
    "label:lbl.code": { [U1]: { inherited: ["SHARE", "VIEW"] } },
};

describe("label access provenance — state matrix", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const ready = async (result: { current: { state: { status: string } } }) => {
        await waitFor(() => expect(result.current.state.status).toBe("success"));
    };

    it("INV-D: scope covers direct, inherited and primary; locked covers inherited", async () => {
        const { svc } = makeStatefulService(DUAL_EVERYWHERE);
        const { result } = renderController(svc);
        await ready(result);
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee[U1_ROW]).toBeDefined());

        expect(result.current.state.selectedLabelIdsByGrantee[U1_ROW]!.sort()).toEqual([
            "attr.country", // primary
            "lbl.code", // inherited only
            "lbl.name", // direct + inherited
        ]);
        // Both inherited labels lock; the dual one locks too, since revoking our grant
        // cannot remove the access.
        expect(result.current.state.inheritedLabelIdsByGrantee[U1_ROW]!.sort()).toEqual([
            "lbl.code",
            "lbl.name",
        ]);
    });

    it("INV-A + INV-B: Remove revokes every local grant and touches nothing inherited-only", async () => {
        const { svc, directOnObject, directOnLabel } = makeStatefulService(DUAL_EVERYWHERE);
        const { result } = renderController(svc);
        await ready(result);
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee[U1_ROW]).toBeDefined());

        await act(async () => {
            await result.current.actions.removeGrantee(U1_ROW);
        });

        expect(directOnObject()).toEqual([]); // object revoked
        expect(directOnLabel("lbl.name")).toEqual([]); // dual label's LOCAL grant revoked
        expect(directOnLabel("lbl.code")).toEqual([]); // inherited only — never had one, none created
    });

    it("INV-F: a level change after a removal must not re-create the revoked label grant", async () => {
        // The probe ran before the removal, so anything relying on it still being current
        // will treat the revoked dual label as locally granted and re-grant it.
        const { svc, directOnObject, directOnLabel } = makeStatefulService(DUAL_EVERYWHERE);
        const { result } = renderController(svc);
        await ready(result);
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee[U1_ROW]).toBeDefined());

        await act(async () => {
            await result.current.actions.removeGrantee(U1_ROW);
        });
        expect(directOnLabel("lbl.name")).toEqual([]);

        // The row survives as inherited-only; raise it to EDIT.
        await act(async () => {
            await result.current.actions.changePermissionLevel(U1_ROW, "EDIT");
        });

        // The object grant is legitimate; the label grant we just revoked must stay gone.
        expect(directOnObject()).toEqual(["EDIT", "VIEW"]);
        expect(directOnLabel("lbl.name")).toEqual([]);
        expect(directOnLabel("lbl.code")).toEqual([]);
    });

    it("INV-B: a level change then a removal leaves no label grant behind", async () => {
        const { svc, directOnObject, directOnLabel } = makeStatefulService({
            "attribute:attr.country": { [U1]: { direct: ["VIEW"] } },
            "label:attr.country": {},
            "label:lbl.name": { [U1]: { direct: ["VIEW"] } },
            "label:lbl.code": {},
        });
        const { result } = renderController(svc);
        await ready(result);
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee[U1_ROW]).toBeDefined());

        await act(async () => {
            await result.current.actions.changePermissionLevel(U1_ROW, "EDIT");
        });
        await act(async () => {
            await result.current.actions.removeGrantee(U1_ROW);
        });

        expect(directOnObject()).toEqual([]);
        expect(directOnLabel("lbl.name")).toEqual([]);
        // And no grant on the PRIMARY label: the re-grade must never create one, because
        // the removal diff treats primary access as implicit and cannot revoke it.
        expect(directOnLabel("attr.country")).toEqual([]);
    });

    it("INV-F: checking a new label then removing revokes the grant just created", async () => {
        const { svc, directOnObject, directOnLabel } = makeStatefulService({
            "attribute:attr.country": { [U1]: { direct: ["EDIT", "VIEW"] } },
            "label:attr.country": {},
            "label:lbl.name": { [U1]: { direct: ["EDIT", "VIEW"] } },
            "label:lbl.code": {},
        });
        const { result } = renderController(svc);
        await ready(result);
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee[U1_ROW]).toBeDefined());

        // Bring lbl.code into scope — a brand new local grant.
        await act(async () => {
            await result.current.actions.changeGranteeLabels(U1_ROW, [
                "attr.country",
                "lbl.name",
                "lbl.code",
            ]);
        });
        expect(directOnLabel("lbl.code")).toEqual(["EDIT", "VIEW"]);

        await act(async () => {
            await result.current.actions.removeGrantee(U1_ROW);
        });
        expect(directOnLabel("lbl.code")).toEqual([]); // INV-B
        expect(directOnLabel("lbl.name")).toEqual([]);
        expect(directOnObject()).toEqual([]);
    });

    it("INV-A: unchecking an inherited-only label writes nothing", async () => {
        const { svc, directOnLabel, state } = makeStatefulService(DUAL_EVERYWHERE);
        const { result } = renderController(svc);
        await ready(result);
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee[U1_ROW]).toBeDefined());
        svc.manageObjectPermissions.mockClear();

        // Ask to drop lbl.code, which the grantee only inherits.
        await act(async () => {
            await result.current.actions.changeGranteeLabels(U1_ROW, ["attr.country", "lbl.name"]);
        });

        // No write may target it, and the access is still there.
        const touched = svc.manageObjectPermissions.mock.calls.map(([t]) => objRefToString(t.ref));
        expect(touched).not.toContain("lbl.code");
        expect(state["label:lbl.code"]![U1]!.inherited).toEqual(["SHARE", "VIEW"]);
        expect(directOnLabel("lbl.code")).toEqual([]);
    });

    it("INV-E: a label edit leaves the row's own permission level untouched", async () => {
        const { svc, directOnObject } = makeStatefulService(DUAL_EVERYWHERE);
        const { result } = renderController(svc);
        await ready(result);
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee[U1_ROW]).toBeDefined());

        await act(async () => {
            await result.current.actions.changeGranteeLabels(U1_ROW, [
                "attr.country",
                "lbl.name",
                "lbl.code",
            ]);
        });

        // The object grant is still the VIEW this workspace granted — not the inherited SHARE.
        expect(directOnObject()).toEqual(["VIEW"]);
        const row = result.current.state.grantees.find((g) => g.id === U1_ROW)!;
        expect(row.directLevel).toBe("VIEW");
        expect(row.level).toBe("SHARE"); // effective, from inheritance
    });

    it("INV-C: a lowered level never leaves a label above the object", async () => {
        const { svc, directOnObject, directOnLabel } = makeStatefulService({
            "attribute:attr.country": { [U1]: { direct: ["EDIT", "VIEW"] } },
            "label:attr.country": {},
            "label:lbl.name": { [U1]: { direct: ["EDIT", "VIEW"] } },
            "label:lbl.code": {},
        });
        const { result } = renderController(svc);
        await ready(result);
        await waitFor(() => expect(result.current.state.selectedLabelIdsByGrantee[U1_ROW]).toBeDefined());

        await act(async () => {
            await result.current.actions.changePermissionLevel(U1_ROW, "VIEW");
        });

        expect(directOnObject()).toEqual(["VIEW"]);
        expect(directOnLabel("lbl.name")).toEqual(["VIEW"]);
    });

    it("INV-F: adding a grantee with a narrowed scope, then removing, leaves nothing", async () => {
        const { svc, directOnObject, directOnLabel } = makeStatefulService({
            "attribute:attr.country": {},
            "label:attr.country": {},
            "label:lbl.name": {},
            "label:lbl.code": {},
        });
        const { result } = renderController(svc);
        await ready(result);

        act(() => result.current.actions.openAddGrantee());
        act(() =>
            result.current.actions.setPendingGrantees([
                {
                    id: U1_ROW,
                    ref: idRef(U1),
                    kind: "user",
                    name: U1,
                    permissionLevel: "EDIT",
                    labelIds: ["lbl.name"],
                },
            ]),
        );
        await act(async () => {
            await result.current.actions.confirmAddGrantees();
        });
        expect(directOnLabel("lbl.name")).toEqual(["EDIT", "VIEW"]);
        expect(directOnLabel("lbl.code")).toEqual([]); // narrowed out

        await act(async () => {
            await result.current.actions.removeGrantee(U1_ROW);
        });
        expect(directOnObject()).toEqual([]);
        expect(directOnLabel("lbl.name")).toEqual([]);
    });
});
