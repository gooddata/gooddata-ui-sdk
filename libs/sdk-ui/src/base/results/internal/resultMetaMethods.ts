// (C) 2019-2020 GoodData Corporation
import flatMap = require("lodash/flatMap");
import {
    IAttributeDescriptor,
    IDataView,
    IDimensionDescriptor,
    IDimensionItemDescriptor,
    IMeasureDescriptor,
    IMeasureGroupDescriptor,
    IResultAttributeHeader,
    IResultHeader,
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
    isResultAttributeHeader,
} from "@gooddata/sdk-backend-spi";
import { idMatchMeasure, IMeasure, isPoPMeasure, isPreviousPeriodMeasure } from "@gooddata/sdk-model";

/**
 * Methods to access result metadata - dimension descriptors and result headers.
 *
 * @internal
 */
export interface IResultMetaMethods {
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
     * @returns attribute descriptors from all dimensions
     */
    attributeDescriptors(): IAttributeDescriptor[];

    /**
     * Returns attribute descriptors from particular dimension.
     *
     * @param dim - dimension index
     * @returns attribute descriptors, empty if none or if no such dimension
     */
    attributeDescriptorsForDim(dim: number): IAttributeDescriptor[];

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
     * Tests whether there are any headers in the dimension with the provided index.
     *
     * @param dim - dimension index.
     */
    hasNoHeadersInDim(dim: number): boolean;

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

//
//
//

type MeasureGroupHeaderIndex = {
    [id: string]: IMeasureDescriptor;
};

function findMeasureGroupHeader(dataView: IDataView): IMeasureGroupDescriptor | undefined {
    for (const dim of dataView.result.dimensions) {
        const measureGroupHeader = dim.headers.find(isMeasureGroupDescriptor);

        if (measureGroupHeader) {
            return measureGroupHeader;
        }
    }

    return undefined;
}

function buildMeasureHeaderIndex(measureGroup: IMeasureGroupDescriptor | undefined): MeasureGroupHeaderIndex {
    const items =
        measureGroup && measureGroup.measureGroupHeader.items ? measureGroup.measureGroupHeader.items : [];

    return items.reduce((acc: MeasureGroupHeaderIndex, val) => {
        const id = val.measureHeaderItem.localIdentifier;
        acc[id] = val;

        return acc;
    }, {});
}

class ResultMetaMethods implements IResultMetaMethods {
    /*
     * Derived property; measure group header found in dimensions
     */
    private readonly _measureGroupHeader: IMeasureGroupDescriptor | undefined;
    /*
     * Derived property; measure local id => measure group header item
     */
    private readonly _measureDescriptorByLocalId: MeasureGroupHeaderIndex;

    constructor(private readonly dataView: IDataView) {
        this._measureGroupHeader = findMeasureGroupHeader(dataView);
        this._measureDescriptorByLocalId = buildMeasureHeaderIndex(this._measureGroupHeader);
    }

    public dimensions(): IDimensionDescriptor[] {
        return this.dataView.result.dimensions;
    }

    public dimensionItemDescriptors(dimIdx: number): IDimensionItemDescriptor[] {
        const dim = this.dataView.result.dimensions[dimIdx];

        return dim && dim.headers ? dim.headers : [];
    }

    public attributeDescriptors(): IAttributeDescriptor[] {
        return flatMap(this.dataView.result.dimensions, (dim) => {
            return dim.headers.filter(isAttributeDescriptor);
        });
    }

    public attributeDescriptorsForDim(dim: number): IAttributeDescriptor[] {
        return (this.dataView.result.dimensions[dim]?.headers ?? []).filter(isAttributeDescriptor);
    }

    public measureGroupDescriptor(): IMeasureGroupDescriptor | undefined {
        return this._measureGroupHeader;
    }

    public measureDescriptors(): IMeasureDescriptor[] {
        const header = this.measureGroupDescriptor();

        return header ? header.measureGroupHeader.items : [];
    }

    public measureDescriptor(localId: string): IMeasureDescriptor | undefined {
        return this._measureDescriptorByLocalId[localId];
    }

    public hasNoHeadersInDim(dim: number): boolean {
        return this.dataView.headerItems[dim] && this.dataView.headerItems[dim].length === 0;
    }

    public allHeaders(): IResultHeader[][][] {
        return this.dataView.headerItems;
    }

    public attributeHeaders(): IResultAttributeHeader[][][] {
        return this.dataView.headerItems.map((dimension: IResultHeader[][]) => {
            return dimension.filter((headerList) =>
                isResultAttributeHeader(headerList[0]),
            ) as IResultAttributeHeader[][];
        });
    }

    public isDerivedMeasure(measureDescriptor: IMeasureDescriptor): boolean {
        const measureIdMatch = idMatchMeasure(measureDescriptor.measureHeaderItem.localIdentifier);

        return this.dataView.definition.measures.some((measure: IMeasure) => {
            if (!measureIdMatch(measure)) {
                return false;
            }

            return isPoPMeasure(measure) || isPreviousPeriodMeasure(measure);
        });
    }
}

export function newResultMetaMethods(dataView: IDataView): IResultMetaMethods {
    return new ResultMetaMethods(dataView);
}
