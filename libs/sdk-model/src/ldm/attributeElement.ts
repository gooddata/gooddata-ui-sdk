// (C) 2019-2020 GoodData Corporation

/**
 * Attribute element represented by concrete display form
 *
 * @public
 */
export interface IAttributeElement {
    /**
     * Title of the attribute element for the given display form
     */
    readonly title: string;

    /**
     * Uri of the attribute element
     */
    readonly uri: string;
}
