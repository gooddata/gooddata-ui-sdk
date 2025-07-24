// (C) 2024-2025 GoodData Corporation
import * as React from "react";
import classnames from "classnames";
import { FormattedMessage, injectIntl, WrappedComponentProps } from "react-intl";
import { GenAIObjectType, ISemanticSearchRelationship, ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    Input,
    IUiListboxInteractiveItem,
    LoadingMask,
    Message,
    useDebouncedState,
    useHeaderSearch,
} from "@gooddata/sdk-ui-kit";
import { useWorkspaceStrict, useLocalStorage } from "@gooddata/sdk-ui";

import { useSemanticSearch, useElementWidth } from "../hooks/index.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";
import { buildSearchList } from "../utils/search.js";
import { ListItem } from "../types.js";

import { SearchList } from "./SearchList.js";
import { HistoryItem } from "./HistoryItem.js";
import { AnnotatedResultsItem } from "./AnnotatedResultsItem.js";
import { MetadataTimezoneProvider } from "./metadataTimezoneContext.js";

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
 * Default limit of search results.
 */
const LIMIT = 10;
/**
 * A threshold for search results to be shown to user.
 */
const THRESHOLD = 0.5;

export type SearchOnSelect = {
    item: ISemanticSearchResultItem | ISemanticSearchRelationship;
    index: number;
    preventDefault: () => void;
    itemUrl?: string;
    newTab?: boolean;
};

/**
 * Props for the SemanticSearchOverlay component.
 * @internal
 */
export type SearchOverlayProps = {
    /**
     * A function called when the user selects an item from the search results.
     */
    onSelect: (selection: SearchOnSelect) => void;
    /**
     * A function called when the search request is completed.
     */
    onSearch?: (
        query: string,
        searchResults?: ListItem<ISemanticSearchResultItem, ISemanticSearchRelationship>[],
    ) => void;
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
    objectTypes?: GenAIObjectType[];
    /**
     * A flag to enable deep search, i.e. search dashboard by their contents.
     */
    deepSearch?: boolean;
    /**
     * A limit of search results to return.
     */
    limit?: number;
    /**
     * A minimum similarity score for search result to be shown to user.
     */
    threshold?: number;
    /**
     * Additional CSS class for the component.
     */
    className?: string;
    /**
     * Locale to use for translations.
     */
    locale?: string;
    /**
     * Timezone in which metadata created and updated dates are saved.
     */
    metadataTimezone?: string;
    /**
     * A function to render the footer of the search overlay.
     */
    renderFooter?: (
        props: SearchOverlayProps & { status: "idle" | "loading" | "error" | "success"; value: string },
        handlers: {
            closeSearch: () => void;
        },
    ) => React.ReactNode;
};

/**
 * Core implementation of the SemanticSearchOverlay component.
 */
const SearchOverlayCore: React.FC<
    WrappedComponentProps & Omit<SearchOverlayProps, "locale" | "metadataTimezone">
