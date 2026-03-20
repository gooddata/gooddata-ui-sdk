// (C) 2007-2026 GoodData Corporation

import { type FocusEventHandler, type JSX } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { Input, LoadingSpinner, UiTag, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { useArbitraryValuesInput } from "./useArbitraryValuesInput.js";

/**
 * Props for ArbitraryValuesInput component.
 *
 * @alpha
 */
export interface IArbitraryValuesInputProps {
    /**
     * Current values
     */
    values: Array<string | null>;

    /**
     * Callback when values change
     */
    onValuesChange?: (values: Array<string | null>) => void;

    /**
     * Placeholder text
     */
    placeholder?: string;

    /**
     * Whether the input is disabled
     */
    disabled?: boolean;

    /**
     * Callback when input loses focus.
     */
    onBlur?: FocusEventHandler<HTMLInputElement>;

    /**
     * Whether empty-value validation should be shown.
     */
    hasEmptyError?: boolean;

    /**
     * True when at value limit (warning state) - yellow border on container.
     */
    hasValuesLimitReachedWarning?: boolean;

    /**
     * True when value limit exceeded (error state) - red border on container.
     */
    hasValuesLimitExceededError?: boolean;

    /**
     * Localized display string for empty value (e.g. "(empty value)").
     * Used for parsing input and displaying empty string values.
     */
    emptyValueDisplay: string;

    /**
     * Optional list of autocomplete suggestions. When provided, a dropdown of matching
     * options is shown while the user types. Selecting an option adds it as a chip.
     * Already-selected values are excluded from the suggestions.
     */
    autocompleteOptions?: string[];

    /**
     * Optional callback to trigger a search for autocomplete suggestions.
     * When provided, this will be called as the user types to fetch matching elements
     * from the backend.
     */
    onAutocompleteSearch?: (searchString: string) => void;

    /**
     * Whether autocomplete is currently loading results from the backend.
     */
    isAutocompleteLoading?: boolean;

    /**
     * Optional id of the values input.
     */
    inputId?: string;

    /**
     * Optional id of an external label that describes this control.
     */
    ariaLabelledBy?: string;

    /**
     * Optional id(s) of elements that describe this control.
     */
    ariaDescribedBy?: string;
}
/**
 * Wraps the first occurrence of `query` inside `text` in a `<strong>` tag for visual highlighting.
 * The match is case-insensitive; original casing of the text is preserved.
 */
function highlightMatch(text: string, query: string): JSX.Element {
    if (!query) return <>{text}</>;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchIndex = lowerText.indexOf(lowerQuery);
    if (matchIndex === -1) return <>{text}</>;
    const before = text.slice(0, matchIndex);
    const match = text.slice(matchIndex, matchIndex + query.length);
    const after = text.slice(matchIndex + query.length);
    return (
        <>
            {before}
            <strong>{match}</strong>
            {after}
        </>
    );
}

/**
 * Input component that creates values from comma-separated or newline-separated input.
 * Supports double quotes for values containing commas.
 * Used for arbitrary filtering operators.
 *
 * @alpha
 */
export function ArbitraryValuesInput(props: IArbitraryValuesInputProps) {
    const {
        values,
        onValuesChange,
        placeholder,
        disabled,
        onBlur,
        hasEmptyError,
        hasValuesLimitReachedWarning,
        hasValuesLimitExceededError,
        emptyValueDisplay,
        autocompleteOptions,
        onAutocompleteSearch,
        isAutocompleteLoading,
        inputId: inputIdProp,
        ariaLabelledBy,
        ariaDescribedBy,
    } = props;

    const intl = useIntl();
    const generatedInputId = useIdPrefixed("text-filter-values-input");
    const inputId = inputIdProp ?? generatedInputId;
    const autocompleteListId = `${inputId}-autocomplete-list`;

    const {
        chipsContainerRef,
        inputValue,
        setInputValue,
        activeAutocompleteIndex,
        filteredSuggestions,
        shouldShowAutocompleteDropdown,
        handleKeyDown,
        handleBlur,
        handlePaste,
        handleSelectSuggestion,
        handleRemoveValue,
    } = useArbitraryValuesInput({
        values,
        onValuesChange,
        onBlur,
        emptyValueDisplay,
        autocompleteOptions,
        onAutocompleteSearch,
        isAutocompleteLoading,
    });

    const getDisplayLabel = (value: string | null) => {
        if (value === null) {
            return emptyValueDisplay;
        }
        if (value === "") {
            return '""';
        }
        return value;
    };

    const hasValues = values.length > 0;

    const inputElement = (
        <Input
            id={inputId}
            type="text"
            className="gd-chips-input__input s-chips-input-field"
            value={inputValue}
            onChange={(value) => setInputValue(String(value))}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            accessibilityConfig={{
                role: "combobox",
                ariaAutocomplete: "list",
                ariaControls: autocompleteListId,
                ariaExpanded: shouldShowAutocompleteDropdown,
                ariaActiveDescendant:
                    activeAutocompleteIndex === null
                        ? undefined
                        : `${autocompleteListId}-item-${activeAutocompleteIndex}`,
                ariaLabelledBy: ariaLabelledBy,
                ariaDescribedBy: ariaDescribedBy,
                ariaInvalid: hasEmptyError || hasValuesLimitExceededError || undefined,
            }}
        />
    );

    return (
        <div className="gd-chips-input s-chips-input">
            <div
                className={cx("gd-chips-input__container", {
                    "gd-chips-input__container--error s-chips-input-error":
                        hasEmptyError || hasValuesLimitExceededError,
                    "gd-chips-input__container--warning":
                        hasValuesLimitReachedWarning && !hasValuesLimitExceededError,
                    "gd-chips-input__container--with-values": hasValues,
                })}
            >
                {hasValues ? (
                    <div
                        className="gd-chips-input__chips-frame"
                        onPaste={handlePaste}
                        ref={chipsContainerRef}
                    >
                        <div className="gd-chips-input__chips">
                            {values.map((value, index) => (
                                <UiTag
                                    key={`${value ?? "__null__"}-${index}`}
                                    label={getDisplayLabel(value)}
                                    isDeletable
                                    isDisabled={disabled}
                                    dataTestId={`s-text-filter-value-tag-${index}`}
                                    tabIndex={-1}
                                    onDelete={() => handleRemoveValue(index)}
                                    accessibilityConfig={{
                                        deleteAriaLabel: intl.formatMessage(
                                            {
                                                id: "attributeFilter.text.values.removeTagAriaLabel",
                                            },
                                            {
                                                value: getDisplayLabel(value),
                                            },
                                        ),
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ) : null}
                <div
                    className={cx("gd-chips-input__input-frame", {
                        "gd-chips-input__input-frame--standalone": !hasValues,
                    })}
                    onPaste={handlePaste}
                >
                    {inputElement}
                </div>
            </div>
            <ul
                id={autocompleteListId}
                className="gd-chips-input__autocomplete s-chips-input-autocomplete"
                role="listbox"
                hidden={!shouldShowAutocompleteDropdown}
                aria-label={intl.formatMessage({
                    id: "attributeFilter.text.autocomplete.listLabel",
                })}
            >
                {shouldShowAutocompleteDropdown ? (
                    isAutocompleteLoading ? (
                        <li className="gd-chips-input__autocomplete-loading s-chips-input-autocomplete-loading">
                            <LoadingSpinner className="small" />
                        </li>
                    ) : (
                        filteredSuggestions.map((suggestion, index) => (
                            <li
                                key={suggestion}
                                id={`${autocompleteListId}-item-${index}`}
                                className={cx("gd-chips-input__autocomplete-item", {
                                    "gd-chips-input__autocomplete-item--active":
                                        index === activeAutocompleteIndex,
                                })}
                                role="option"
                                aria-selected={index === activeAutocompleteIndex}
                                // Prevent the input from blurring when clicking a suggestion.
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSelectSuggestion(suggestion)}
                            >
                                {highlightMatch(suggestion, inputValue)}
                            </li>
                        ))
                    )
                ) : null}
            </ul>
        </div>
    );
}
