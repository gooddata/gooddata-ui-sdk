// (C) 2024-2025 GoodData Corporation

import { useMemo, useEffect, useRef } from "react";
import { Input, Dropdown } from "@gooddata/sdk-ui-kit";
import { useDebouncedState } from "@gooddata/sdk-ui";
import { GenAIObjectType, ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { SearchResultsDropdownList } from "./SearchResultsDropdownList.js";
import { useSemanticSearch, useElementWidth } from "./hooks/index.js";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import classnames from "classnames";
import { ListItem } from "./types.js";
import { IntlWrapper } from "./localization/IntlWrapper.js";

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
    onSelect: (item: ISemanticSearchResultItem) => void;
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
 * Semantic search component core.
 * @beta
 */
function SemanticSearchCore(props: Omit<SemanticSearchProps, "locale">) {
    const {
        backend,
        workspace,
        onSelect,
        onError,
        objectTypes,
        deepSearch = false,
        limit = 10,
        className,
        placeholder,
        renderFooter,
    } = props;

    // Input value handling
    const [value, setValue, searchTerm, setImmediate] = useDebouncedState("", DEBOUNCE);
    const inputRef = useRef<Input>(null);

    // Search results
    const { searchStatus, searchResults, searchError } = useSemanticSearch({
        backend,
        workspace,
        searchTerm,
        objectTypes,
        deepSearch,
        limit,
    });

    // Build list items for rendering
    const listItems: ListItem<ISemanticSearchResultItem>[] = useMemo(
        () => searchResults.map((item) => ({ item })),
        [searchResults],
    );

    // The List component requires explicit width
    const [ref, width] = useElementWidth();

    // Report errors
    useEffect(() => {
        if (onError && searchStatus === "error") {
            onError(searchError);
        }
    }, [onError, searchError, searchStatus]);

    function Wrapper({
        children,
        status,
        closeSearch,
    }: {
        children: React.ReactNode;
        status: "idle" | "loading" | "error" | "success";
        closeSearch: () => void;
    }) {
        const comp = renderFooter?.(
            { ...props, status, value },
            {
                closeSearch,
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
    }

    return (
        <Dropdown
            className={classnames("gd-semantic-search", className)}
            ignoreClicksOnByClass={[
                ".gd-bubble",
                ".gd-input-icon-clear",
                ".gd-semantic-search__results-item",
                ".gd-semantic-search__input",
            ]}
            closeOnEscape={false}
            renderBody={({ isMobile, closeDropdown }) => {
                if (!searchResults.length && searchStatus !== "loading") {
                    return null;
                }

                return (
                    <Wrapper status={searchStatus} closeSearch={closeDropdown}>
                        <SearchResultsDropdownList
                            width={width}
                            isMobile={isMobile}
                            searchResults={listItems}
                            searchLoading={searchStatus === "loading"}
                            onSelect={(item) => {
                                // Blur and clear the state
                                const input = inputRef.current?.inputNodeRef?.inputNodeRef;
                                if (input) {
                                    input.blur();
                                }
                                setImmediate("");
                                closeDropdown();

                                // Report the selected item
                                onSelect(item);
                            }}
                        />
                    </Wrapper>
                );
            }}
            renderButton={({ openDropdown }) => {
                return (
                    <div ref={ref}>
                        <Input
                            className="gd-semantic-search__input"
                            ref={inputRef}
                            placeholder={placeholder}
                            isSearch
                            clearOnEsc
                            value={value}
                            onChange={(e) => setValue(String(e))}
                            onFocus={openDropdown}
                        />
                    </div>
                );
            }}
        />
    );
}

/**
 * Semantic search filed with dropdown for selecting items.
 * @beta
 */
export function SemanticSearch({ locale, ...coreProps }: SemanticSearchProps) {
    return (
        <IntlWrapper locale={locale}>
            <SemanticSearchCore {...coreProps} />
        </IntlWrapper>
    );
}
