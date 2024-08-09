// (C) 2024 GoodData Corporation
import * as React from "react";
import classnames from "classnames";
import { FormattedMessage, WrappedComponentProps } from "react-intl";
import { GenAISemanticSearchType, ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { Input, LoadingMask, Message, useDebouncedState } from "@gooddata/sdk-ui-kit";
import { useWorkspaceStrict, useLocalStorage } from "@gooddata/sdk-ui";
import { useSemanticSearch, useElementWidth } from "../hooks/index.js";
import { ListItem } from "../types.js";
import { getUIPath } from "../utils/getUIPath.js";
import { SearchList } from "./SearchList.js";
import { HistoryItem } from "./HistoryItem.js";
import { AnnotatedResultsItem } from "./AnnotatedResultsItem.js";

/**
 * A time in milliseconds to wait before sending a search request after the user stops typing.
 */
const DEBOUNCE = 300;
/**
 * A height of the loading mask.
 */
const LOADING_HEIGHT = 100;
/**
 * Max search history length.
 */
const MAX_SEARCH_HISTORY_LENGTH = 5;
/**
 * A key for the search history in the local storage.
 */
const SEARCH_HISTORY_KEY = "gd-semantic-search-history";
/**
 * An initial value for the search history.
 */
const SEARCH_HISTORY_EMPTY: string[] = [];

/**
 * Props for the SemanticSearchOverlay component.
 * @internal
 */
export type SearchOverlayProps = WrappedComponentProps & {
    /**
     * A function called when the user selects an item from the search results.
     */
    onSelect: (item: ISemanticSearchResultItem, e: MouseEvent | KeyboardEvent, itemUrl?: string) => void;
    /**
     * An analytical backend to use for the search. Can be omitted and taken from context.
     */
    backend?: IAnalyticalBackend;
    /**
     * A workspace to search in. Can be omitted and taken from context.
     */
    workspace?: string;
    /**
     * A list of object types to search for.
     */
    objectTypes?: GenAISemanticSearchType[];
    /**
     * A flag to enable deep search, i.e. search dashboard by their contents.
     */
    deepSearch?: boolean;
    /**
     * A limit of search results to return.
     */
    limit?: number;
    /**
     * Additional CSS class for the component.
     */
    className?: string;
};

/**
 * A component that allows users to search for insights, metrics, attributes, and other objects using semantic search.
 * The internal version is meant to be used in an overlay inside the Header.
 * @internal
 */
export const SearchOverlay: React.FC<SearchOverlayProps> = ({
    onSelect,
    backend,
    workspace,
    objectTypes,
    deepSearch,
    limit = 6,
    className,
    intl,
}) => {
    // Input value handling
    const [value, setValue, searchTerm, setImmediate] = useDebouncedState("", DEBOUNCE);

    // Search results
    const effectiveWorkspace = useWorkspaceStrict(workspace);
    const { searchStatus, searchResults, searchError, relationships } = useSemanticSearch({
        backend,
        workspace: effectiveWorkspace,
        searchTerm,
        objectTypes,
        deepSearch,
        limit,
    });

    // Results wrapped into ListItems
    const searchResultsItems: ListItem<ISemanticSearchResultItem>[] = React.useMemo(
        (): ListItem<ISemanticSearchResultItem>[] =>
            searchResults.flatMap((item) => {
                // Look up parent items if available
                const parentDashboards = relationships.filter(
                    (rel) =>
                        rel.targetObjectId === item.id &&
                        rel.targetObjectType === item.type &&
                        rel.sourceObjectType === "dashboard",
                );

                if (!parentDashboards.length)
                    return {
                        item,
                        url: getUIPath(item.type, item.id, effectiveWorkspace),
                    };

                return parentDashboards.map((parent) => ({
                    item,
                    parentRef: parent,
                    url: getUIPath(parent.sourceObjectType, parent.sourceObjectId, effectiveWorkspace),
                }));
            }),
        [searchResults, effectiveWorkspace, relationships],
    );

    // Search history
    const [searchHistory, setSearchHistory] = useLocalStorage(SEARCH_HISTORY_KEY, SEARCH_HISTORY_EMPTY);
    const onResultSelect = React.useCallback(
        (item: ListItem<ISemanticSearchResultItem>, e: MouseEvent | KeyboardEvent) => {
            setSearchHistory(
                [...new Set([searchTerm, ...searchHistory])].slice(0, MAX_SEARCH_HISTORY_LENGTH),
            );

            // Simulate browser behaviour - if user presses Ctrl or Cmd and clicks on the result, open it in a new tab
            if (item.url && (e.ctrlKey || e.metaKey)) {
                // Keyboard events do not navigate to the URL natively by the browser, do it artificially
                if (e instanceof KeyboardEvent) {
                    window.open(item.url, "_blank");
                }
                return;
            }

            // Call the onSelect callback
            onSelect(item.item, e, item.url);

            // If the default was not prevented - simulate browser navigation
            if (item.url && e instanceof KeyboardEvent && !e.defaultPrevented) {
                window.location.href = item.url;
            }
        },
        [searchTerm, searchHistory, onSelect, setSearchHistory],
    );
    const onHistorySelect = (item: ListItem<string>) => setImmediate(item.item);
    const searchHistoryItems: ListItem<string>[] = React.useMemo(
        () => searchHistory.map((item) => ({ item })),
        [searchHistory],
    );

    React.useEffect(() => {
        if (searchStatus === "error") {
            // Report error to the console
            // UI will display a generic error message
            console.error(searchError);
        }
    }, [searchStatus, searchError]);

    // The List component requires explicit width
    const [ref, width] = useElementWidth();

    return (
        <div ref={ref} className={classnames("gd-semantic-search__overlay", className)}>
            <Input
                className="gd-semantic-search__overlay-input"
                autofocus
                placeholder={intl.formatMessage({ id: "semantic-search.placeholder" })}
                isSearch
                clearOnEsc
                value={value}
                onChange={(e) => setValue(String(e))}
            />
            {(() => {
                switch (searchStatus) {
                    case "loading":
                        return <LoadingMask height={LOADING_HEIGHT} />;
                    case "error":
                        return (
                            <div className="gd-semantic-search__overlay-error">
                                <Message type="error">
                                    <FormattedMessage tagName="strong" id="semantic-search.error.title" />{" "}
                                    <FormattedMessage id="semantic-search.error.text" />
                                </Message>
                            </div>
                        );
                    case "success":
                        if (!searchResults.length) {
                            return (
                                <div className="gd-semantic-search__overlay-no-results">
                                    <FormattedMessage
                                        id="semantic-search.no-results"
                                        values={{ query: searchTerm }}
                                    />
                                </div>
                            );
                        }

                        return (
                            <SearchList
                                items={searchResultsItems}
                                width={width}
                                onSelect={onResultSelect}
                                ItemComponent={AnnotatedResultsItem}
                            />
                        );
                    case "idle":
                        if (searchHistoryItems.length) {
                            return (
                                <SearchList
                                    items={searchHistoryItems}
                                    width={width}
                                    onSelect={onHistorySelect}
                                    ItemComponent={HistoryItem}
                                />
                            );
                        }
                    // fallthrough
                    default:
                        return null;
                }
            })()}
        </div>
    );
};
