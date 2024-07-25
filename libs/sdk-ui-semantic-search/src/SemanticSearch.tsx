// (C) 2024 GoodData Corporation

import * as React from "react";
import { useDebouncedState, Input, Dropdown } from "@gooddata/sdk-ui-kit";
import { GenAISemanticSearchType, ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { SearchResultsDropdownList } from "./SearchResultsDropdownList.js";
import { useSemanticSearch } from "./hooks/index.js";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import classnames from "classnames";

/**
 * Core semantic search component props.
 * @alpha
 */
export type SemanticSearchCoreProps = {
    /**
     * An analytical backend to use for the search. Can be omitted and taken from context.
     */
    backend?: IAnalyticalBackend;
    /**
     * A workspace to search in. Can be omitted and taken from context.
     */
    workspace?: string;
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
     * Placeholder text for the search input.
     */
    placeholder?: string;
};

/**
 * Search input debounce time.
 * I.e. how long to wait after the user stops typing before sending the search request.
 */
const DEBOUNCE = 300;

/**
 * Semantic search component core.
 * @alpha
 */
const SemanticSearchCore: React.FC<SemanticSearchCoreProps> = ({
    backend,
    workspace,
    onSelect,
    onError,
    objectTypes,
    deepSearch = false,
    limit = 10,
    className,
    placeholder,
}) => {
    // Input value handling
    const [value, setValue, searchTerm] = useDebouncedState("", DEBOUNCE);

    // Search results
    const { searchStatus, searchResults, searchError } = useSemanticSearch({
        backend,
        workspace,
        searchTerm,
        objectTypes,
        deepSearch,
        limit,
    });

    // Match the width of the drop-down to the input field
    const [width, setWidth] = React.useState<number>(0);
    const inputRef = React.useRef<Input>(null);
    React.useLayoutEffect(() => {
        const input = inputRef.current?.inputNodeRef?.inputNodeRef;
        if (input) {
            setWidth(input.offsetWidth);
        }
    }, []);
    const onItemSelect = React.useCallback(
        (item: ISemanticSearchResultItem) => {
            onSelect(item);
            inputRef.current?.inputNodeRef?.inputNodeRef?.blur();
        },
        [onSelect],
    );

    // Report errors
    React.useEffect(() => {
        if (onError && searchStatus === "error") {
            onError(searchError);
        }
    }, [onError, searchError, searchStatus]);

    return (
        <Dropdown
            className={classnames("gd-semantic-search", className)}
            closeOnMouseDrag={false}
            closeOnOutsideClick={false}
            closeOnParentScroll={false}
            renderBody={({ isMobile }) => {
                if (!searchResults.length && searchStatus !== "loading") {
                    return null;
                }

                return (
                    <SearchResultsDropdownList
                        width={width}
                        isMobile={isMobile}
                        searchResults={searchResults}
                        searchLoading={searchStatus === "loading"}
                        onSelect={onItemSelect}
                    />
                );
            }}
            renderButton={({ openDropdown, closeDropdown }) => {
                return (
                    <Input
                        ref={inputRef}
                        placeholder={placeholder}
                        isSearch
                        clearOnEsc
                        value={value}
                        onChange={(e) => setValue(String(e))}
                        onFocus={openDropdown}
                        onBlur={closeDropdown}
                    />
                );
            }}
        />
    );
};

/**
 * Semantic search component props.
 * @alpha
 */
export type SemanticSearchProps = SemanticSearchCoreProps & {
    locale?: string;
};

/**
 * Semantic search filed with dropdown for selecting items.
 * @alpha
 */
export const SemanticSearch: React.FC<SemanticSearchProps> = ({ locale, ...coreProps }) => {
    return (
        <IntlWrapper locale={locale}>
            <SemanticSearchCore {...coreProps} />
        </IntlWrapper>
    );
};
