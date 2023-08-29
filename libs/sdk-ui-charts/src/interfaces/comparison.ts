// (C) 2023 GoodData Corporation

import { IColor } from "@gooddata/sdk-model";

/**
 * Algorithm
 *  change: (Primary - Secondary) / Secondary
 *  difference: Primary - Secondary
 *  ratio: Primary / Secondary
 *
 * @public
 */
export type CalculationType = "change" | "ratio" | "difference";

/**
 * @internal
 */
export const CalculateAs: Record<Uppercase<CalculationType>, CalculationType> = {
    RATIO: "ratio" as const,
    CHANGE: "change" as const,
    DIFFERENCE: "difference" as const,
};

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
     * This property specify the label for all conditions in cases flag isConditional is on
     */
    unconditionalValue?: string;
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
     * This property Defines number format of the comparison value
     *
     * See {@link ComparisonFormat} to knows the supported format
     *
     * @defaultValue based on calculation type
     */
    format?: ComparisonFormat;

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
