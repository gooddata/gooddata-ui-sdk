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

export function useWorkspaceUsersSearch({ enabled }: { enabled: boolean }): {
    search: string;
    users: IWorkspaceUser[] | undefined;
    usersError: GoodDataSdkError | undefined;
    isLoading: boolean;
    onSearch: (search: string) => void;
    onActivate: () => void;
} {
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
