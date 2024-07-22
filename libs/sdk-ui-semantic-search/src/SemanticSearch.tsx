// (C) 2024 GoodData Corporation

import * as React from "react";
import { useDebouncedState, Input, Dropdown } from "@gooddata/sdk-ui-kit";
import { GenAISemanticSearchType, ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { SearchResults } from "./SearchResults.js";
import { useSemanticSearch } from "./hooks/index.js";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import classnames from "classnames";

/**
 * Core semantic search component props.
 * @alpha
 */
export type SemanticSearchCoreProps = {
    backend?: IAnalyticalBackend;
    workspace?: string;
    onSelect: (item: ISemanticSearchResultItem) => void;
    onError?: (errorMessage: string) => void;
    className?: string;
    objectTypes?: GenAISemanticSearchType[];
    deepSearch?: boolean;
    limit?: number;
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
}) => {
    // Input value handling
    const [value, setValue, searchTerm] = useDebouncedState("", DEBOUNCE);

    // Search results
    const { searchLoading, searchResults, searchError } = useSemanticSearch({
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
        if (onError && searchError) {
            onError(searchError);
        }
    }, [onError, searchError]);

    return (
        <Dropdown
            className={classnames("gd-semantic-search", className)}
            closeOnMouseDrag={false}
            closeOnOutsideClick={false}
            closeOnParentScroll={false}
            renderBody={({ isMobile }) => {
                if (!searchResults.length && !searchLoading) {
                    return null;
                }

                return (
                    <SearchResults
                        width={width}
                        isMobile={isMobile}
                        searchResults={searchResults}
                        searchLoading={searchLoading}
                        onSelect={onItemSelect}
                    />
                );
            }}
            renderButton={({ openDropdown, closeDropdown }) => {
                return (
                    <Input
                        ref={inputRef}
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
