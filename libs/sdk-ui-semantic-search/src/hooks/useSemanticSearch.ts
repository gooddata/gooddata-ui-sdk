// (C) 2024-2026 GoodData Corporation

import { useEffect, useState } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type GenAIObjectType,
    type IAllowedRelationshipType,
    type ISemanticSearchRelationship,
    type ISemanticSearchResultItem,
} from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

/**
 * The result of the semantic search hook.
 * @beta
 */
export type SemanticSearchInputResult = {
    /**
     * Flag indicating whether the search is in progress.
     * - idle - means we did not search yet
     * - loading - means we are currently searching
     * - error - means the search failed
     * - success - means the search succeeded
     */
    searchStatus: "idle" | "loading" | "error" | "success";
    /**
     * Error message if the search failed.
     */
    searchError: string;
    /**
     * The message to show to the user that came from the backend.
     */
    searchMessage: string;
    /**
     * The search results.
     */
    searchResults: ISemanticSearchResultItem[];
    relationships: ISemanticSearchRelationship[];
};

/**
 * Default state of the semantic search hook.
 */
const DEFAULT_STATE: SemanticSearchInputResult = {
    searchStatus: "idle",
    searchError: "",
    searchMessage: "",
    searchResults: [],
    relationships: [],
};

/**
 * Input parameters for the semantic search hook.
 * @beta
 */
export type SemanticSearchHookInput = {
    /**
     * The search term.
     */
    searchTerm: string;
    /**
     * The object types to search for.
     */
    objectTypes?: GenAIObjectType[];
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
    /**
     * Filter relationships and results based on allowed relationship type combinations.
     * When specified, only relationships matching the allowed types are returned.
     * If omitted, all relationships and results are returned.
     */
    allowedRelationshipTypes?: IAllowedRelationshipType[];
};

const DEFAULT_OBJECT_TYPES: GenAIObjectType[] = [];

/**
 * Hook to perform semantic search.
 * Makes the request to server and returns the search results.
 * The request is cancellable and auto-updates when the search term changes.
 * @beta
 */
export const useSemanticSearch = ({
    searchTerm,
    objectTypes = DEFAULT_OBJECT_TYPES,
    deepSearch = true,
    limit,
    backend,
    workspace,
    allowedRelationshipTypes,
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
            searchStatus: "loading",
        }));

        // Construct the query
        let qb = effectiveBackend
            .workspace(effectiveWorkspace)
            .genAI()
            .getSemanticSearchQuery()
            .withQuestion(searchTerm)
            .withDeepSearch(deepSearch);
        if (objectTypes.length) {
            qb = qb.withObjectTypes(objectTypes);
        }
        if (limit) {
            qb = qb.withLimit(limit);
        }
        if (allowedRelationshipTypes?.length) {
            qb = qb.withAllowedRelationshipTypes(allowedRelationshipTypes);
        }

        // Execute the query
        const searchController = new AbortController();
        qb.query({
            signal: searchController.signal,
        })
            .then((res) => {
                // Ignore state changes on abort
                if (searchController.signal.aborted) {
                    return;
                }
                setState({
                    searchStatus: "success",
                    searchError: "",
                    searchMessage: res.reasoning ?? "",
                    searchResults: res.results,
                    relationships: res.relationships,
                });
            })
            .catch((e) => {
                // Ignore state changes on abort
                if (searchController.signal.aborted) {
                    return;
                }
                setState({
                    searchStatus: "error",
                    searchError: errorMessage(e),
                    searchMessage: "",
                    searchResults: [],
                    relationships: [],
                });
            });

        return () => {
            searchController.abort();
        };
    }, [
        effectiveBackend,
        effectiveWorkspace,
        searchTerm,
        objectTypes,
        deepSearch,
        limit,
        allowedRelationshipTypes,
    ]);

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
