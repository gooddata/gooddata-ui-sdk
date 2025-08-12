// (C) 2024-2025 GoodData Corporation

import React, { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { useIntl } from "react-intl";
import {
    Input,
    Dropdown,
    LoadingMask,
    UiTreeViewEventsProvider,
    type IAccessibilityConfigBase,
} from "@gooddata/sdk-ui-kit";
import { useDebouncedState, useWorkspaceStrict } from "@gooddata/sdk-ui";
import {
    GenAIObjectType,
    ISemanticSearchResultItem,
    type ISemanticSearchRelationship,
} from "@gooddata/sdk-model";
import { useSemanticSearch, useElementWidth, useSearchIds } from "./hooks/index.js";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import classnames from "classnames";
import { IntlWrapper } from "./localization/IntlWrapper.js";
import { SemanticSearchTreeView } from "./SemanticSearchTreeView.js";
import { useSearchKeyboard } from "./hooks/usSearchKeyboard.js";
import { PermissionsProvider, usePermissions } from "./permissions/index.js";

/**
 * Semantic search component props.
 * @beta
 */
export type SemanticSearchProps = {
    /**
     * An analytical backend to use for the search. Can be omitted and taken from context.
     */
    backend?: IAnalyticalBackend;
    /**
     * A workspace to search in. Can be omitted and taken from context.
     */
    workspace?: string;
    /**
     * A locale to use for the search. Can be omitted and taken from context.
     */
    locale?: string;
    /**
     * A function called when the user selects an item from the search results.
     */
    onSelect: (item: ISemanticSearchResultItem | ISemanticSearchRelationship) => void;
    /**
     * A function called when an error occurs during the search.
     */
    onError?: (errorMessage: string) => void;
    /**
     * Additional CSS class for the component.
     */
    className?: string;
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
     * Placeholder text for the search input.
     */
    placeholder?: string;
    /**
     * A function to render the footer of the search overlay.
     */
    renderFooter?: (
        props: SemanticSearchProps & { status: "idle" | "loading" | "error" | "success"; value: string },
        handlers: {
            closeSearch: () => void;
        },
    ) => React.ReactNode;
};

/**
 * Search input debounce time.
 * I.e. how long to wait after the user stops typing before sending the search request.
 */
const DEBOUNCE = 300;

/**
 * Loading mask height.
 */
const LOADING_HEIGHT = 100;

/**
 * A threshold for search results to be shown to user.
 */
const THRESHOLD = 0.5;

/**
 * Semantic search component core.
 * @beta
 */
const SemanticSearchCore: React.FC<Omit<SemanticSearchProps, "locale">> = (props) => {
    const {
        backend,
        workspace,
        onSelect,
        onError,
        objectTypes,
        deepSearch = false,
        limit = 10,
        threshold = THRESHOLD,
        className,
        placeholder,
        renderFooter,
    } = props;
    const intl = useIntl();
    const effectiveWorkspace = useWorkspaceStrict(workspace);
    const { loading, permissions } = usePermissions();

    // Input value handling
    const inputRef = useRef<Input>(null);
    const [value, setValue, searchTerm, setImmediate] = useDebouncedState("", DEBOUNCE);
    const { inputId, treeViewId } = useSearchIds();
    const handleKeyDown = useSearchKeyboard();

    const [activeNodeId, setActiveNodeId] = useState<string>();

    // Search results
    const { searchStatus, searchResults, relationships, searchMessage, searchError } = useSemanticSearch({
        backend,
        workspace: effectiveWorkspace,
        searchTerm,
        objectTypes,
        deepSearch,
        limit,
    });

    const inputAccessibilityConfig = useMemo(
        (): IAccessibilityConfigBase => ({
            role: "combobox",
            ariaLabel: intl.formatMessage({ id: "semantic-search.label" }),
            ariaControls: treeViewId,
            ariaExpanded: Boolean(activeNodeId),
            ariaActiveDescendant: activeNodeId,
        }),
        [intl, activeNodeId, treeViewId],
    );

    // The component requires explicit width
    const [ref, width] = useElementWidth();

    const handleValueChange = useCallback((value: string | number) => setValue(String(value)), [setValue]);
    // Report errors
    useEffect(() => {
        if (onError && searchStatus === "error") {
            onError(searchError);
        }
    }, [onError, searchError, searchStatus]);

    return (
        <Dropdown
            className={classnames("gd-semantic-search", className)}
            ignoreClicksOnByClass={[
                ".gd-bubble",
                ".gd-input-icon-clear",
                ".gd-semantic-search__results-item",
                ".gd-semantic-search__input",
            ]}
            onOpenStateChanged={(isOpen) => {
                if (!isOpen) {
                    setActiveNodeId(undefined);
                }
            }}
            closeOnEscape={false}
            renderButton={({ openDropdown }) => {
                return (
                    <div ref={ref}>
                        <Input
                            ref={inputRef}
                            className="gd-semantic-search__input"
                            id={inputId}
                            type="search"
                            placeholder={placeholder}
                            accessibilityConfig={inputAccessibilityConfig}
                            isSearch
                            clearOnEsc
                            value={value}
                            onChange={handleValueChange}
                            onFocus={openDropdown}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                );
            }}
            renderBody={({ closeDropdown, isMobile }) => (
                <div>
                    {(() => {
                        const responsiveWidth = isMobile ? undefined : width;

                        if (loading) {
                            return <LoadingMask width={responsiveWidth} height={LOADING_HEIGHT} />;
                        }

                        switch (searchStatus) {
                            case "loading":
                                return <LoadingMask width={responsiveWidth} height={LOADING_HEIGHT} />;
                            case "error":
                                return null;
                            case "success":
                                // API search message
                                if (!searchResults.length && searchMessage) {
                                    return <div className="gd-semantic-search__message">{searchMessage}</div>;
                                }
                                // No search results
                                if (!searchResults.length) {
                                    return null;
                                }
                                return (
                                    <SemanticSearchTreeView
                                        id={treeViewId}
                                        searchResults={searchResults}
                                        searchRelationships={relationships}
                                        threshold={threshold}
                                        width={responsiveWidth}
                                        onSelect={(item) => {
                                            // Blur and clear the state
                                            inputRef.current?.inputNodeRef?.inputNodeRef?.blur();
                                            setImmediate("");
                                            closeDropdown();
                                            // Report the selected item
                                            onSelect(item.data);
                                        }}
                                        onFocus={setActiveNodeId}
                                        canEdit={
                                            permissions.canManageProject ??
                                            permissions.canCreateVisualization ??
                                            false
                                        }
                                    />
                                );
                            case "idle":
                                return null;
                        }
                    })()}
                    {renderFooter?.(
                        { ...props, status: searchStatus, value },
                        { closeSearch: closeDropdown },
                    )}
                </div>
            )}
        />
    );
};

/**
 * Semantic search filed with dropdown for selecting items.
 * @beta
 */
export const SemanticSearch: React.FC<SemanticSearchProps> = ({ locale, ...coreProps }) => {
    return (
        <IntlWrapper locale={locale}>
            <PermissionsProvider backend={coreProps.backend} workspace={coreProps.workspace}>
                <UiTreeViewEventsProvider>
                    <SemanticSearchCore {...coreProps} />
                </UiTreeViewEventsProvider>
            </PermissionsProvider>
        </IntlWrapper>
    );
};
