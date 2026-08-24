// (C) 2026 GoodData Corporation

import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import {
    type IAnalyticalBackend,
    type IWorkspaceObjectPermissionsService,
    UnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";
import { type AccessGranteeDetail, idRef } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import type { IObjectAccessSummary } from "@gooddata/sdk-ui-ext";
import { createTightWaitFor } from "@gooddata/util";

import { TestIntlProvider } from "../../localization/TestIntlProvider.js";

import { CatalogItemAccessRow } from "./CatalogItemAccessRow.js";
import {
    CatalogItemShareProvider,
    useCatalogItemShareActions,
    useCatalogItemShareState,
} from "./CatalogItemShareProvider.js";
import type { ShareableCatalogItem } from "./types.js";

// The provider owns the page-level summary fetch; the dialog is a separate,
// session-scoped component not under test here. Mock only the backend service.
const USER_GRANT: AccessGranteeDetail = {
    type: "granularUser",
    user: { ref: idRef("u1"), uri: "/u1", login: "jane", email: "jane@example.com", fullName: "Jane Good" },
    permissions: ["VIEW"],
    inheritedPermissions: [],
} as AccessGranteeDetail;

const notFound = () => new UnexpectedResponseError("Not Found", 404, {});

function makeBackend(getAccessList: (t: unknown) => Promise<{ grants: AccessGranteeDetail[] }>) {
    const base = dummyBackendEmptyData();
    return {
        ...base,
        workspace: (id: string) => ({
            ...base.workspace(id),
            objectPermissions: () => ({ getAccessList }) as unknown as IWorkspaceObjectPermissionsService,
        }),
    } as unknown as IAnalyticalBackend;
}

function makeItem(identifier: string, title = "Region"): ShareableCatalogItem {
    return {
        description: "",
        tags: [],
        createdBy: "",
        updatedBy: "",
        createdAt: null,
        updatedAt: null,
        isLocked: false,
        isEditable: true,
        type: "attribute",
        identifier,
        title,
    };
}

const attribute = makeItem("attr.region");
const target = { kind: "attribute" as const, ref: idRef("attr.region", "attribute") };
const NO_LABELS = { labels: [], loading: false, error: false };

// The probes below render `null`, so waitFor's MutationObserver never fires and each
// wait falls back to the default 50ms poll — the whole cost of these tests. Every wait
// here only bridges an already-resolved promise plus a React state flush, so poll on
// the next tick instead.
const settle = createTightWaitFor(waitFor);

function renderProvider(
    backend: IAnalyticalBackend,
    children: React.ReactNode,
    item: ShareableCatalogItem | undefined = attribute,
    itemTarget = item ? target : undefined,
) {
    const tree = (i: ShareableCatalogItem | undefined, t: typeof itemTarget) => (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace="ws">
                <CatalogItemShareProvider shareableItem={i} target={t} labels={NO_LABELS}>
                    {children}
                </CatalogItemShareProvider>
            </WorkspaceProvider>
        </BackendProvider>
    );
    const result = render(tree(item, itemTarget));
    return {
        ...result,
        rerenderWith: (i: ShareableCatalogItem | undefined, t: typeof itemTarget) =>
            result.rerender(tree(i, t)),
    };
}

describe("CatalogItemShareProvider", () => {
    it("loads the initial summary without the dialog ever opening", async () => {
        const backend = makeBackend(vi.fn(async () => ({ grants: [USER_GRANT] })));
        let summary: IObjectAccessSummary | undefined;
        function Probe() {
            summary = useCatalogItemShareState().summary;
            return null;
        }

        renderProvider(backend, <Probe />);

        await settle(() =>
            expect(summary).toEqual({
                generalAccess: "RESTRICTED",
                workspaceLevel: "VIEW",
                granteeCount: 1,
            }),
        );
    });

    it("updates the summary from the dialog's onSummaryChange without a refetch", async () => {
        const getAccessList = vi.fn(async () => ({ grants: [USER_GRANT] }));
        const backend = makeBackend(getAccessList);
        let summary: IObjectAccessSummary | undefined;
        let onSummaryChange: (s: IObjectAccessSummary) => void = () => {};
        function Probe() {
            summary = useCatalogItemShareState().summary;
            onSummaryChange = useCatalogItemShareActions().onSummaryChange;
            return null;
        }

        renderProvider(backend, <Probe />);
        await settle(() => expect(summary?.granteeCount).toBe(1));

        const updated: IObjectAccessSummary = {
            generalAccess: "WORKSPACE",
            workspaceLevel: "EDIT",
            granteeCount: 2,
        };
        act(() => onSummaryChange(updated));

        expect(summary).toEqual(updated);
        expect(getAccessList).toHaveBeenCalledTimes(1); // no refetch
    });

    it("offers sharing only once the access list has come back", async () => {
        // The manage-gated endpoint's verdict arrives with the response, so offering
        // the Share button while the fetch is in flight made it appear and then vanish
        // for a view-only user (F1-2730). The inline access row is unaffected — it
        // shows its skeleton meanwhile — so only the actions wait.
        let release: (list: { grants: AccessGranteeDetail[] }) => void = () => {};
        const backend = makeBackend(
            vi.fn(
                () =>
                    new Promise<{ grants: AccessGranteeDetail[] }>((resolve) => {
                        release = resolve;
                    }),
            ),
        );
        let canShare = false;
        let rowActive = false;
        function Probe() {
            canShare = useCatalogItemShareActions().active;
            rowActive = useCatalogItemShareState().active;
            return null;
        }

        renderProvider(backend, <Probe />);
        // In flight: no Share button yet, but the row is already rendering.
        expect(canShare).toBe(false);
        expect(rowActive).toBe(true);

        await act(async () => {
            release({ grants: [USER_GRANT] });
        });
        await settle(() => expect(canShare).toBe(true));
    });

    it("never offers sharing when the access list is not permissionable", async () => {
        // The rejection is deferred and released inside `act`, so the assertions bracket a
        // known state transition. Asserting `canShare === false` against an immediate
        // rejection would pass before the 404 was ever processed — it is false while the
        // fetch is still in flight, so the test would prove nothing.
        let reject: (error: unknown) => void = () => {};
        const backend = makeBackend(
            vi.fn(
                () =>
                    new Promise<{ grants: AccessGranteeDetail[] }>((_resolve, r) => {
                        reject = r;
                    }),
            ),
        );
        let canShare = false;
        let rowActive = false;
        function Probe() {
            canShare = useCatalogItemShareActions().active;
            rowActive = useCatalogItemShareState().active;
            return null;
        }

        renderProvider(backend, <Probe />);
        // In flight: sharing not offered yet, but the access row is still rendering.
        expect(canShare).toBe(false);
        expect(rowActive).toBe(true);

        await act(async () => {
            reject(notFound());
        });

        // The 404 landed — provably, because the row turned inactive — and sharing was
        // never offered on the way there.
        expect(rowActive).toBe(false);
        expect(canShare).toBe(false);
    });

    it("keeps a dialog-provided summary over a later page-fetch result (seed only)", async () => {
        let release: (list: { grants: AccessGranteeDetail[] }) => void = () => {};
        const backend = makeBackend(
            vi.fn(
                () =>
                    new Promise<{ grants: AccessGranteeDetail[] }>((resolve) => {
                        release = resolve;
                    }),
            ),
        );
        let summary: IObjectAccessSummary | undefined;
        let onSummaryChange: (s: IObjectAccessSummary) => void = () => {};
        function Probe() {
            summary = useCatalogItemShareState().summary;
            onSummaryChange = useCatalogItemShareActions().onSummaryChange;
            return null;
        }

        renderProvider(backend, <Probe />);

        // The dialog reports first (its own fetch is newer than the page's).
        const fromDialog: IObjectAccessSummary = {
            generalAccess: "RESTRICTED",
            workspaceLevel: "VIEW",
            granteeCount: 3,
        };
        act(() => onSummaryChange(fromDialog));
        await act(async () => {
            release({ grants: [USER_GRANT] });
        });

        expect(summary).toEqual(fromDialog);
    });

    it("closes the dialog and drops the summary when the item changes", async () => {
        const backend = makeBackend(vi.fn(async () => ({ grants: [USER_GRANT] })));
        let state: ReturnType<typeof useCatalogItemShareState> | undefined;
        let open: () => void = () => {};
        function Probe() {
            state = useCatalogItemShareState();
            open = useCatalogItemShareActions().open;
            return null;
        }

        const { rerenderWith } = renderProvider(backend, <Probe />);
        await settle(() => expect(state?.summary).toBeDefined());
        act(() => open());
        expect(state?.isOpen).toBe(true);

        // Navigate to another item: the dialog must close (unmounting the session)
        // and the previous item's summary must not linger under the new one.
        const other = makeItem("attr.city", "City");
        const otherTarget = { kind: "attribute" as const, ref: idRef("attr.city", "attribute") };
        rerenderWith(other, otherTarget);

        expect(state?.isOpen).toBe(false);
        expect(state?.summary).toBeUndefined();
        await settle(() => expect(state?.summary).toBeDefined()); // the new item's own fetch lands

        // Regression (found in browser): navigating BACK to the item whose dialog was
        // open must not reopen it — a lingering `dialogFor` would match the key again.
        rerenderWith(attribute, target);
        expect(state?.isOpen).toBe(false);
    });

    it("scopes the session to the workspace, not just the item id", async () => {
        const backend = makeBackend(vi.fn(async () => ({ grants: [USER_GRANT] })));
        let state: ReturnType<typeof useCatalogItemShareState> | undefined;
        let open: () => void = () => {};
        function Probe() {
            state = useCatalogItemShareState();
            open = useCatalogItemShareActions().open;
            return null;
        }
        const tree = (ws: string) => (
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace={ws}>
                    <CatalogItemShareProvider shareableItem={attribute} target={target} labels={NO_LABELS}>
                        <Probe />
                    </CatalogItemShareProvider>
                </WorkspaceProvider>
            </BackendProvider>
        );
        const { rerender } = render(tree("ws-a"));
        await settle(() => expect(state?.summary).toBeDefined());
        act(() => open());
        expect(state?.isOpen).toBe(true);

        // The SAME item identifier under another workspace is a different access
        // scope: ws-a's summary and open dialog must not survive into ws-b.
        rerender(tree("ws-b"));
        expect(state?.isOpen).toBe(false);
        expect(state?.summary).toBeUndefined();
        await settle(() => expect(state?.summary).toBeDefined()); // ws-b's own fetch
    });

    it("scopes the session to the backend instance, not just the item key", async () => {
        const backendA = makeBackend(vi.fn(async () => ({ grants: [USER_GRANT] })));
        const backendB = makeBackend(vi.fn(async () => ({ grants: [USER_GRANT] })));
        let state: ReturnType<typeof useCatalogItemShareState> | undefined;
        let open: () => void = () => {};
        function Probe() {
            state = useCatalogItemShareState();
            open = useCatalogItemShareActions().open;
            return null;
        }
        const tree = (backend: IAnalyticalBackend) => (
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace="ws">
                    <CatalogItemShareProvider shareableItem={attribute} target={target} labels={NO_LABELS}>
                        <Probe />
                    </CatalogItemShareProvider>
                </WorkspaceProvider>
            </BackendProvider>
        );
        const { rerender } = render(tree(backendA));
        await settle(() => expect(state?.summary).toBeDefined());
        act(() => open());
        expect(state?.isOpen).toBe(true);

        // The same item under another backend is a different access scope: the old
        // summary must not survive, and closing unmounts the open dialog session.
        rerender(tree(backendB));
        expect(state?.isOpen).toBe(false);
        expect(state?.summary).toBeUndefined();
        await settle(() => expect(state?.summary).toBeDefined()); // backend B's own fetch
    });

    it("re-renders state consumers on an open/close tick but not actions-only consumers", async () => {
        const backend = makeBackend(vi.fn(async () => ({ grants: [] })));
        const stateRenders = vi.fn();
        const actionsRenders = vi.fn();
        let open: () => void = () => {};
        let summaryDefined = false;

        function StateConsumer() {
            summaryDefined = useCatalogItemShareState().summary !== undefined;
            stateRenders();
            return null;
        }
        function ActionsConsumer() {
            open = useCatalogItemShareActions().open;
            actionsRenders();
            return null;
        }

        renderProvider(
            backend,
            <>
                <StateConsumer />
                <ActionsConsumer />
            </>,
        );
        await settle(() => expect(summaryDefined).toBe(true));
        const stateRendersBefore = stateRenders.mock.calls.length;
        const actionsRendersBefore = actionsRenders.mock.calls.length;

        // Opening the dialog flips isOpen — a state change. The state consumer must
        // re-render; the actions consumer must NOT (its context value is stable).
        act(() => open());

        expect(stateRenders.mock.calls.length).toBe(stateRendersBefore + 1);
        expect(actionsRenders.mock.calls.length).toBe(actionsRendersBefore);
    });

    it("reports inactive when the item is not shareable", () => {
        const getAccessList = vi.fn(async () => ({ grants: [] }));
        const backend = makeBackend(getAccessList);
        let active = true;
        function Probe() {
            active = useCatalogItemShareState().active;
            return null;
        }

        // Rendered directly — the helper defaults an omitted item to a shareable one.
        render(
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace="ws">
                    <CatalogItemShareProvider shareableItem={undefined} target={undefined} labels={NO_LABELS}>
                        <Probe />
                    </CatalogItemShareProvider>
                </WorkspaceProvider>
            </BackendProvider>,
        );

        expect(active).toBe(false);
        expect(getAccessList).not.toHaveBeenCalled(); // no target — nothing to fetch
    });

    it("reports inactive for a shareable item when access is unavailable (404)", async () => {
        // A view/analyze-only user gets a 404 on the manage-gated permissions
        // endpoint. The share UI (Share button + inline access row) must then hide.
        const backend = makeBackend(vi.fn(async () => Promise.reject(notFound())));
        let stateActive = true;
        let actionsActive = true;
        function Probe() {
            stateActive = useCatalogItemShareState().active;
            actionsActive = useCatalogItemShareActions().active;
            return null;
        }

        renderProvider(backend, <Probe />);

        await settle(() => expect(stateActive).toBe(false));
        expect(actionsActive).toBe(false);
    });

    it("stays active and reports summaryError on a transient load error", async () => {
        // A transient failure does not set accessUnavailable, so the share UI must
        // not be stripped — but the settled failure must surface as `summaryError`,
        // or the access row would render its loading skeleton forever (there is no
        // retry; opening the dialog fetches again and fills the summary in).
        const backend = makeBackend(
            vi.fn(async () => Promise.reject(new UnexpectedResponseError("Boom", 500, {}))),
        );
        let state: ReturnType<typeof useCatalogItemShareState> | undefined;
        function Probe() {
            state = useCatalogItemShareState();
            return null;
        }

        renderProvider(backend, <Probe />);

        await settle(() => expect(state?.summaryError).toBe(true));
        expect(state?.active).toBe(true);
        expect(state?.summary).toBeUndefined();
    });

    it("renders the access-row error as an alert so screen readers announce it", async () => {
        const backend = makeBackend(
            vi.fn(async () => Promise.reject(new UnexpectedResponseError("Boom", 500, {}))),
        );
        render(
            <TestIntlProvider>
                <BackendProvider backend={backend}>
                    <WorkspaceProvider workspace="ws">
                        <CatalogItemShareProvider
                            shareableItem={attribute}
                            target={target}
                            labels={NO_LABELS}
                        >
                            <CatalogItemAccessRow />
                        </CatalogItemShareProvider>
                    </WorkspaceProvider>
                </BackendProvider>
            </TestIntlProvider>,
        );

        expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load access.");
    });
});
