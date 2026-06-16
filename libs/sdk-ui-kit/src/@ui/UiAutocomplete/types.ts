// (C) 2026 GoodData Corporation

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";

/**
 * Minimal option shape; specialized pickers map their domain objects onto it.
 *
 * @internal
 */
export interface IUiAutocompleteOption {
    id: string;
    label: string;
    /** Secondary label rendered muted next to the primary label. */
    secondaryText?: string;
}

/** @internal */
export interface IUiAutocompleteSection<T extends IUiAutocompleteOption = IUiAutocompleteOption> {
    id: string;
    label: string;
    options: T[];
}

/**
 * User-facing copy overrides. Omitted fields fall back to the kit default.
 *
 * @internal
 */
export interface IUiAutocompleteMessages {
    searchPlaceholder?: string;
    stateLoading?: string;
    stateError?: string;
    stateNoMatch?: string;
    loadMore?: string;
}

/** @internal */
export interface IUiAutocompleteLoadResult<T extends IUiAutocompleteOption = IUiAutocompleteOption> {
    sections: IUiAutocompleteSection<T>[];
    /** Show a "Load more" row whose activation calls the loader with the next page. */
    hasNextPage?: boolean;
}

/** @internal */
export interface IUiAutocompleteProps<T extends IUiAutocompleteOption = IUiAutocompleteOption> {
    /**
     * Called with the debounced search and zero-based `page` index. Page 0
     * fires on every query change; subsequent pages fire on Load-more.
     *
     * Must be referentially stable (memoize with `useCallback`) — it is a
     * fetch dependency, so a new identity each render re-runs the page-0 query.
     */
    loadOptions: (search: string, page: number) => Promise<IUiAutocompleteLoadResult<T>>;
    /** Filtered out of the dropdown so the user cannot pick the same option twice. */
    selectedIds?: ReadonlyArray<string>;
    onSelect: (option: T) => void;
    /** Debounce delay for the input → loader path. Defaults to 400 ms. */
    debounceMs?: number;
    messages?: IUiAutocompleteMessages;
    /**
     * Forwarded to the search input for the accessible name / description.
     * The combobox-internal attributes (`role`, `ariaExpanded`, `ariaControls`,
     * `ariaAutocomplete`) are owned by the component and cannot be overridden.
     */
    accessibilityConfig?: IAccessibilityConfigBase;
    dataTestId?: string;
}
