// (C) 2026 GoodData Corporation

import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import type { IObjectAccessList } from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import {
    type IObjectAccessSummary,
    accessListToSummary,
    isPermissionsNotAvailable,
} from "@gooddata/sdk-ui-ext";

import type { ShareableCatalogItem } from "./types.js";
import type { IShareableLabels } from "./useShareableLabels.js";

/**
 * Page-level share state for the catalog item: the latest known access summary and
 * the dialog-open flag. `active` is false when the item can't be shared (flag off /
 * not a shareable kind / permissions unavailable), so consumers can render nothing
 * without conditional hooks.
 */
interface ICatalogItemShareState {
    active: boolean;
    /**
     * Latest known access summary — seeded by the page-level fetch, then kept in
     * sync by the open dialog's `onSummaryChange`. Undefined while loading.
     */
    summary: IObjectAccessSummary | undefined;
    /**
     * Whether the page-level summary fetch failed transiently (a definitive
     * not-permissionable failure turns the whole feature inactive instead).
     * Sharing stays offered — opening the dialog runs its own fetch, whose
     * `onSummaryChange` report then fills the summary in.
     */
    summaryError: boolean;
    target: IObjectPermissionsObject | undefined;
    objectTitle: string;
    /** Whether the share dialog is open (and should be mounted). */
    isOpen: boolean;
    /** The item's labels bundle, forwarded to the dialog. */
    labels: IShareableLabels;
}

/**
 * Stable share actions. Split from the state so an actions-only consumer (the
 * Share button) never re-renders on a state tick.
 */
interface ICatalogItemShareActions {
    active: boolean;
    open: () => void;
    close: () => void;
    /** The dialog reports summary changes here, keeping the inline row in sync without refetching. */
    onSummaryChange: (summary: IObjectAccessSummary) => void;
}

const NO_LABELS: IShareableLabels = { labels: [], loading: false, error: false };

const INACTIVE_STATE: ICatalogItemShareState = {
    active: false,
    summary: undefined,
    summaryError: false,
    target: undefined,
    objectTitle: "",
    isOpen: false,
    labels: NO_LABELS,
};

const noop = () => {};
const INACTIVE_ACTIONS: ICatalogItemShareActions = {
    active: false,
    open: noop,
    close: noop,
    onSummaryChange: noop,
};

const ShareStateContext = createContext<ICatalogItemShareState>(INACTIVE_STATE);
const ShareActionsContext = createContext<ICatalogItemShareActions>(INACTIVE_ACTIONS);

/**
 * @internal
 */
export interface ICatalogItemShareProviderProps {
    /** The shareable item, or undefined when sharing is unavailable (flag off / not shareable). */
    shareableItem: ShareableCatalogItem | undefined;
    /** Backend share target for {@link shareableItem}. */
    target: IObjectPermissionsObject | undefined;
    /** Labels of the shared attribute (already fetched by the parent, reused here). */
    labels: IShareableLabels;
    children: ReactNode;
}

/**
 * Owns the PAGE state of sharing for one catalog item: the initial access-summary
 * fetch (the inline access row is visible before the dialog ever opens, so the page
 * fetches its own summary) and the dialog-open flag. The dialog itself is a separate,
 * session-scoped component — mounted only while open, owning its own controller and
 * fetch — that reports summary changes back through `onSummaryChange`, so the row
 * stays in sync with edits without a refetch.
 *
 * No-ops cleanly when the item can't be shared: the contexts then carry an inactive
 * value and the hooks below report `active: false`.
 *
 * @internal
 */
