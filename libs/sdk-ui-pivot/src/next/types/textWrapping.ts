// (C) 2025 GoodData Corporation

/**
 * @alpha
 */
export interface ITextWrapping {
    /**
     * Whether to wrap text in cells.
     */
    wrapText?: boolean;

    /**
     * Whether to wrap text in column headers.
     */
    wrapHeaderText?: boolean;
}

/**
 * @alpha
 */
export type PivotTableNextTextWrappingConfig = {
    /**
     * Configure text wrapping.
     */
    textWrapping?: ITextWrapping;
};
