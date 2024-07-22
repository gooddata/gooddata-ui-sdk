// (C) 2024 GoodData Corporation

import { useState, useEffect } from "react";
import { ISemanticSearchResultItem, GenAISemanticSearchType } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

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

/**
 * Default state of the semantic search hook.
 */
const DEFAULT_STATE: SemanticSearchInputResult = {
    searchLoading: false,
    searchError: "",
    searchResults: [],
};

/**
 * Input parameters for the semantic search hook.
 * @alpha
 */
export type SemanticSearchHookInput = {
    /**
     * The search term.
     */
    searchTerm: string;
    /**
     * The object types to search for.
     */
    objectTypes?: GenAISemanticSearchType[];
    /**
     * Whether to perform deep search.
     * E.g. find dashboard if it contains matching insight.
     */
    deepSearch?: boolean;
    /**
     * The number of results to return.
     */
    limit?: number;
    /**
     * The backend to use for the search.
     * If omitted, will be retrieved from the context.
     */
    backend?: IAnalyticalBackend;
    /**
     * The workspace to use for the search.
     * If omitted, will be retrieved from the context.
     */
    workspace?: string;
};

/**
 * Hook to perform semantic search.
 * Makes the request to server and returns the search results.
 * The request is cancellable and auto-updates when the search term changes.
 * @alpha
 */
export const useSemanticSearch = ({
    searchTerm,
    objectTypes = [],
    deepSearch,
    limit,
    backend,
    workspace,
}: SemanticSearchHookInput): SemanticSearchInputResult => {
    const [state, setState] = useState<SemanticSearchInputResult>(DEFAULT_STATE);
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);

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
        if (objectTypes.length) {
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

/**
 * Retrieve error message from the error object.
 */
const errorMessage = (e: unknown) => {
    if (e instanceof Error) {
        return e.message;
    }
    return String(e);
};