> = (props) => {
    const {
        onSelect,
        onSearch,
        backend,
        workspace,
        objectTypes,
        deepSearch,
        limit = LIMIT,
        className,
        intl,
        threshold = THRESHOLD,
        renderFooter,
    } = props;
    const { toggleOpen } = useHeaderSearch();

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
    const searchResultsItems = React.useMemo(
        () => buildSearchList(effectiveWorkspace, searchResults, relationships, threshold),
        [searchResults, effectiveWorkspace, relationships, threshold],
    );

    // Report metrics
    React.useEffect(() => {
        onSearch?.(
            searchTerm,
            searchResultsItems.map((item) => item.data),
        );
        // I don't want to report on search string change, only on results
        // But I do need searchTerm, it will update with results anyway
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onSearch, searchResultsItems]);

    // Search history
    const [searchHistory, setSearchHistory] = useLocalStorage(SEARCH_HISTORY_KEY, SEARCH_HISTORY_EMPTY);
    const onResultSelect = React.useCallback(
        (
            item:
                | ListItem<ISemanticSearchResultItem, ISemanticSearchRelationship>
                | ListItem<ISemanticSearchRelationship, undefined>,
            mods: { newTab?: boolean; type?: "mouse" | "keyboard" } = {},
        ) => {
            setSearchHistory(
                [...new Set([searchTerm, ...searchHistory])].slice(0, MAX_SEARCH_HISTORY_LENGTH),
            );

            let defaultPrevented = false;
            const preventDefault = () => {
                defaultPrevented = true;
            };

            // Call the onSelect callback
            onSelect({
                item: item.item,
                index: searchResultsItems.findIndex((i) => i.data === item),
                preventDefault: preventDefault,
                itemUrl: item.url,
                newTab: mods.newTab,
            });

            // If the default was not prevented - simulate browser navigation for keyboard event
            if (item.url && !defaultPrevented && mods.type === "keyboard") {
                if (mods.newTab) {
                    window.open(item.url, "_blank");
                } else {
                    window.location.href = item.url;
                }
            }

            // Trigger the dialog closing unless it's opening in a new tab
            if (!mods.newTab) {
                toggleOpen();
            }
        },
        [searchTerm, searchHistory, onSelect, setSearchHistory, toggleOpen, searchResultsItems],
    );
    const onHistorySelect = (item: ListItem<string, undefined> | ListItem<undefined, undefined>) =>
        setImmediate(item.item ?? "");
    const searchHistoryItems: IUiListboxInteractiveItem<ListItem<string, undefined>>[] = React.useMemo(
        () =>
            searchHistory.map((data) => ({
                type: "interactive",
                id: data,
                stringTitle: data,
                data: {
                    item: data,
                },
            })),
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

    const onEscKeyPress = React.useCallback(
        (e: React.KeyboardEvent) => {
            if (value.length > 0) {
                e.stopPropagation();
            }
        },
        [value],
    );

    const Wrapper = ({
        children,
        status,
    }: {
        children: React.ReactNode;
        status: "idle" | "loading" | "error" | "success";
    }) => {
        const comp = renderFooter?.(
            { ...props, status, value },
            {
                closeSearch: toggleOpen,
            },
        );
        if (comp) {
            return (
                <div>
                    {children}
                    {comp}
                </div>
            );
        }
        return <>{children}</>;
    };

    return (
        <div ref={ref} className={classnames("gd-semantic-search__overlay", className)}>
            <Input
                className="gd-semantic-search__overlay-input"
                autofocus
                placeholder={intl.formatMessage({ id: "semantic-search.placeholder" })}
                accessibilityConfig={{
                    ariaLabel: intl.formatMessage({ id: "semantic-search.label" }),
                }}
                isSearch
                clearOnEsc
                value={value}
                onChange={(e) => setValue(String(e))}
                onEscKeyPress={onEscKeyPress}
            />
            {(() => {
                switch (searchStatus) {
                    case "loading":
                        return (
                            <Wrapper status={searchStatus}>
                                <LoadingMask height={LOADING_HEIGHT} />
                            </Wrapper>
                        );
                    case "error":
                        return (
                            <Wrapper status={searchStatus}>
                                <div className="gd-semantic-search__overlay-error">
                                    <Message type="error">
                                        <FormattedMessage tagName="strong" id="semantic-search.error.title" />{" "}
                                        <FormattedMessage id="semantic-search.error.text" />
                                    </Message>
                                </div>
                            </Wrapper>
                        );
                    case "success":
                        if (!searchResults.length) {
                            return (
                                <Wrapper status={searchStatus}>
                                    <div className="gd-semantic-search__overlay-no-results">
                                        <FormattedMessage
                                            id="semantic-search.no-results"
                                            values={{ query: searchTerm }}
                                        />
                                    </div>
                                </Wrapper>
                            );
                        }

                        return (
                            <Wrapper status={searchStatus}>
                                <SearchList
                                    items={searchResultsItems}
                                    width={width}
                                    onSelect={onResultSelect}
                                    ItemComponent={AnnotatedResultsItem}
                                />
                            </Wrapper>
                        );
                    case "idle":
                        if (searchHistoryItems.length) {
                            return (
                                <Wrapper status={searchStatus}>
                                    <SearchList
                                        items={searchHistoryItems}
                                        width={width}
                                        onSelect={onHistorySelect}
                                        ItemComponent={HistoryItem}
                                    />
                                </Wrapper>
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

/**
 * Inject `intl` prop to the component.
 */
const SearchOverlayWithIntl = injectIntl(SearchOverlayCore);

/**
 * A component that allows users to search for insights, metrics, attributes, and other objects using semantic search.
 * The internal version is meant to be used in an overlay inside the Header.
 * @internal
 */
export const SearchOverlay: React.FC<SearchOverlayProps> = ({ locale, metadataTimezone, ...props }) => {
    return (
        <MetadataTimezoneProvider value={metadataTimezone}>
            <IntlWrapper locale={locale}>
                <SearchOverlayWithIntl {...props} />
            </IntlWrapper>
        </MetadataTimezoneProvider>
    );
};
