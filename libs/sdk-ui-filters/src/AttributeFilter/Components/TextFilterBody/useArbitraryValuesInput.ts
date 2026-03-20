// (C) 2007-2026 GoodData Corporation

import {
    type ClipboardEvent,
    type FocusEventHandler,
    type KeyboardEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { isArrowDownKey, isEnterKey, isEscapeKey } from "@gooddata/sdk-ui-kit";

import { parseArbitraryValues } from "../../parseArbitraryValues.js";

interface IUseArbitraryValuesInputParams {
    values: Array<string | null>;
    onValuesChange?: (values: Array<string | null>) => void;
    onBlur?: FocusEventHandler<HTMLInputElement>;
    emptyValueDisplay: string;
    autocompleteOptions?: string[];
    onAutocompleteSearch?: (searchString: string) => void;
    isAutocompleteLoading?: boolean;
}

export function useArbitraryValuesInput({
    values,
    onValuesChange,
    onBlur,
    emptyValueDisplay,
    autocompleteOptions,
    onAutocompleteSearch,
    isAutocompleteLoading,
}: IUseArbitraryValuesInputParams) {
    const [inputValue, setInputValue] = useState("");
    const [activeAutocompleteIndex, setActiveAutocompleteIndex] = useState<number | null>(null);
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
        Boolean(inputValue.trim()) &&
        !autocompletesDismissed &&
        (filteredSuggestions.length > 0 || isAutocompleteLoading);
    const isAutocompleteOpen = filteredSuggestions.length > 0;

    useEffect(() => {
        setActiveAutocompleteIndex(null);
        setAutocompleteDismissed(false);
    }, [inputValue]);

    useEffect(() => {
        if (inputValue.trim() && onAutocompleteSearch) {
            onAutocompleteSearch(inputValue);
        }
    }, [inputValue, onAutocompleteSearch]);

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

    return {
        chipsContainerRef,
        inputValue,
        setInputValue,
        activeAutocompleteIndex,
        filteredSuggestions,
        shouldShowAutocompleteDropdown,
        isAutocompleteOpen,
        handleKeyDown,
        handleBlur,
        handlePaste,
        handleSelectSuggestion,
        handleRemoveValue,
    };
}
