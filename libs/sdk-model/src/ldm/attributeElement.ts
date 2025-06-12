// (C) 2019-2023 GoodData Corporation

/**
 * Attribute element represented by concrete display form
 *
 * @public
 */
export interface IAttributeElement {
    /**
     * Title of the attribute element for the given display form
     */
    readonly title: string | null;

    /**
     * Uri of the attribute element
     */
    readonly uri: string | null;

    /**
     * Formatted title of attribute element for the given display form
     *
     * @remarks
     * The property represents the formatted form of title property for the given display form.
     * The formatted title should have precedence over original title to show a more readable form of dates.
     */
    readonly formattedTitle?: string;
}
