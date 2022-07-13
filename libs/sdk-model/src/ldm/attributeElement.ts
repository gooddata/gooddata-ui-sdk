// (C) 2019-2022 GoodData Corporation

/**
 * Attribute element represented by concrete display form
 *
 * @public
 */
export interface IAttributeElement {
    /**
     * Title of the attribute element for the given display form
     *
     * @remarks
     * Note that this can actually be null on some backends if your data contains NULL values.
     * We will change the type of this to string | null in the next major (since it is a breaking change),
     * but for now, if you expect NULLs in your data, treat this as string | null already.
     */
    readonly title: string;

    /**
     * Uri of the attribute element
     *
     * @remarks
     * Note that this can actually be null on some backends if your data contains NULL values.
     * We will change the type of this to string | null in the next major (since it is a breaking change),
     * but for now, if you expect NULLs in your data, treat this as string | null already.
     */
    readonly uri: string;
}
