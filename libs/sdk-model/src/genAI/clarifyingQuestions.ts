// (C) 2026 GoodData Corporation

/**
 * @alpha
 *
 * Represents a clarifying question for an ai chat response.
 */
export interface IGenAiClarifyingQuestion {
    /**
     * Control that the question is asking for.
     */
    control: IGenAiSingleChoiceControl;
    /**
     * Text of the question.
     */
    text: string;
}

/**
 * @alpha
 *
 * Represents a single choice control.
 */
export interface IGenAiSingleChoiceControl {
    /**
     * Options that the control is asking for.
     */
    options: Array<IGenAiClarifyingChoiceOption>;
    /**
     * Type of the control.
     */
    type?: "singleChoice";
}

/**
 * @alpha
 *
 * Represents a single choice option.
 */
export interface IGenAiClarifyingChoiceOption {
    /**
     * Text of the option.
     */
    text: string;
}
