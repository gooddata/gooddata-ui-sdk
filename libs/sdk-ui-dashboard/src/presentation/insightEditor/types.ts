// (C) 2026 GoodData Corporation

export interface IInsightEditorCloseHandle {
    /**
     * Asks Analytical Designer to close. It confirms unsaved changes first.
     */
    requestClose: () => void;
}
