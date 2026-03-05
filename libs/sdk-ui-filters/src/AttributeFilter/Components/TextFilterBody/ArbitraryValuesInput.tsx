// (C) 2007-2026 GoodData Corporation

import {
    type ClipboardEvent,
    type FocusEventHandler,
    type JSX,
    type KeyboardEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { Input, LoadingSpinner, UiTag, isArrowDownKey, isEnterKey, isEscapeKey } from "@gooddata/sdk-ui-kit";

import { parseArbitraryValues } from "../../parseArbitraryValues.js";

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
    } = props;

    const intl = useIntl();
    const [inputValue, setInputValue] = useState("");
    const [activeAutocompleteIndex, setActiveAutocompleteIndex] = useState<number | null>(null);
    // Tracks whether the user pressed Escape to dismiss the dropdown for the current input text.
    const [autocompletesDismissed, setAutocompleteDismissed] = useState(false);
    const chipsContainerRef = useRef<HTMLDivElement>(null);
    const prevValuesLengthRef = useRef<number>(values.length);

    const filteredSuggestions = useMemo(() => {
        if (!autocompleteOptions?.length || !inputValue.trim() || autocompletesDismissed) {
            return [];
        }
        const q = inputValue.toLowerCase();
        const stringValues = values.filter((v): v is string => v !== null);
        return autocompleteOptions.filter(
            (opt) => opt.toLowerCase().includes(q) && !stringValues.includes(opt),
        );
    }, [autocompleteOptions, inputValue, values, autocompletesDismissed]);

    const shouldShowAutocompleteDropdown =
        inputValue.trim() &&
        !autocompletesDismissed &&
        (filteredSuggestions.length > 0 || isAutocompleteLoading);
    const isAutocompleteOpen = filteredSuggestions.length > 0;

    // Reset active index and dismissed flag whenever the input text changes.
    useEffect(() => {
        setActiveAutocompleteIndex(null);
        setAutocompleteDismissed(false);
    }, [inputValue]);

    // Trigger search when user types (lazy load elements for autocomplete)
    useEffect(() => {
        if (inputValue.trim() && onAutocompleteSearch) {
            onAutocompleteSearch(inputValue);
        }
    }, [inputValue, onAutocompleteSearch]);

    // Auto-scroll to the latest added value only when values are added, not removed
    useEffect(() => {
        if (chipsContainerRef.current && values.length > prevValuesLengthRef.current) {
            const container = chipsContainerRef.current;
            container.scrollTop = container.scrollHeight;
        }
        prevValuesLengthRef.current = values.length;
    }, [values]);

    const mergeParsedValues = useCallback(
        (parsed: Array<string | null>) => {
            const combined: Array<string | null> = [...values];
            for (const v of parsed) {
                const alreadyExists = combined.includes(v);
                if (!alreadyExists) {
                    combined.push(v);
                }
            }
            onValuesChange?.(combined);
        },
        [values, onValuesChange],
    );

    const handleParseAndAdd = useCallback(
        (raw: string) => {
            if (!raw.trim()) return;
            const parsed = parseArbitraryValues(raw, emptyValueDisplay);
            if (parsed.length > 0) {
                mergeParsedValues(parsed);
            }
        },
        [emptyValueDisplay, mergeParsedValues],
    );

    const handleSelectSuggestion = useCallback(
        (suggestion: string) => {
            mergeParsedValues([suggestion]);
            setInputValue("");
            setActiveAutocompleteIndex(null);
        },
        [mergeParsedValues],
    );

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (isAutocompleteOpen) {
                if (isArrowDownKey(event)) {
                    event.preventDefault();
                    setActiveAutocompleteIndex((prev) =>
                        prev === null ? 0 : Math.min(prev + 1, filteredSuggestions.length - 1),
                    );
                    return;
                }
                if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActiveAutocompleteIndex((prev) =>
                        prev === null ? filteredSuggestions.length - 1 : Math.max(prev - 1, 0),
                    );
                    return;
                }
                if (isEscapeKey(event)) {
                    event.preventDefault();
                    setAutocompleteDismissed(true);
                    setActiveAutocompleteIndex(null);
                    return;
                }
            }
            if (isEnterKey(event) && inputValue.trim()) {
                event.preventDefault();
                if (activeAutocompleteIndex !== null && filteredSuggestions[activeAutocompleteIndex]) {
                    handleSelectSuggestion(filteredSuggestions[activeAutocompleteIndex]);
                } else {
                    handleParseAndAdd(inputValue);
                    setInputValue("");
                }
            } else if (event.key === "Backspace" && !inputValue && values.length > 0) {
                event.preventDefault();
                onValuesChange?.(values.slice(0, -1));
            }
        },
        [
            isAutocompleteOpen,
            filteredSuggestions,
            inputValue,
            values,
            onValuesChange,
            handleParseAndAdd,
            activeAutocompleteIndex,
            handleSelectSuggestion,
        ],
    );

    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            if (inputValue.trim()) {
                handleParseAndAdd(inputValue);
                setInputValue("");
            }
            onBlur?.(e);
        },
        [inputValue, handleParseAndAdd, onBlur],
    );

    const handlePaste = useCallback(
        (event: ClipboardEvent) => {
            const pasted = event.clipboardData.getData("text");
            if (pasted.includes(",") || pasted.includes("\n")) {
                event.preventDefault();
                handleParseAndAdd(pasted);
            }
        },
        [handleParseAndAdd],
    );

    const handleRemoveValue = useCallback(
        (index: number) => {
            onValuesChange?.(values.filter((_, i) => i !== index));
        },
        [values, onValuesChange],
    );

    const getDisplayLabel = useCallback(
        (value: string | null) => {
            if (value === null) {
                return emptyValueDisplay;
            }
            if (value === "") {
                return '""';
            }
            return value;
        },
        [emptyValueDisplay],
    );

    const hasValues = values.length > 0;

    const inputElement = (
        <Input
            type="text"
            className="gd-chips-input__input s-chips-input-field"
            value={inputValue}
            onChange={(value) => setInputValue(String(value))}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
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
                    <>
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
                        <div className="gd-chips-input__input-frame" onPaste={handlePaste}>
                            {inputElement}
                        </div>
                    </>
                ) : (
                    <div
                        className="gd-chips-input__input-frame gd-chips-input__input-frame--standalone"
                        onPaste={handlePaste}
                    >
                        {inputElement}
                    </div>
                )}
            </div>
            {shouldShowAutocompleteDropdown ? (
                <ul
                    className="gd-chips-input__autocomplete s-chips-input-autocomplete"
                    role="listbox"
                    aria-label={intl.formatMessage({
                        id: "attributeFilter.text.autocomplete.listLabel",
                    })}
                >
                    {isAutocompleteLoading ? (
                        <li className="gd-chips-input__autocomplete-loading s-chips-input-autocomplete-loading">
                            <LoadingSpinner className="small" />
                        </li>
                    ) : (
                        filteredSuggestions.map((suggestion, index) => (
                            <li
                                key={suggestion}
                                id={`gd-chips-autocomplete-item-${index}`}
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
                    )}
                </ul>
            ) : null}
        </div>
    );
}
