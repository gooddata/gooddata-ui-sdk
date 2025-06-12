// (C) 2024 GoodData Corporation

/**
 * Specific variable usage in CSS.
 *
 * Example:
 * var(--gd-palette-complementary-0, #fff)
 * is represented as
 * \{
 *     variableName: "--gd-palette-complementary-0",
 *     defaultValue: "#fff"
 * \}
 *
 * @internal
 */
export type CssVariableUsage = {
    /**
     * Name of the variable
     */
    variableName: string;

    /**
     * Default value of the variable.
     * If the usage has no default value, it will be `null`.
     */
    defaultValue: string | null;
};
