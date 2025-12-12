// (C) 2023 GoodData Corporation

import { type IColor } from "@gooddata/sdk-model";

/**
 * Defines the calculation types for an algorithm.
 *
 * @remarks
 * The table below summarizes the available calculation types:
 *
 * <table>
 *     <tr><th width="150">Type</th><th width="350">Algorithm</th></tr>
 *     <tr><td>change</td><td>(Primary - Secondary) / Secondary</td></tr>
 *     <tr><td>difference</td><td>Primary - Secondary</td></tr>
 *     <tr><td>ratio</td><td>Primary / Secondary</td></tr>
 *     <tr>
 *         <td>change_difference</td>
 *         <td>
 *              Change: (Primary - Secondary) / Secondary
 *              <br/>
 *              Difference: Primary - Secondary
 *         </td>
 *     </tr>
 * </table>
 *
 * @public
 */
export type CalculationType = "change" | "ratio" | "difference" | "change_difference";

/**
 * Defines how the comparison value will be placed.
 *
 * @public
 */
export type ComparisonPosition = "top" | "left" | "right" | "auto";

/**
 * @internal
 */
export const CalculateAs: Record<Uppercase<CalculationType>, CalculationType> = {
    RATIO: "ratio" as const,
    CHANGE: "change" as const,
    DIFFERENCE: "difference" as const,
    CHANGE_DIFFERENCE: "change_difference" as const,
};

/**
 * @internal
 */
export const ComparisonPositionValues: Record<Uppercase<ComparisonPosition>, ComparisonPosition> = {
    LEFT: "left" as const,
    RIGHT: "right" as const,
    TOP: "top" as const,
    AUTO: "auto" as const,
};

/**
 * Comparison format type
 *
 * @remarks
 * Providing a null value will configure the format to inherit from the format of primary measure.
 *
 * @public
 */
export type ComparisonFormat = string | null;

/**
 * Configuration options for color settings.
 *
 * @public
 */
export interface IColorConfig {
    /**
     * Determines whether to disable the comparison color.
     *
     * @defaultValue false
     */
    disabled?: boolean;

    /**
     * Specifies the color to use, which can be selected from the color palette or provided as an RGB code.
     * This color is used when the primary measure greater than the secondary measure.
     *
     * @defaultValue rgb(0, 193, 141)
     */
    positive?: IColor;

    /**
     * Specifies the color to use, which can be selected from the color palette or provided as an RGB code.
     * This color is used when the primary measure less than the secondary measure.
     *
     * @defaultValue rgb(229, 77, 64)
     */
    negative?: IColor;

    /**
     * Specifies the color to use, which can be selected from the color palette or provided as an RGB code.
     * This color is used when the primary measure equal to the secondary measure.
     *
     * @defaultValue rgb(148, 161, 173)
     */
    equals?: IColor;
}

/**
 * Configuration options for labeling conditions.
 *
 * @public
 */
export interface ILabelConfig {
    /**
     * This property specifies whether to use the unconditional value for all conditions
     * or separate values for each condition.
     *
     * @defaultValue false
     */
    isConditional?: boolean;

    /**
     * Specifies the label to be used for the comparison value.
     *
     * @remarks
     * The default value is based on the calculation type:
     * <table>
     *     <tr><th width="150">Calculation Type</th><th width="350">Default value</th></tr>
     *     <tr><td>change</td><td>Change</td></tr>
     *     <tr><td>ratio</td><td>of</td></tr>
     *     <tr><td>difference</td><td>Difference</td></tr>
     *     <tr><td>change_difference</td><td>Change</td></tr>
     * </table>
     */
    unconditionalValue?: string;

    /**
     * This property specify the label of the positive comparison value
     * <br/>
     * Primary is larger than Secondary
     *
     * @defaultValue based on the calculation type
     *
     * <table border="1">
     *     <tr><td>Calculation type</td><td>Default label</td></tr>
     *     <tr><td>change</td><td>Increase</td></tr>
     *     <tr><td>difference</td><td>Increase</td></tr>
     *     <tr><td>ratio</td><td>(Not applicable)</td></tr>
     * </table>
     */
    positive?: string;

