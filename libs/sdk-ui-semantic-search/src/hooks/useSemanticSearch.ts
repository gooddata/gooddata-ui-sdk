// (C) 2024 GoodData Corporation

import { useState, useEffect } from "react";
import {
    ISemanticSearchResultItem,
    ISemanticSearchResultItemWithUrl,
    GenAISemanticSearchType,
} from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

/**
 * The result of the semantic search hook.
 * @alpha
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
     * The search results.
     */
    searchResults: ISemanticSearchResultItemWithUrl[];
};

/**
 * Default state of the semantic search hook.
 */
const DEFAULT_STATE: SemanticSearchInputResult = {
    searchStatus: "idle",
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

const DEFAULT_OBJECT_TYPES: GenAISemanticSearchType[] = [];

/**
 * Hook to perform semantic search.
 * Makes the request to server and returns the search results.
 * The request is cancellable and auto-updates when the search term changes.
 * @alpha
 */
export const useSemanticSearch = ({
    searchTerm,
    objectTypes = DEFAULT_OBJECT_TYPES,
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
            searchStatus: "loading",
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
                    searchStatus: "success",
                    searchError: "",
                    searchResults: res.results.map(withUrl(effectiveWorkspace)),
                });
            })
            .catch((e) => {
                if (searchController.signal.aborted)
                    // Ignore Aborted error
                    return;

                setState({
                    searchStatus: "error",
                    searchError: errorMessage(e),
                    searchResults: [],
                });
            });

        return () => {
            searchController.abort();
        };
    }, [effectiveBackend, effectiveWorkspace, searchTerm, objectTypes, deepSearch, limit]);

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

/**
 * Enrich the result item with UI URL.
 */
const withUrl =
    (workspaceId: string) =>
    (item: ISemanticSearchResultItem): ISemanticSearchResultItemWithUrl => {
        switch (item.type) {
            case "dashboard":
                return { ...item, url: `/dashboards/#/workspace/${workspaceId}/dashboard/${item.id}` };
            case "visualization":
                return { ...item, url: `/analyze/#/${workspaceId}/${item.id}/edit` };
            case "metric":
                return { ...item, url: `/metrics/#/${workspaceId}/metric/${item.id}` };
            case "dataset":
                return { ...item, url: `/modeler/#/${workspaceId}` }; // TODO - deep links
            case "attribute":
                return { ...item, url: `/modeler/#/${workspaceId}` }; // TODO - deep links
            case "label":
                return { ...item, url: `/modeler/#/${workspaceId}` }; // TODO - deep links
            case "fact":
                return { ...item, url: `/modeler/#/${workspaceId}` }; // TODO - deep links
            case "date":
                return { ...item, url: `/modeler/#/${workspaceId}` }; // TODO - deep links
            default:
                return exhaustiveCheck(item.type);
        }
    };

/**
 * Ensure exhaustive switch to prevent missing cases.
 */
const exhaustiveCheck = (x: never): never => {
    throw new Error(`Unknown item type ${x}`);
};
