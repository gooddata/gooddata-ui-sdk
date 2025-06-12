// (C) 2020 GoodData Corporation

export type DateFilterRoute = "absoluteForm" | "relativeForm" | null;

/**
 * Configuration actions like save and cancel button.
 * @alpha
 */
export interface IFilterConfigurationProps {
    /**
     * Callback to apply changes of current selection.
     *
     * @alpha
     */
    onSaveButtonClick: () => void;

    /**
     * Callback to discard changes and close configuration dropdown.
     *
     * @alpha
     */
    onCancelButtonClick: () => void;
}
