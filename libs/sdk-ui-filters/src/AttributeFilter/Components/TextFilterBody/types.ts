// (C) 2007-2026 GoodData Corporation

import { type AttributeFilterTextSelectionType } from "../../selectionTypes.js";
import { type TextFilterOperator } from "../../textFilterOperatorUtils.js";

/**
 * Props for TextFilterBody component.
 *
 * @alpha
 */
export interface ITextFilterBodyProps {
    /**
     * Current operator
     */
    operator: TextFilterOperator;

    /**
     * Current values (chips for is/is not) or literal (single input for others)
     */
    values: Array<string | null>;

    /**
     * Literal for like operators (when not using chips)
     */
    literal: string;

    /**
     * Case sensitive flag for like operators
     */
    caseSensitive: boolean;

    /**
     * Callback when operator changes
     */
    onOperatorChange?: (operator: TextFilterOperator) => void;

    /**
     * Callback when values change (for is/is not)
     */
    onValuesChange?: (values: Array<string | null>) => void;

    /**
     * Callback when values input loses focus.
     */
    onValuesBlur?: () => void;

    /**
     * Callback when literal changes (for other operators)
     */
    onLiteralChange?: (literal: string) => void;

    /**
     * Callback when literal field loses focus.
     */
    onLiteralBlur?: () => void;

    /**
     * Callback to toggle case sensitivity
     */
    onToggleCaseSensitive?: () => void;

    /**
     * True if empty-literal validation should be shown.
     */
    hasLiteralEmptyError?: boolean;

    /**
     * True if empty-values validation should be shown.
     */
    hasValuesEmptyError?: boolean;

    /**
     * True when at value limit (values.length === max) - warning shown, Apply enabled.
     */
    hasValuesLimitReachedWarning?: boolean;

    /**
     * True when value limit exceeded (truncated) - error shown, Apply disabled.
     */
    hasValuesLimitExceededError?: boolean;

    /**
     * Attribute title for context
     */
    attributeTitle: string;

    /**
     * Whether the filter is disabled
     */
    disabled?: boolean;

    /**
     * Available text sub-modes.
     */
    availableTextModes?: AttributeFilterTextSelectionType[];

    /**
     * Autocomplete suggestions for the values input (is / is not operators).
     * Populated from the loaded attribute elements so the user can pick known values.
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
     * If true, tooltips in the filter body are hidden.
     */
    hideTooltips?: boolean;
}
