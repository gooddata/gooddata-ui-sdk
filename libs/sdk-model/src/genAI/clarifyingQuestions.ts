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
 * Represents an answer to a clarifying question for an AI chat response.
 */
export interface IGenAiClarifyingAnswer {
    /**
     * Selected answer definition.
     */
    answer: IGenAiClarifyingAnswerItem;
    /**
     * Zero-based index of the question.
     */
    questionIndex: number;
    /**
     * Text of the question as presented to the user.
     */
    questionText: string;
}

/**
 * @alpha
 *
 * Represents a selected option for a clarifying answer.
 */
export interface IGenAiClarifyingAnswerItem {
    /**
     * Zero-based index of the selected option.
     */
    optionIndex: number;
    /**
     * Text of the selected option as presented to the user.
     */
    optionText: string;
    /**
     * Type of the answer.
     */
    type: "singleChoice";
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
