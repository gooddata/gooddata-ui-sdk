// (C) 2024 GoodData Corporation

import * as React from "react";
import { useDebouncedState, Input, Dropdown } from "@gooddata/sdk-ui-kit";
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
const SemanticSearchCore: React.FC<Omit<SemanticSearchProps, "locale">> = ({
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
    const [value, setValue, searchTerm, setImmediate] = useDebouncedState("", DEBOUNCE);
    const inputRef = React.useRef<Input>(null);

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
    const listItems: ListItem<ISemanticSearchResultItem>[] = React.useMemo(
        () => searchResults.map((item) => ({ item })),
        [searchResults],
    );

    // The List component requires explicit width
    const [ref, width] = useElementWidth();

    // Report errors
    React.useEffect(() => {
        if (onError && searchStatus === "error") {
            onError(searchError);
        }
    }, [onError, searchError, searchStatus]);

    return (
        <Dropdown
            className={classnames("gd-semantic-search", className)}
            ignoreClicksOnByClass={[
                ".gd-bubble",
                ".gd-semantic-search__results-item",
                ".gd-semantic-search__input",
            ]}
            renderBody={({ isMobile, closeDropdown }) => {
                if (!searchResults.length && searchStatus !== "loading") {
                    return null;
                }

                return (
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
};

/**
 * Semantic search filed with dropdown for selecting items.
 * @beta
 */
export const SemanticSearch: React.FC<SemanticSearchProps> = ({ locale, ...coreProps }) => {
    return (
        <IntlWrapper locale={locale}>
            <SemanticSearchCore {...coreProps} />
        </IntlWrapper>
    );
};
