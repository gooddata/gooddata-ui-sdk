// (C) 2025 GoodData Corporation

/**
 * @public
 */
export type PivotTableNextCellSelectionConfig = {
    /**
     * If true, enables cell selection in the pivot table.
     *
     * @remarks
     * When enabled, users will be able to select cells in the table.
     * When disabled, cell selection and focus will be suppressed. This is useful
     * in scenarios like dashboard edit mode where cell interaction should be prevented.
     *
     * Default: true
     */
    enableCellSelection?: boolean;
};
