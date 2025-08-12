// (C) 2024-2025 GoodData Corporation
import React, { useMemo, useCallback, useEffect, useState, useRef } from "react";
import classnames from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import {
    GenAIObjectType,
    ISemanticSearchResultItem,
    type ISemanticSearchRelationship,
} from "@gooddata/sdk-model";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    Input,
    LoadingMask,
    Message,
    useHeaderSearch,
    UiTreeViewEventsProvider,
    type OnLeveledSelectFn,
    type IAccessibilityConfigBase,
} from "@gooddata/sdk-ui-kit";
import { useWorkspaceStrict, useLocalStorage, useDebouncedState } from "@gooddata/sdk-ui";
import { useSemanticSearch, useSearchIds } from "../hooks/index.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";
import { MetadataTimezoneProvider } from "./metadataTimezoneContext.js";
import { LeveledSearchTreeView, type SearchTreeViewLevels } from "./LeveledSearchTreeView.js";
import { useSearchKeyboard } from "../hooks/usSearchKeyboard.js";
import { HistorySearchTreeView } from "./HistorySearchTreeView.js";

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
    onSearch?: (query: string, searchResults?: ISemanticSearchResultItem[]) => void;
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
     * Can manage objects
     */
    canManage?: boolean;
    /**
     * Can analyze objects
     */
    canAnalyze?: boolean;
    /**
     * Can full controls
     */
    canFullControl?: boolean;
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
function SearchOverlayCore(props: Omit<SearchOverlayProps, "locale" | "metadataTimezone">) {
    const {
        onSelect,
        onSearch,
        backend,
        workspace,
        objectTypes,
        deepSearch,
        canManage,
        canFullControl,
        canAnalyze,
        limit = LIMIT,
        className,
        threshold = THRESHOLD,
        renderFooter,
    } = props;

    const canEdit = canFullControl || canManage || canAnalyze;

    const intl = useIntl();
    const { toggleOpen } = useHeaderSearch();

    // Input value handling
    const inputRef = useRef<Input>(null);
    const [value, setValue, searchTerm, setImmediate] = useDebouncedState("", DEBOUNCE);
    const isModified = value.length > 0;
    const { inputId, treeViewId } = useSearchIds();
    const handleKeyDown = useSearchKeyboard();

    const [activeNodeId, setActiveNodeId] = useState<string>();

    // Search results
    const effectiveWorkspace = useWorkspaceStrict(workspace);
    const { searchStatus, searchResults, searchError, searchMessage, relationships } = useSemanticSearch({
        backend,
        workspace: effectiveWorkspace,
        searchTerm,
        objectTypes,
        deepSearch,
        limit,
    });

    // Search history
    const [searchHistory, setSearchHistory] = useLocalStorage(SEARCH_HISTORY_KEY, SEARCH_HISTORY_EMPTY);

    const handleLeveledSelect: OnLeveledSelectFn<SearchTreeViewLevels> = useCallback(
        (item, { newTab }, event) => {
            setSearchHistory(
                [...new Set([searchTerm, ...searchHistory])].slice(0, MAX_SEARCH_HISTORY_LENGTH),
            );

            const itemData = item.data;
            const itemUrl = item.url;
            const itemIndex = searchResults.findIndex((result) => result.id === item.id);

            // Call the onSelect callback
            onSelect({
                item: itemData,
                index: itemIndex,
                preventDefault: event.preventDefault.bind(event),
                itemUrl: itemUrl,
                newTab,
            });

            // If the default was not prevented - simulate browser navigation for keyboard event
            if (itemUrl && !event.defaultPrevented && event.nativeEvent instanceof KeyboardEvent) {
                if (newTab) {
                    window.open(itemUrl, "_blank");
                } else {
                    window.location.href = itemUrl;
                }
            }

            // Trigger the dialog closing unless it's opening in a new tab
            if (!newTab) {
                toggleOpen();
            }

            // Force prevent default on end of runtime
            if (event.nativeEvent instanceof KeyboardEvent) {
                event.preventDefault();
                event.stopPropagation();
            }
        },
        [searchTerm, searchHistory, onSelect, setSearchHistory, toggleOpen, searchResults],
    );

    const handleHistorySelect = useCallback(
        (value: string) => {
            setImmediate(value);
            // The input element is loosing focus after the selection,
            // therefore it needs to be focused explicitly.
            inputRef.current?.inputNodeRef.inputNodeRef.focus();
        },
        [setImmediate],
    );

    const inputAccessibilityConfig = useMemo(
        (): IAccessibilityConfigBase => ({
            role: "combobox",
            ariaLabel: intl.formatMessage({ id: "semantic-search.label" }),
            ariaControls: treeViewId,
            ariaExpanded: true, // Always expanded
            ariaActiveDescendant: activeNodeId,
        }),
        [intl, activeNodeId, treeViewId],
    );

    const onValueChange = useCallback((value: string | number) => setValue(String(value)), [setValue]);

    const onEscKeyPress = useCallback(
        (event: React.KeyboardEvent) => {
            if (isModified) {
                event.stopPropagation();
            }
        },
        [isModified],
    );

    // Report metrics
    useEffect(() => {
        onSearch?.(searchTerm, searchResults);
        // I don't want to report on search string change, only on results
        // But I do need searchTerm, it will update with results anyway
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onSearch, searchResults]);

    useEffect(() => {
        if (searchStatus === "error") {
            // Report error to the console
            // UI will display a generic error message
            console.error(searchError);
        }
    }, [searchStatus, searchError]);

    return (
        <div className={classnames("gd-semantic-search__overlay", className)}>
            <Input
                ref={inputRef}
                className="gd-semantic-search__overlay-input"
                id={inputId}
                type="search"
                autofocus
                placeholder={intl.formatMessage({ id: "semantic-search.placeholder" })}
                accessibilityConfig={inputAccessibilityConfig}
                isSearch
                clearOnEsc
                value={value}
                onChange={onValueChange}
                onEscKeyPress={onEscKeyPress}
                onKeyDown={handleKeyDown}
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
                        if (!searchResults.length && searchMessage) {
                            return (
                                <div className="gd-semantic-search__overlay-no-results">{searchMessage}</div>
                            );
                        }
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
                            <LeveledSearchTreeView
                                id={treeViewId}
                                workspace={effectiveWorkspace}
                                searchResults={searchResults}
                                searchRelationships={relationships}
                                threshold={threshold}
                                onSelect={handleLeveledSelect}
                                onFocus={setActiveNodeId}
                                canEdit={canEdit}
                            />
                        );
                    case "idle":
                        if (searchHistory.length) {
                            return (
                                <HistorySearchTreeView
                                    id={treeViewId}
                                    searchHistory={searchHistory}
                                    onSelect={handleHistorySelect}
                                    onFocus={setActiveNodeId}
                                />
                            );
                        }
                    // fallthrough
                    default:
                        return null;
                }
            })()}
            {renderFooter?.({ ...props, status: searchStatus, value }, { closeSearch: toggleOpen })}
        </div>
    );
}

/**
 * A component that allows users to search for insights, metrics, attributes, and other objects using semantic search.
 * The internal version is meant to be used in an overlay inside the Header.
 * @internal
 */
export const SearchOverlay: React.FC<SearchOverlayProps> = ({ locale, metadataTimezone, ...props }) => {
    return (
        <MetadataTimezoneProvider value={metadataTimezone}>
            <IntlWrapper locale={locale}>
                <UiTreeViewEventsProvider>
                    <SearchOverlayCore {...props} />
                </UiTreeViewEventsProvider>
            </IntlWrapper>
        </MetadataTimezoneProvider>
    );
};