export function CatalogItemShareProvider({
    shareableItem,
    target,
    labels,
    children,
}: ICatalogItemShareProviderProps) {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    // The page-session boundary: everything below (summary, open flag, the fetch) is
    // scoped to this key. Workspace and kind are part of it — the same identifier can
    // reappear under another workspace (or as another object kind), and the previous
    // summary/dialog must not survive into it.
    const itemKey = shareableItem
        ? `${workspace}:${shareableItem.type}:${shareableItem.identifier}`
        : undefined;

    const [summary, setSummary] = useState<IObjectAccessSummary | undefined>(undefined);
    // Which item's dialog is open. Navigating to another item changes `itemKey`, so
    // `isOpen` turns false and the dialog unmounts.
    const [dialogFor, setDialogFor] = useState<string | undefined>(undefined);

    // Both the summary and the open flag belong to one item under one backend —
    // drop them when either changes. Item change: the new item shows its loading
    // skeleton instead of the previous item's access, and navigating BACK to an
    // item whose dialog was open must not reopen it (a lingering `dialogFor`
    // would match the returning key). Backend change (compared by reference —
    // an instance has no string identity to fold into `itemKey`): the previous
    // backend's summary must not survive into the new one, and clearing
    // `dialogFor` unmounts the dialog session, discarding its edit overlay and
    // staged state with it.
    const [seenScope, setSeenScope] = useState({ backend, itemKey });
    if (seenScope.backend !== backend || seenScope.itemKey !== itemKey) {
        setSeenScope({ backend, itemKey });
        setSummary(undefined);
        setDialogFor(undefined);
    }

    // The page-level summary fetch runs only while the summary is UNKNOWN: once
    // anything seeds it — this fetch, or the dialog's `onSummaryChange` report (the
    // dialog session fetches on its own) — the promise clears, so an open dialog
    // never runs alongside a page fetch and a close never refetches. The item-change
    // reset above clears the summary, which re-arms the fetch. The `prev ??` seed
    // guard covers the resolve-vs-cancel race.
    const summaryUnknown = summary === undefined;
    const { status, error } = useCancelablePromise<IObjectAccessList, Error>(
        {
            promise:
                target && summaryUnknown
                    ? () => backend.workspace(workspace).objectPermissions().getAccessList(target)
                    : undefined,
            onSuccess: (list) => setSummary((prev) => prev ?? accessListToSummary(list)),
            onError: () => {},
        },
        [backend, workspace, itemKey, summaryUnknown],
    );

    // Sharing is offered only while the access list is reachable. The permissions
    // endpoint is manage-gated, so a user who can only view/analyze the object gets
    // a 404; we then hide both the Share button and the inline access row — there is
    // nothing they can act on. A transient load error does not set the flag, so a
    // flaky fetch doesn't strip the UI — it is reported as `summaryError` instead,
    // so the access row can show an error rather than load forever.
    const accessUnavailable = status === "error" && isPermissionsNotAvailable(error);
    const active = Boolean(shareableItem) && !accessUnavailable;
    const summaryError = status === "error" && !accessUnavailable;
    // Whether the access list has come back at all. Read off the summary rather than
    // the fetch status, which returns to idle once the summary is known (the promise
    // is armed only while it is unknown) and would read as unresolved again. An item
    // change clears the summary, so the next item is unresolved until its own fetch
    // lands.
    const accessResolved = summary !== undefined || status === "error";

    const isOpen = dialogFor !== undefined && dialogFor === itemKey;
    const open = useCallback(() => setDialogFor(itemKey), [itemKey]);
    const close = useCallback(() => setDialogFor(undefined), []);

    const state = useMemo<ICatalogItemShareState>(
        () =>
            active && shareableItem
                ? {
                      active: true,
                      summary,
                      summaryError,
                      target,
                      objectTitle: shareableItem.title,
                      isOpen,
                      labels,
                  }
                : INACTIVE_STATE,
        [active, shareableItem, summary, summaryError, target, isOpen, labels],
    );

    // The Share button waits for the access list; the inline row does not. Sharing is
    // hidden for a caller the manage-gated endpoint 404s, but that verdict only
    // arrives with the response — offering the button optimistically made it appear
    // and then vanish for a view-only user. The row instead shows its skeleton while
    // the fetch is in flight, which is why only the actions gate on resolution.
    // `onSummaryChange` stays live even while sharing is not offered: it is a state
    // channel, not a capability, and an open dialog's report must still win over a
    // page fetch that lands later (the summary is seed-only). Memoized separately so
    // the inactive value keeps one identity across renders.
    const inactiveActions = useMemo<ICatalogItemShareActions>(
        () => ({ ...INACTIVE_ACTIONS, onSummaryChange: setSummary }),
        [],
    );
    const actions = useMemo<ICatalogItemShareActions>(
        () =>
            active && accessResolved
                ? { active: true, open, close, onSummaryChange: setSummary }
                : inactiveActions,
        [active, accessResolved, open, close, inactiveActions],
    );

    return (
        <ShareActionsContext.Provider value={actions}>
            <ShareStateContext.Provider value={state}>{children}</ShareStateContext.Provider>
        </ShareActionsContext.Provider>
    );
}

/**
 * Page share state (summary, open flag, dialog inputs) for the current catalog item.
 * Reports `active: false` when sharing is unavailable.
 *
 * @internal
 */
export function useCatalogItemShareState(): ICatalogItemShareState {
    return useContext(ShareStateContext);
}

/**
 * Stable share actions (open/close the dialog, receive summary updates) for the
 * current catalog item. Reading this instead of the state keeps a consumer from
 * re-rendering on state ticks.
 *
 * @internal
 */
export function useCatalogItemShareActions(): ICatalogItemShareActions {
    return useContext(ShareActionsContext);
}
