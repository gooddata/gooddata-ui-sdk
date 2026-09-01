// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { type IWorkspaceUser } from "@gooddata/sdk-model";
import {
    type GoodDataSdkError,
    convertError,
    useBackendStrict,
    useCancelablePromise,
    useDebouncedState,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";

const USERS_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE = 300;

/**
 * What {@link useWorkspaceUsersSearch} returns.
 *
 * @alpha
 */
export interface IUseWorkspaceUsersSearchResult {
    /**
     * The current, not yet debounced, search string.
     */
    search: string;
    /**
     * The workspace users of the last settled query; undefined until the first query settles.
     */
    users: IWorkspaceUser[] | undefined;
    /**
     * The last query's error, if it failed.
     */
    usersError: GoodDataSdkError | undefined;
    /**
     * True while the search debounce window or a query is open.
     */
    isLoading: boolean;
    /**
     * Sets the search string; the query fires after a 300 ms debounce.
     */
    onSearch: (search: string) => void;
    /**
     * Starts the first fetch — nothing loads on mount until this is called (wire it to the
     * control's open/focus). After an error it doubles as retry.
     */
    onActivate: () => void;
}

/**
 * Debounced workspace-user search for a recipients control.
 *
 * Queries the first 50 matching workspace users, 300 ms debounced, lazily: no request is made
 * until {@link IUseWorkspaceUsersSearchResult.onActivate} is called. Requires only the ambient
 * `BackendProvider` and `WorkspaceProvider` from `@gooddata/sdk-ui` — it reads no automation
 * context, so a custom recipients control can call it anywhere inside a `Dashboard` (or any
 * backend/workspace scope). The default recipients select of both automation dialogs is built
 * on it. Pass `enabled: false` to keep it inert (the default select does so when an external
 * recipient override or a logged-user-only constraint removes server search).
 *
 * @alpha
 */
export function useWorkspaceUsersSearch({ enabled }: { enabled: boolean }): IUseWorkspaceUsersSearchResult {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const [search, setSearch, debouncedSearch] = useDebouncedState("", SEARCH_DEBOUNCE);
    const [active, setActive] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const {
        result: users,
        error,
        status,
    } = useCancelablePromise<IWorkspaceUser[]>(
        {
            promise:
                !enabled || !active
                    ? null
                    : async () => {
                          const page = await backend
                              .workspace(workspace)
                              .users()
                              .withOptions({
                                  search: debouncedSearch || undefined,
                                  limit: USERS_PAGE_SIZE,
                              })
                              .query();
                          return page.items;
                      },
        },
        [backend, workspace, debouncedSearch, retryCount, enabled, active],
    );

    const handleActivate = useCallback(() => {
        setActive(true);
        if (error) {
            setRetryCount((current) => current + 1);
        }
    }, [error]);

    const usersError = useMemo(() => (error === undefined ? undefined : convertError(error)), [error]);

    // The debounce window counts as loading
    const isDebouncing = enabled && search !== debouncedSearch;

    return {
        users,
        isLoading: isDebouncing || status === "loading",
        usersError,
        search,
        onSearch: setSearch,
        onActivate: handleActivate,
    };
}
