// (C) 2026 GoodData Corporation

import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";

import type { IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import { type IObjectShareController, useObjectShare } from "@gooddata/sdk-ui-ext";

import type { ShareableCatalogItem } from "./types.js";
import type { IShareableLabels } from "./useShareableLabels.js";

/**
 * Live share state for the catalog item. Consumed by the inline access row and the
 * share dialog, which re-render as the controller's state changes. `active` is false
 * when the item can't be shared (flag off / not a shareable kind), so consumers can
 * render nothing without conditional hooks.
 */
interface ICatalogItemShareState {
    active: boolean;
    controller: IObjectShareController | undefined;
    target: IObjectPermissionsObject | undefined;
    objectTitle: string;
    /** Whether the share dialog is open. */
    isOpen: boolean;
    /** Whether the item's labels are still loading (passed to the dialog). */
    labelsLoading: boolean;
}

/**
 * Stable open/close actions for the share dialog. Split from the state so an
 * actions-only consumer (the Share button) never re-renders on a state tick.
 */
interface ICatalogItemShareActions {
    active: boolean;
    open: () => void;
    close: () => void;
}

const INACTIVE_STATE: ICatalogItemShareState = {
    active: false,
    controller: undefined,
    target: undefined,
    objectTitle: "",
    isOpen: false,
    labelsLoading: false,
};

const noop = () => {};
const INACTIVE_ACTIONS: ICatalogItemShareActions = { active: false, open: noop, close: noop };

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
 * Owns the share controller, its single access-list fetch and the dialog open
 * state for one catalog item, and exposes them through two contexts (state +
 * actions). Because it renders `children` and the live state is read only by the
 * leaf components that need it (access row, dialog), the surrounding detail
 * subtree — header, tabs, status — does not re-render as access is edited.
 *
 * No-ops cleanly when the item can't be shared: the contexts then carry an
 * inactive value and the hooks below report `active: false`.
 *
 * @internal
 */
export function CatalogItemShareProvider({
    shareableItem,
    target,
    labels,
    children,
}: ICatalogItemShareProviderProps) {
    // One controller drives both the dialog and the inline access row; the row reads
    // `state.summary`, so a save inside the dialog refreshes it too. labelsLoading/
    // labelsError keep the controller label-unresolved while labels are pending.
    const controller = useObjectShare(target, {
        labels: labels.labels,
        labelsError: labels.error,
        labelsLoading: labels.loading,
    });

    const [isOpen, setIsOpen] = useState(false);
    // The detail view is reused as the user navigates between objects, so close an
    // open dialog when the shareable target changes (or becomes non-shareable) —
    // otherwise it would linger open on the next object. Reset during render (React's
    // "adjust state on prop change" idiom) rather than in an effect.
    const targetKey = shareableItem?.identifier;
    const [openForKey, setOpenForKey] = useState<string | undefined>(undefined);
    if (isOpen && openForKey !== targetKey) {
        setIsOpen(false);
    }
    const open = useCallback(() => {
        setOpenForKey(targetKey);
        setIsOpen(true);
    }, [targetKey]);
    const close = useCallback(() => setIsOpen(false), []);

    // Sharing is offered only while the access list is reachable. The permissions
    // endpoint is manage-gated, so a user who can only view/analyze the object gets
    // a 404 (surfaced as `accessUnavailable`); we then hide both the Share button and
    // the inline access row — there is nothing they can act on, and the row would
    // otherwise load forever. A transient load error does not set the flag, so a flaky
    // fetch doesn't strip the UI. The access list loads optimistically, so the row and
    // button show until the 404 lands, then disappear.
    const active = Boolean(shareableItem) && !controller.state.accessUnavailable;

    const state = useMemo<ICatalogItemShareState>(
        () =>
            active && shareableItem
                ? {
                      active: true,
                      controller,
                      target,
                      objectTitle: shareableItem.title,
                      isOpen,
                      labelsLoading: labels.loading,
                  }
                : INACTIVE_STATE,
        [active, shareableItem, controller, target, isOpen, labels.loading],
    );

    const actions = useMemo<ICatalogItemShareActions>(
        () => (active ? { active: true, open, close } : INACTIVE_ACTIONS),
        [active, open, close],
    );

    return (
        <ShareActionsContext.Provider value={actions}>
            <ShareStateContext.Provider value={state}>{children}</ShareStateContext.Provider>
        </ShareActionsContext.Provider>
    );
}

/**
 * Live share state (controller, summary, open flag) for the current catalog item.
 * Reports `active: false` when sharing is unavailable.
 *
 * @internal
 */
export function useCatalogItemShareState(): ICatalogItemShareState {
    return useContext(ShareStateContext);
}

/**
 * Stable share actions (open/close the dialog) for the current catalog item.
 * Reading this instead of the state keeps a consumer from re-rendering on state ticks.
 *
 * @internal
 */
export function useCatalogItemShareActions(): ICatalogItemShareActions {
    return useContext(ShareActionsContext);
}
