// (C) 2026 GoodData Corporation

/**
 * How every value editor of a condition takes its error state: one flag for the visuals, one id for the
 * assistive-tech association, one "the user has been here" signal. Uniform across the inputs, the
 * combobox and the date picker, so the editor can hand any control the same object.
 */
export interface ICfFieldProps {
    hasError: boolean;
    errorId: string | undefined;
    /** The field was visited and left. Each control maps it to whatever that means for it. */
    onVisit: () => void;
}
