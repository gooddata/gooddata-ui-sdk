// (C) 2019-2020 GoodData Corporation
import {
    IDimensionDescriptor,
    IDimensionItemDescriptor,
    IMeasureDescriptor,
    IMeasureGroupDescriptor,
    IResultAttributeHeader,
    IResultHeader,
} from "@gooddata/sdk-backend-spi";

export interface IResultMethods {
    /**
     * @returns data view's dimension descriptors
     * @remarks see {@link IDimensionDescriptor} for more information of what this is
     */
    dimensions(): IDimensionDescriptor[];

    /**
     * @param dimIdx - index of dimension
     * @returns dimension item descriptors for desired dimension of the resulting data view
     */
    dimensionItemDescriptors(dimIdx: number): IDimensionItemDescriptor[];

    /**
     * @returns measure group descriptor, regardless of dimension in which it is located
     */
    measureGroupDescriptor(): IMeasureGroupDescriptor | undefined;

    /**
     * This is a convenience function to find measure group descriptor and return its measure descriptors.
     *
     * @returns measure descriptors, empty array if measure group header descriptor is not in any dimension
     */
    measureDescriptors(): IMeasureDescriptor[];

    /**
     * Finds measure descriptor by local identifier of the measure from execution definition.
     *
     * @param localId - local identifier of desired measure's descriptor
     * @returns undefined if no measure group header descriptor or no measure descriptor with the provided local identifier
     */
    measureDescriptor(localId: string): IMeasureDescriptor | undefined;

    /**
     * @returns all headers describing the data included in the data view
     */
    allHeaders(): IResultHeader[][][];

    /**
     * @returns filters headers for all dimensions so that only attribute headers for the dimensions
     *   are returned
     */
    attributeHeaders(): IResultAttributeHeader[][][];

    /**
     * Tests whether measure descriptor is for a derived measure - that is, the measure is specified in
     * execution definition and is either PoP measure or Previous Period Measure.
     *
     * @param measureDescriptor - input measure descriptor
     * @returns true if measure for the provide measure descriptor is in definition AND is either PoP or previous
     *  period; false otherwise.
     */
    isDerivedMeasure(measureDescriptor: IMeasureDescriptor): boolean;
}
