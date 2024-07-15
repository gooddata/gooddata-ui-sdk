// (C) 2024 GoodData Corporation

import { useState, useEffect } from "react";
import { ISemanticSearchResultItem, GenAISemanticSearchType } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

/**
 * The result of the semantic search hook.
 * @alpha
 */
export type SemanticSearchInputResult = {
    /**
     * Flag indicating whether the search is in progress.
     */
    searchLoading: boolean;
    /**
     * Error message if the search failed.
     */
    searchError: string;
    /**
     * The search results.
     */
    searchResults: ISemanticSearchResultItem[];
};

const DEFAULT_STATE: SemanticSearchInputResult = {
    searchLoading: false,
    searchError: "",
    searchResults: [],
};

/**
 * Hook to perform semantic search.
 * Makes the request to server and returns the search results.
 * The request is cancellable and auto-updates when the search term changes.
 * @alpha
 */
export const useSemanticSearch = (
    searchTerm: string,
    objectTypes: GenAISemanticSearchType[] = [],
    deepSearch?: boolean,
    limit?: number,
): SemanticSearchInputResult => {
    const [state, setState] = useState<SemanticSearchInputResult>(DEFAULT_STATE);
    const effectiveBackend = useBackendStrict();
    const effectiveWorkspace = useWorkspaceStrict();

    useEffect(() => {
        if (searchTerm === "") {
            setState(DEFAULT_STATE);
            return;
        }

        setState((oldState) => ({
            // Keep the previous state of results/error, only update the loading flag
            ...oldState,
            searchLoading: true,
        }));

        // Construct the query
        let qb = effectiveBackend
            .workspace(effectiveWorkspace)
            .genAI()
            .getSemanticSearchQuery()
            .withQuestion(searchTerm);
        if (objectTypes) {
            qb = qb.withObjectTypes(objectTypes);
        }
        if (deepSearch) {
            qb = qb.withDeepSearch(deepSearch);
        }
        if (limit) {
            qb = qb.withLimit(limit);
        }

        // Execute the query
        const searchController = new AbortController();
        qb.query({
            signal: searchController.signal,
        })
            .then((res) => {
                setState({
                    searchLoading: false,
                    searchError: "",
                    searchResults: res.results,
                });
            })
            .catch((e) => {
                if (searchController.signal.aborted)
                    // Ignore Aborted error
                    return;

                setState({
                    searchLoading: false,
                    searchError: errorMessage(e),
                    searchResults: [],
                });
            });

        return () => {
            searchController.abort();
        };
    }, [searchTerm, ...objectTypes, deepSearch, limit]);

    return state;
};

const errorMessage = (e: unknown) => {
    if (e instanceof Error) {
        return e.message;
    }
    return String(e);
};
