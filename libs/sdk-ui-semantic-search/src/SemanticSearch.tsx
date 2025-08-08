// (C) 2024-2025 GoodData Corporation

import * as React from "react";
import { useIntl } from "react-intl";
import {
    Input,
    Dropdown,
    LoadingMask,
    UiStaticTreeview,
    UiTreeViewEventsProvider,
    useUiTreeViewEventPublisher,
    type UiStaticTreeView,
} from "@gooddata/sdk-ui-kit";
import { useDebouncedState } from "@gooddata/sdk-ui";
import { GenAIObjectType, ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { useSemanticSearch, useElementWidth } from "./hooks/index.js";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import classnames from "classnames";
import { IntlWrapper } from "./localization/IntlWrapper.js";
import { SemanticSearchItem } from "./SemanticSearchItem.js";

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
 * Loading mask height.
 */
const LOADING_HEIGHT = 100;

/**
 * Semantic search component core.
 * @beta
 */
const SemanticSearchCore: React.FC<Omit<SemanticSearchProps, "locale">> = (props) => {
    const intl = useIntl();
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
    const inputRef = React.useRef<Input>(null);

    // Search results
    const { searchStatus, searchResults, searchMessage, searchError } = useSemanticSearch({
        backend,
        workspace,
        searchTerm,
        objectTypes,
        deepSearch,
        limit,
    });

    // Build items for rendering
    const items: UiStaticTreeView<ISemanticSearchResultItem>[] = searchResults.map((item) => ({
        item: {
            id: item.id,
            stringTitle: item.title,
            data: item,
        },
    }));

    // The List component requires explicit width
    const [ref, width] = useElementWidth();

    // Report errors
    React.useEffect(() => {
        if (onError && searchStatus === "error") {
            onError(searchError);
        }
    }, [onError, searchError, searchStatus]);

    const Wrapper = ({
        children,
        status,
        closeSearch,
    }: {
        children: React.ReactNode;
        status: "idle" | "loading" | "error" | "success";
        closeSearch: () => void;
    }) => {
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
    };

    const onKeyDown = useUiTreeViewEventPublisher("keydown");

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
            renderBody={({ closeDropdown, isMobile }) => {
                if (searchStatus === "loading") {
                    return (
                        <Wrapper status={searchStatus} closeSearch={closeDropdown}>
                            <LoadingMask width={isMobile ? "100%" : width} height={LOADING_HEIGHT} />
                        </Wrapper>
                    );
                }
                if (items.length === 0 || searchStatus !== "success") {
                    return null;
                }
                if (items.length === 0 && searchMessage) {
                    return (
                        <Wrapper status={searchStatus} closeSearch={closeDropdown}>
                            <div className="gd-semantic-search__message">{searchMessage}</div>
                        </Wrapper>
                    );
                }
                return (
                    <Wrapper status={searchStatus} closeSearch={closeDropdown}>
                        <UiStaticTreeview
                            items={items}
                            width={width}
                            ItemComponent={SemanticSearchItem}
                            ariaAttributes={{
                                id: "semantic-search-tree",
                                "aria-label": intl.formatMessage({ id: "semantic-search.tree" }),
                            }}
                            onSelect={(item) => {
                                // Blur and clear the state
                                const input = inputRef.current?.inputNodeRef?.inputNodeRef;
                                if (input) {
                                    input.blur();
                                }
                                setImmediate("");
                                closeDropdown();

                                // Report the selected item
                                onSelect(item.data);
                            }}
                            shouldKeyboardActionPreventDefault={false}
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
                            onKeyDown={onKeyDown}
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
            <UiTreeViewEventsProvider>
                <SemanticSearchCore {...coreProps} />
            </UiTreeViewEventsProvider>
        </IntlWrapper>
    );
};
