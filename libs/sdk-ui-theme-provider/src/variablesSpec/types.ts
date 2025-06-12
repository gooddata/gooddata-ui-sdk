// (C) 2024 GoodData Corporation

/**
 * Theme CSS variable name.
 *
 * @internal
 */
type ThemeCssVariableName = `--gd-${string}`;

/**
 * Theme CSS variable name, with inconsistent default values used across the codebase.
 *
 * @internal
 */
type ThemeInconsistentCssVariableName = `${ThemeCssVariableName}-from-theme`;

/**
 * Full path in theme (eg ["palette", "primary", "base"]).
 *
 * @internal
 */
type ThemePath = string[];

/**
 * Variable, that can be defined directly in theme.
 *
 * @internal
 */
export type ThemeDefinedCssVariable = {
    type: "theme";
    variableName: ThemeCssVariableName;
    themePath: ThemePath;
    /**
     * If default value is null, the variable should not be specified in default theme.
     */
    defaultValue: string | null;
    /**
     * Some theme variables are specified in theme as boolean (eg dropShadow, textCapitalization).
     * This value will be used for generating the default theme object, while {@link defaultValue} is used for CSS variables.
     * If not specified, the value from {@link defaultValue} will be used even for the default theme object generation.
     */
    defaultThemeValue?: string | boolean;

    /**
     * Optionally skip validation of the default value.
     * This makes sense only for variables like --gd-button-dropShadow, or --gd-modal-dropShadow,
     * where the inconsistent default value is expected, as it just replaces drop shadow offsets with "none".
     * Do not misuse this flag for anything else.
     */
    skipDefaultValueValidation?: boolean;

    /**
     * If true, the variable is not typed by theme, but is used in scss.
     * For some reason, some theme variables are not included in ITheme object types, but are still used in scss.
     * This is temporary, and we should either - make these variables internal, or add them to ITheme object types.
     */
    isNotTypedByTheme?: boolean;
};

/**
 * Variable, that cannot be defined directly in theme, but is derived from theme variables.
 *
 * @internal
 */
export type ThemeDerivedCssVariable = {
    type: "derived";
    variableName: ThemeCssVariableName;
    defaultValue: string;
    skipDefaultValueValidation?: boolean;
};

/**
 * Variable, that is internal only, thus cannot be defined directly in theme.
 *
 * @internal
 */
export type ThemeInternalCssVariable = {
    type: "internal";
    variableName: ThemeCssVariableName;
    defaultValue: string;
};
/**
 * Variable, that has inconsistent default values in scss, so it is suffixed with -from-theme
 * and will be set only if relevant theme property is defined.
 * This is temporary solution to keep theming backward compatible, and should be removed,
 * once the theming defaults are unified across the whole codebase.
 *
 * @internal
 */
// across the whole codebase.
export type ThemeInconsistentCssVariable = {
    type: "inconsistent";
    variableName: ThemeInconsistentCssVariableName;
    inconsistentDefaults: string[];
};

/**
 * Variable that can be defined in theme, but is not used and thus redundant.
 * Probably is already deprecated and should be removed in next major version.
 *
 * @internal
 */
export type ThemeDeprecatedCssVariable = {
    type: "deprecated";
    variableName: ThemeCssVariableName;
    themePath: ThemePath;
};

/**
 * All CSS variable types, that can be used in the codebase.
 *
 * @internal
 */
export type ThemeCssVariable =
    | ThemeDefinedCssVariable
    | ThemeDerivedCssVariable
    | ThemeInternalCssVariable
    | ThemeInconsistentCssVariable
    | ThemeDeprecatedCssVariable;