    /**
     * This property specify the label of the negative comparison
     * <br/>
     * Primary is less than Secondary
     *
     * @defaultValue based on the calculation type
     *
     * <table border="1">
     *     <tr><td>Calculation type</td><td>Default label</td></tr>
     *     <tr><td>change</td><td>Decrease</td></tr>
     *     <tr><td>difference</td><td>Decrease</td></tr>
     *     <tr><td>ratio</td><td>(Not applicable)</td></tr>
     * </table>
     */
    negative?: string;

    /**
     * This property specify the label of the equals comparison value
     * <br/>
     * Primary is equals Secondary
     *
     * <table border="1">
     *     <tr><td>Calculation type</td><td>Default label</td></tr>
     *     <tr><td>change</td><td>No change</td></tr>
     *     <tr><td>difference</td><td>No difference</td></tr>
     *     <tr><td>ratio</td><td>(Not applicable)</td></tr>
     * </table>
     */
    equals?: string;
}

/**
 * Configuration options for comparing values.
 *
 * @public
 */
export interface IComparison {
    /**
     * Enables or disables the comparison.
     *
     * @defaultValue true
     */
    enabled: boolean;

    /**
     * Defines how the comparison value will be calculated.
     *
     * @remarks
     * The default value is determined by the type of secondary measure:
     * <table>
     *     <tr><th width="250">Type of secondary measure</th><th width="250">Default value</th></tr>
     *     <tr><td>Derived measure</td><td>change</td></tr>
     *     <tr><td>Non-derived measure</td><td>ratio</td></tr>
     * </table>
     *
     * @see {@link CalculationType} for available calculation methods.
     *
     * @defaultValue Based on the secondary measure.
     */
    calculationType?: CalculationType;

    /**
     * Defines how the comparison value will be placed.
     *
     * @see {@link ComparisonPosition} for supported positions
     *
     * @defaultValue auto
     */
    position?: ComparisonPosition;

    /**
     * Defines the number format of the comparison value.
     *
     * @remarks
     * The default value is based on the calculation type:
     * <table>
     *     <tr><th width="150">Calculation Type</th><th width="350">Default format</th></tr>
     *     <tr><td>change</td><td>Percent (rounded)</td></tr>
     *     <tr><td>ratio</td><td>Percent (rounded)</td></tr>
     *     <tr><td>difference</td><td>Inherit</td></tr>
     * </table>
     *
     * @see {@link ComparisonFormat} for supported formats.
     *
     * @defaultValue Based on the calculation type.
     */
    format?: ComparisonFormat;

    /**
     * Defines the number format of the comparison sub value.
     *
     * @remarks
     * The default value is based on the calculation subtype:
     * <table>
     *     <tr><th width="150">Calculation Type</th><th width="350">Default format</th></tr>
     *     <tr><td>change</td><td>Percent (rounded)</td></tr>
     *     <tr><td>ratio</td><td>Percent (rounded)</td></tr>
     *     <tr><td>difference</td><td>Inherit</td></tr>
     * </table>
     *
     * @see {@link ComparisonFormat} for supported formats.
     *
     * @defaultValue Based on the calculation subtype.
     */
    subFormat?: ComparisonFormat;

    /**
     * Controls the visibility of the arrow trend indicator and its direction based on conditions.
     *
     * @remarks
     * The arrow direction is determined as follows:
     *
     * <table>
     *     <tr><th width="300">Condition</th><th width="200">Direction</th></tr>
     *     <tr><td>Primary greater than Secondary</td><td>Up</td></tr>
     *     <tr><td>Primary less than Secondary</td><td>Down</td></tr>
     *     <tr><td>Primary equal to Secondary</td><td>No direction, arrow hidden</td></tr>
     * </table>
     */
    isArrowEnabled?: boolean;

    /**
     * Controls the application of conditional colors.
     *
     * @see {@link IColorConfig} for configuration details.
     */
    colorConfig?: IColorConfig;

    /**
     * Controls the label displayed beneath the comparison value.
     *
     * @see {@link ILabelConfig} for configuration details.
     */
    labelConfig?: ILabelConfig;
}
