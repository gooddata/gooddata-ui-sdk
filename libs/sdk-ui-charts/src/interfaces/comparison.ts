// (C) 2023 GoodData Corporation

import { IColor } from "@gooddata/sdk-model";

/**
 * @public
 */
export enum CalculationType {
    /**
     * (Primary - Secondary) / Secondary
     */
    CHANGE = "change",

    /**
     * Primary - Secondary
     */
    DIFFERENCE = "difference",

    /**
     * Primary / Secondary
     */
    RATIO = "ratio",

    /**
     * Change: (Primary - Secondary) / Secondary
     * Difference: Primary - Secondary
     */
    CHANGE_DIFFERENCE = "change_difference",
}

/**
 * @public
 */
export enum ComparisonPositionType {
    /**
     * <table border="1">
     *     <tr><td style="text-align: center;" colspan="3">Primary</td></tr>
     *     <tr><td> Comparison </td><td>|</td><td> Secondary </td></tr>
     * </table>
     */
    LEFT = "left",

    /**
     * <table border="1">
     *    <tr><td style="text-align: center;" colspan="3">Primary</td></tr>
     *    <tr><td> Secondary </td><td>|</td><td> Comparison </td></tr>
     * </table>
     */
    RIGHT = "right",

    /**
     * <table border="1">
     *    <tr><td style="text-align: center;" colspan="3">Comparison</td></tr>
     *    <tr><td> Primary </td><td>|</td><td> Secondary </td></tr>
     * </table>
     */
    TOP = "top",
}

/**
 * comparison format type
 *
 * @remarks
 * Providing a null value will configure the format to inherit from the format of primary measure.
 *
 * @public
 */
export type ComparisonFormat = string | null;

/**
 * @public
 */
export interface IColorConfig {
    /**
     * Disable comparison color
     * <br/>
     *
     * @defaultValue false
     */
    disabled?: boolean;

    /**
     * Specify the color from colorPalette or provide custom color as RGB code
     * <br/>
     * Primary &gt; Secondary
     *
     * @defaultValue rgb(0, 193, 141)
     */
    positive?: IColor;

    /**
     * Specify the color from colorPalette or provide custom color as RGB code
     * <br/>
     * Primary &lt; Secondary
     *
     * @defaultValue rgb(229, 77, 64)
     */
    negative?: IColor;

    /**
     * Specify the color from colorPalette or provide custom color as RGB code
     * <br/>
     * Primary = Secondary
     *
     * @defaultValue rgb(148, 161, 173)
     */
    equals?: IColor;
}

/**
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
     * This property specify the label for all conditions in cases flag isConditional is on
     */
    unconditionalValue?: string;

    /**
     * This property specify the label of the positive comparison value
     * <br/>
     * Primary &gt; Secondary
     *
     * @defaultValue based on {@link CalculationType}
     *
     * <table border="1">
     *     <tr><td>Calculation type</td><td>Default label</td></tr>
     *     <tr><td>{@link CalculationType.CHANGE}</td><td>Increase</td></tr>
     *     <tr><td>{@link CalculationType.CHANGE_DIFFERENCE}</td><td>Increase</td></tr>
     *     <tr><td>{@link CalculationType.DIFFERENCE}</td><td>Increase</td></tr>
     *     <tr><td>{@link CalculationType.RATIO}</td><td>(Not applicable)</td></tr>
     * </table>
     */
    positive?: string;

    /**
     * This property specify the label of the negative comparison
     * <br/>
     * Primary &lt; Secondary
     *
     * @defaultValue based on {@link CalculationType}
     *
     * <table border="1">
     *     <tr><td>Calculation type</td><td>Default label</td></tr>
     *     <tr><td>{@link CalculationType.CHANGE}</td><td>Decrease</td></tr>
     *     <tr><td>{@link CalculationType.CHANGE_DIFFERENCE}</td><td>Decrease</td></tr>
     *     <tr><td>{@link CalculationType.DIFFERENCE}</td><td>Decrease</td></tr>
     *     <tr><td>{@link CalculationType.RATIO}</td><td>(Not applicable)</td></tr>
     * </table>
     */
    negative?: string;

    /**
     * This property specify the label of the equals comparison value
     * <br/>
     * Primary = Secondary
     *
     * <table border="1">
     *     <tr><td>Calculation type</td><td>Default label</td></tr>
     *     <tr><td>{@link CalculationType.CHANGE}</td><td>No change</td></tr>
     *     <tr><td>{@link CalculationType.CHANGE_DIFFERENCE}</td><td>No change</td></tr>
     *     <tr><td>{@link CalculationType.DIFFERENCE}</td><td>No difference</td></tr>
     *     <tr><td>{@link CalculationType.RATIO}</td><td>(Not applicable)</td></tr>
     * </table>
     */
    equals?: string;
}

/**
 * @public
 */
export interface IComparison {
    /**
     * enable/disable comparison
     * <br/>
     *
     * @defaultValue false
     */
    enabled: boolean;

    /**
     * This property defines how the comparison value will be calculated.
     * <br/>
     *
     * See {@link CalculationType} to understand the calculation method
     */
    calculationType?: CalculationType;

    /**
     * This property defines how the comparison value will be placed.
     * <br/>
     *
     * See {@link ComparisonPositionType} to know the supported positions
     *
     * @defaultValue {@link ComparisonPositionType.LEFT}
     */
    position?: ComparisonPositionType;

    /**
     * This property Defines number format of the comparison value
     *
     * See {@link ComparisonFormat} to knows the supported format
     *
     * @defaultValue based on calculation type
     */
    format?: ComparisonFormat;

    /**
     * This property defines the number format of the comparison sub-value when using {@link CalculationType.CHANGE_DIFFERENCE}.
     *
     * See {@link ComparisonFormat} to knows the supported format
     *
     * @defaultValue based on calculation type
     */
    subFormat?: ComparisonFormat;

    /**
     * This property controls Indicator/Arrow visibility of arrow trend indicator
     *
     * <table border="1">
     *     <tr><td width="60%">Condition</td><td>Direction</td></tr>
     *     <tr><td>Primary &gt; Secondary</td><td>Up</td></tr>
     *     <tr><td>Primary &lt; Secondary</td><td>Down</td></tr>
     *     <tr><td>Primary = Secondary</td><td>No direction, arrow is hidden</td></tr>
     * </table>
     */
    isArrowEnabled?: boolean;

    /**
     * This property controls plus and minus sign before the number
     *
     * <table border="1">
     *     <tr><td width="60%">Condition</td><td>Sign</td></tr>
     *     <tr><td>Primary &gt; Secondary</td><td>+</td></tr>
     *     <tr><td>Primary &lt; Secondary</td><td>-</td></tr>
     *     <tr><td>Primary = Secondary</td><td>Sign is hidden</td></tr>
     * </table>
     */
    isSignEnabled?: boolean;

    /**
     * This property controls application of conditional colors
     * <br/>
     *
     * See {@link IColorConfig} to understand config details
     *
     * @remarks
     * Note: this property has priority over colors defined within number format
     */
    colorConfig?: IColorConfig;

    /**
     * This property controls string under the comparison value
     * <br/>
     *
     * See {@link ILabelConfig} to understand config details
     */
    labelConfig?: ILabelConfig;
}
